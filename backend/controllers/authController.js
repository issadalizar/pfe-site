import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Cet email est déjà utilisé.'
            });
        }

        // Générer un code client automatique
        const userCount = await User.countDocuments();
        const client_code = `CLT-${String(userCount + 1).padStart(4, '0')}`;

        // Créer l'utilisateur
        const user = new User({
            client_code,
            client_name,
            email: email.toLowerCase(),
            password,
            telephone: telephone || '',
            adresse: adresse || '',
            isAdmin: false,
            actif: true
        });

        await user.save();

        // Générer le token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie !',
            token,
            user: user.toJSON()
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

        // Chercher l'utilisateur (inclure le password pour la comparaison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect.'
            });
        }

        // Vérifier que le compte est actif
        if (!user.actif) {
            return res.status(401).json({
                success: false,
                error: 'Votre compte a été désactivé. Contactez l\'administrateur.'
            });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect.'
            });
        }

        // Générer le token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Connexion réussie !',
            token,
            user: user.toJSON()
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
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé.'
            });
        }

        res.json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Erreur getProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du profil.'
        });
    }
};

// PUT /api/auth/profile - Modifier le profil de l'utilisateur connecté
export const updateProfile = async (req, res) => {
    try {
        const { client_name, telephone, adresse, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé.'
            });
        }

        // Mettre à jour les champs modifiables
        if (client_name !== undefined) user.client_name = client_name;
        if (telephone !== undefined) user.telephone = telephone;
        if (adresse !== undefined) user.adresse = adresse;

        // Changement de mot de passe (optionnel)
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Le mot de passe actuel est requis pour changer le mot de passe.'
                });
            }

            const isMatch = await user.comparePassword(currentPassword);
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

            user.password = newPassword;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès !',
            user: user.toJSON()
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
