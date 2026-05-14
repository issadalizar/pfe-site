import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Account from '../models/Account.js'; // AJOUT: Importer Account
import { sendPasswordResetEmail } from '../utils/emailService.js';

// Générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/register - Inscription client
export const register = async (req, res) => {
    try {
        const { client_name, email, password, telephone, adresse } = req.body;

        // Validation des champs requis
        if (!client_name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nom, email et mot de passe sont requis.'
            });
        }

        // MODIFICATION: Vérifier si l'email existe déjà dans Account
        const existingAccount = await Account.findOne({ email: email.toLowerCase() });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                error: 'Cet email est déjà utilisé.'
            });
        }

        // Générer un code client automatique
        const userCount = await User.countDocuments();
        const client_code = `CLT-${String(userCount + 1).padStart(4, '0')}`;

        // MODIFICATION: 1. Créer l'utilisateur (sans email, password, actif)
        const user = new User({
            client_code,
            client_name,
            telephone: telephone || '',
            adresse: adresse || '',
            isAdmin: false
            // SUPPRIMÉ: email, password, actif
        });

        await user.save();

        // AJOUT: 2. Créer le compte associé (avec email, password, actif)
        const account = new Account({
            email: email.toLowerCase(),
            password, // Sera hashé automatiquement par le pre-save hook d'Account
            actif: true,
            user: user._id
        });

        await account.save();

        // Générer le token
        const token = generateToken(user);

        // MODIFICATION: Retourner les informations combinées
        res.status(201).json({
            success: true,
            message: 'Inscription réussie !',
            token,
            user: {
                ...user.toJSON(),
                email: account.email,
                actif: account.actif
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }
        console.error('Erreur register:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'inscription.',
            details: error.message
        });
    }
};

// POST /api/auth/login - Connexion (client ou admin)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email et mot de passe sont requis.'
            });
        }

        // MODIFICATION: Chercher d'abord dans Account, puis peupler User
        const account = await Account.findOne({ email: email.toLowerCase() })
            .populate('user');

        if (!account) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect.'
            });
        }

        // Vérifier que le compte est actif
        if (!account.actif) {
            return res.status(401).json({
                success: false,
                error: 'Votre compte a été désactivé. Contactez l\'administrateur.'
            });
        }

        // Vérifier le mot de passe (utilise la méthode d'Account)
        const isMatch = await account.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect.'
            });
        }

        // Générer le token
        const token = generateToken(account.user);

        res.json({
            success: true,
            message: 'Connexion réussie !',
            token,
            user: {
                ...account.user.toJSON(),
                email: account.email,
                actif: account.actif
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la connexion.',
            details: error.message
        });
    }
};

// GET /api/auth/profile - Profil de l'utilisateur connecté
export const getProfile = async (req, res) => {
    try {
        // Récupérer l'utilisateur et son compte
        const user = await User.findById(req.user._id);
        const account = await Account.findOne({ user: req.user._id });

        if (!user || !account) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé.'
            });
        }

        res.json({
            success: true,
            user: {
                ...user.toJSON(),
                email: account.email,
                actif: account.actif
            }
        });
    } catch (error) {
        console.error('Erreur getProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du profil.'
        });
    }
};

// POST /api/auth/forgot-password - Demander un email de reinitialisation
export const forgotPassword = async (req, res) => {
    // Reponse generique : on repond toujours pareil pour eviter l'enumeration d'emails.
    const genericResponse = {
        success: true,
        message: 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.'
    };

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'L\'email est requis.'
            });
        }

        const account = await Account.findOne({ email: email.toLowerCase() });

        // Email inconnu ou compte desactive : reponse generique sans envoyer de mail
        if (!account || !account.actif) {
            return res.json(genericResponse);
        }

        // Generer un token et l'enregistrer (hashe) dans l'Account
        const rawToken = account.createPasswordResetToken();
        await account.save({ validateBeforeSave: false });

        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetURL = `${frontendURL}/reset-password?token=${rawToken}`;

        const result = await sendPasswordResetEmail(account.email, resetURL);

        if (!result.success) {
            // Echec d'envoi : nettoyer pour que le token ne reste pas valide sans email recu
            account.passwordResetToken = null;
            account.passwordResetExpires = null;
            await account.save({ validateBeforeSave: false });
            return res.status(500).json({
                success: false,
                error: 'Impossible d\'envoyer l\'email. Veuillez reessayer plus tard.'
            });
        }

        return res.json(genericResponse);
    } catch (error) {
        console.error('Erreur forgotPassword:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de la demande de reinitialisation.'
        });
    }
};

// POST /api/auth/reset-password - Definir un nouveau mot de passe a partir du token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Token et nouveau mot de passe sont requis.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Le nouveau mot de passe doit contenir au moins 6 caracteres.'
            });
        }

        const hashed = crypto.createHash('sha256').update(token).digest('hex');

        const account = await Account.findOne({
            passwordResetToken: hashed,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!account) {
            return res.status(400).json({
                success: false,
                error: 'Lien invalide ou expire. Veuillez refaire une demande.'
            });
        }

        account.password = newPassword; // re-hashe via le pre-save hook
        account.passwordResetToken = null;
        account.passwordResetExpires = null;
        await account.save();

        return res.json({
            success: true,
            message: 'Mot de passe reinitialise avec succes. Vous pouvez vous connecter.'
        });
    } catch (error) {
        console.error('Erreur resetPassword:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de la reinitialisation du mot de passe.'
        });
    }
};

// PUT /api/auth/profile - Modifier le profil de l'utilisateur connecté
export const updateProfile = async (req, res) => {
    try {
        const { client_name, telephone, adresse, email, currentPassword, newPassword } = req.body;

        // Récupérer l'utilisateur
        const user = await User.findById(req.user._id);
        
        // Récupérer le compte associé
        const account = await Account.findOne({ user: req.user._id }).select('+password');

        if (!user || !account) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé.'
            });
        }

        // Mettre à jour les champs modifiables de User
        if (client_name !== undefined) user.client_name = client_name;
        if (telephone !== undefined) user.telephone = telephone;
        if (adresse !== undefined) user.adresse = adresse;

        // Mettre à jour l'email si fourni
        if (email !== undefined && email !== account.email) {
            // Vérifier si le nouvel email n'est pas déjà utilisé
            const existingAccount = await Account.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: account._id }
            });
            
            if (existingAccount) {
                return res.status(400).json({
                    success: false,
                    error: 'Cet email est déjà utilisé.'
                });
            }
            
            account.email = email.toLowerCase();
        }

        // Changement de mot de passe (optionnel)
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Le mot de passe actuel est requis pour changer le mot de passe.'
                });
            }

            const isMatch = await account.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    error: 'Le mot de passe actuel est incorrect.'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
                });
            }

            account.password = newPassword; // Sera hashé automatiquement
        }

        // Sauvegarder les modifications
        await user.save();
        await account.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès !',
            user: {
                ...user.toJSON(),
                email: account.email,
                actif: account.actif
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }
        console.error('Erreur updateProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour du profil.'
        });
    }
};