import User from '../models/User.js';
import Account from '../models/Account.js';

// req contient les données envoyées par le client 
// res est utilisé pour envoyer une réponse au client

// POST - Créer un utilisateur (SANS email, password, actif)
export const createUser = async (req, res) => {
  try {
    const { 
      client_code,      
      client_name,
      adresse,
      telephone,
      isAdmin
      // SUPPRIMÉ: email, actif (maintenant dans Account)
    } = req.body;

    // Validation des champs requis
    if (!client_code || !client_name) {
      return res.status(400).json({ 
        error: 'Les champs codeClient et nomClient sont requis' 
      });
    }

    // Créer le nouvel utilisateur SANS email/actif
    const newUser = new User({
      client_code: client_code.toUpperCase(),    
      client_name: client_name,
      adresse: adresse || '',
      telephone: telephone || '',
      isAdmin: isAdmin !== undefined ? isAdmin : false
      // SUPPRIMÉ: email, actif
    });
    
    // Enregistrer dans la base de données
    const savedUser = await newUser.save();
    
    // Note: Le compte (Account) doit être créé séparément via /api/accounts
    // Ou via l'inscription /api/auth/register
    
    res.status(201).json(savedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: Object.values(error.errors).map(e => e.message).join(', ') 
      });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la création de l\'utilisateur',
      details: error.message 
    });
  }
};

// POST - Créer plusieurs utilisateurs en masse (Bulk Create)
export const bulkCreateUsers = async (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ 
        error: 'Veuillez fournir un tableau d\'utilisateurs' 
      });
    }

    // SUPPRIMÉ: Validation des emails (plus dans User)

    // Traiter chaque utilisateur
    const processedUsers = users.map(user => ({
      client_code: user.client_code?.toUpperCase(),
      client_name: user.client_name,
      adresse: user.adresse || '',
      telephone: user.telephone || '',
      isAdmin: user.isAdmin !== undefined ? user.isAdmin : false
      // SUPPRIMÉ: email, actif
    }));

    const savedUsers = await User.insertMany(processedUsers);
    
    // Note: Les comptes (Account) doivent être créés séparément
    
    res.status(201).json({
      message: `${savedUsers.length} utilisateurs créés avec succès`,
      users: savedUsers
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: Object.values(error.errors).map(e => e.message).join(', ') 
      });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la création en masse',
      details: error.message 
    });
  }
};

// GET - Récupérer tous les utilisateurs avec leurs comptes associés
// GET - Récupérer tous les utilisateurs avec leurs comptes associés
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    // Récupérer tous les comptes associés
    const usersWithAccounts = await Promise.all(
      users.map(async (user) => {
        const account = await Account.findOne({ user: user._id });
        
        // FORCER une date valide pour createdAt
        let validCreatedAt = user.createdAt;
        
        // Si createdAt n'existe pas ou est invalide, utiliser la date actuelle
        if (!validCreatedAt || isNaN(new Date(validCreatedAt).getTime())) {
          validCreatedAt = new Date(); // Date actuelle comme fallback
          console.log(`⚠️ Date invalide pour ${user.client_name}, utilisation de la date actuelle`);
        }
        
        return {
          _id: user._id,
          client_code: user.client_code,
          client_name: user.client_name,
          adresse: user.adresse,
          telephone: user.telephone,
          isAdmin: user.isAdmin,
          createdAt: validCreatedAt,  // Date garantie valide
          email: account?.email || null,
          actif: account?.actif || false
        };
      })
    );
    
    res.json(usersWithAccounts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des utilisateurs',
      details: error.message 
    });
  }
};

// GET - Récupérer un utilisateur par ID avec son compte
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const account = await Account.findOne({ user: user._id });
    
    res.json({
      ...user.toJSON(),
      email: account?.email || null,
      actif: account?.actif || false
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID invalide' });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'utilisateur',
      details: error.message 
    });
  }
};

// PUT - Mettre à jour un utilisateur (seulement les champs User)
export const updateUser = async (req, res) => {
  try {
    const { 
      client_code,      
      client_name,
      adresse,
      telephone,
      isAdmin
      // SUPPRIMÉ: email, actif (maintenant dans Account)
    } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs User uniquement
    if (client_code) user.client_code = client_code.toUpperCase();
    if (client_name) user.client_name = client_name;
    if (adresse !== undefined) user.adresse = adresse;
    if (telephone !== undefined) user.telephone = telephone;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    const updatedUser = await user.save();
    
    // Récupérer le compte associé pour la réponse
    const account = await Account.findOne({ user: user._id });

    res.json({
      ...updatedUser.toJSON(),
      email: account?.email || null,
      actif: account?.actif || false
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID invalide' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: Object.values(error.errors).map(e => e.message).join(', ') 
      });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour',
      details: error.message 
    });
  }
};

// PATCH - Activer/désactiver un utilisateur (modifie le champ actif dans Account)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer le compte associé
    const account = await Account.findOne({ user: user._id });
    if (!account) {
      return res.status(404).json({ error: 'Compte associé non trouvé' });
    }

    // Modifier le statut dans Account (plus dans User)
    account.actif = !account.actif;
    await account.save();

    res.json({
      ...user.toJSON(),
      email: account.email,
      actif: account.actif
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID invalide' });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la modification du statut',
      details: error.message 
    });
  }
};

// DELETE - Supprimer un utilisateur et son compte associé
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Supprimer d'abord le compte associé
    await Account.deleteOne({ user: user._id });
    
    // Puis supprimer l'utilisateur
    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Utilisateur et compte associé supprimés avec succès',
      user: {
        ...user.toJSON(),
        message: 'Compte également supprimé'
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID invalide' });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la suppression',
      details: error.message 
    });
  }
};

// AJOUT: Nouvelle fonction pour mettre à jour User et Account en une seule requête
export const updateUserAndAccount = async (req, res) => {
  try {
    const { 
      client_code, client_name, adresse, telephone, isAdmin,
      email, actif 
    } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const account = await Account.findOne({ user: user._id });
    if (!account) {
      return res.status(404).json({ error: 'Compte associé non trouvé' });
    }

    // Mettre à jour User
    if (client_code) user.client_code = client_code.toUpperCase();
    if (client_name) user.client_name = client_name;
    if (adresse !== undefined) user.adresse = adresse;
    if (telephone !== undefined) user.telephone = telephone;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    // Mettre à jour Account
    if (email !== undefined && email !== account.email) {
      const existingAccount = await Account.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: account._id }
      });
      if (existingAccount) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      account.email = email.toLowerCase();
    }
    
    if (actif !== undefined) account.actif = actif;

    // Sauvegarder les deux
    await user.save();
    await account.save();

    res.json({
      ...user.toJSON(),
      email: account.email,
      actif: account.actif
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour',
      details: error.message 
    });
  }
};