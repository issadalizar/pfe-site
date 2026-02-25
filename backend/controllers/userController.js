import User from '../models/User.js';

//req contient les données envoyées par le client 
//res est utilisé pour envoyer une réponse au client
export const createUser = async (req, res) => {
  try {
    const { 
      client_code,      
      client_name,
      email,
      adresse,
      telephone,
      isAdmin,          
      actif 
    } = req.body;

    // Validation des champs requis
    if (!client_code || !client_name) {
      return res.status(400).json({ 
        error: 'Les champs codeClient et nomClient sont requis' 
      });
    }

    // Validation email si fourni
    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Format d\'email invalide' 
        });
      }
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      client_code: client_code.toUpperCase(),    
      client_name: client_name,
      email: email || '',
      adresse: adresse || '',
      telephone: telephone || '',
      isAdmin: isAdmin !== undefined ? isAdmin : false, 
      actif: actif !== undefined ? actif : true, 
    });
    
    // Enregistrer dans la base de données
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

    // Validation des emails pour chaque utilisateur
    for (const user of users) {
      if (user.email) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(user.email)) {
          return res.status(400).json({ 
            error: `Format d'email invalide pour l'utilisateur ${user.client_name || 'inconnu'}` 
          });
        }
      }
    }

    // fonction pour traiter chaque utilisateur avant de les insérer dans la base de données
    const processedUsers = users.map(user => ({
      //map pour transformer chaque utilisateur du tableau
      ...user,
      client_code: user.client_code?.toUpperCase(),
      email: user.email || '',
      adresse: user.adresse || '',
      telephone: user.telephone || '',
      isAdmin: user.isAdmin !== undefined ? user.isAdmin : false,
      actif: user.actif !== undefined ? user.actif : true
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

// GET - Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ dateCreation: -1 });
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
      client_name,
      email,
      adresse,
      telephone,
      isAdmin,           
      actif
    } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Validation email si fourni
    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Format d\'email invalide' 
        });
      }
    }

    // Mettre à jour les champs
    if (client_code) user.client_code = client_code.toUpperCase();
    if (client_name) user.client_name = client_name;
    if (email !== undefined) user.email = email;
    if (adresse !== undefined) user.adresse = adresse;
    if (telephone !== undefined) user.telephone = telephone;
    if (isAdmin !== undefined) user.isAdmin = isAdmin; 
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