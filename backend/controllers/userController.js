import User from '../models/User.js';
import Account from '../models/Account.js';

// POST - Créer un utilisateur
export const createUser = async (req, res) => {
  try {
    const { 
      client_code,      
      client_name,
      adresse,
      telephone,
      isAdmin
    } = req.body;

    if (!client_code || !client_name) {
      return res.status(400).json({ 
        error: 'Les champs client_code et client_name sont requis' 
      });
    }

    // Créer le nouvel utilisateur 
    const newUser = new User({
      client_code: client_code.toUpperCase(),    
      client_name: client_name,
      adresse: adresse || '',
      telephone: telephone || '',
      isAdmin: isAdmin !== undefined ? isAdmin : false
    });
    
    const savedUser = await newUser.save();
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

    // Traiter chaque utilisateur
    const processedUsers = users.map(user => ({
      client_code: user.client_code?.toUpperCase(),
      client_name: user.client_name,
      adresse: user.adresse || '',
      telephone: user.telephone || '',
      isAdmin: user.isAdmin !== undefined ? user.isAdmin : false
    }));

    const savedUsers = await User.insertMany(processedUsers);
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
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    const usersWithAccounts = await Promise.all(
      users.map(async (user) => {
        const account = await Account.findOne({ user: user._id });
        let validCreatedAt = user.createdAt;
        if (!validCreatedAt || isNaN(new Date(validCreatedAt).getTime())) {
          validCreatedAt = new Date();
          console.log(`Date invalide pour ${user.client_name}, utilisation de la date actuelle`);
        }
        
        return {
          _id: user._id,
          client_code: user.client_code,
          client_name: user.client_name,
          adresse: user.adresse,
          telephone: user.telephone,
          isAdmin: user.isAdmin,
          createdAt: validCreatedAt, 
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
    } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
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
    const account = await Account.findOne({ user: user._id });
    if (!account) {
      return res.status(404).json({ error: 'Compte associé non trouvé' });
    }

    // Modifier le statut (actif/inactif)
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

// DELETE - Supprimer un utilisateur 
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Utilisateur et compte associé supprimés avec succès',
      user: user.toJSON()
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

// Mettre à jour User et Account en une seule requête
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