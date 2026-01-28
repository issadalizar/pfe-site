import User from '../models/User.js';
// POST - Créer un nouvel utilisateur
export const createUser = async (req, res) => {
  try {
    const { 
      client_code,      // ✅ Changé de codeClient
      client_name,      // ✅ Changé de nomClient
      role, 
      article, 
      description, 
      date, 
      facture_num,      // ✅ Changé de numeroFacture
      quantite, 
      montant, 
      actif 
    } = req.body;

    // Validation des champs requis
    if (!client_code || !client_name || !article || !facture_num || quantite === undefined || montant === undefined) {
      return res.status(400).json({ 
        error: 'Les champs codeClient, nomClient, article, numeroFacture, quantite et montant sont requis' 
      });
    }

    // Créer le nouvel utilisateur
    // Dans createUser (userController.js) :
const newUser = new User({
  client_code: client_code.toUpperCase(),    // CORRIGÉ
  client_name: client_name,                  // CORRIGÉ
  role: role || 'client',
  article,
  description: description || '',
  date: date ? new Date(date) : new Date(),
  facture_num: facture_num,                  // CORRIGÉ
  quantite: Number(quantite),
  montant: Number(montant),
  actif: actif !== undefined ? actif : true, // Maintenant possible avec le schéma corrigé
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
  res.status(501).json({ message: 'Fonctionnalité non implémentée' });
};

// GET - Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ date: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des utilisateurs',
      details: error.message 
    });
  }
};

// GET - Récupérer un utilisateur par ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
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

// PUT - Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const { 
      client_code,      
      client_name,      // ✅ Changé
      role, 
      article, 
      description, 
      date, 
      facture_num,      // ✅ Changé
      quantite, 
      montant, 
      actif
    } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs
    if (client_code) user.client_code = client_code.toUpperCase();
    if (client_name) user.nomClient = client_name;
    if (role) user.role = role;
    if (article) user.article = article;
    if (description !== undefined) user.description = description;
    if (date) user.date = new Date(date);
    if (facture_num) user.numeroFacture = facture_num;
    if (quantite !== undefined) user.quantite = Number(quantite);
    if (montant !== undefined) user.montant = Number(montant);
    if (actif !== undefined) user.actif = actif;

    const updatedUser = await user.save();
    res.json(updatedUser);
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

// PATCH - Activer/désactiver un utilisateur
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.actif = !user.actif;
    const updatedUser = await user.save();
    res.json(updatedUser);
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
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.json({ message: 'Utilisateur supprimé avec succès', user });
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
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