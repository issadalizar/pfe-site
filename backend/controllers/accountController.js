import Account from '../models/Account.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Créer un compte pour un utilisateur existant
export const createAccount = async (req, res) => {
  try {
    const { userId, email, password, actif } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si un compte existe déjà pour cet utilisateur
    const existingAccount = await Account.findOne({ user: userId });
    if (existingAccount) {
      return res.status(400).json({ error: 'Un compte existe déjà pour cet utilisateur' });
    }

    // Vérifier si l'email est déjà utilisé
    const emailExists = await Account.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer le nouveau compte
    const newAccount = new Account({
      email: email.toLowerCase(),
      password,
      actif: actif !== undefined ? actif : true,
      user: userId
    });

    const savedAccount = await newAccount.save();
    
    // Peupler les informations de l'utilisateur
    await savedAccount.populate('user');

    res.status(201).json(savedAccount);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: Object.values(error.errors).map(e => e.message).join(', ') 
      });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la création du compte',
      details: error.message 
    });
  }
};

// Création en masse de comptes
export const bulkCreateAccounts = async (req, res) => {
  try {
    const accounts = req.body;
    
    if (!Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ 
        error: 'Veuillez fournir un tableau de comptes' 
      });
    }

    const results = {
      success: [],
      errors: []
    };

    for (const accountData of accounts) {
      try {
        // Vérifier si l'utilisateur existe
        const user = await User.findById(accountData.userId);
        if (!user) {
          results.errors.push({
            email: accountData.email,
            error: 'Utilisateur non trouvé'
          });
          continue;
        }

        // Vérifier si un compte existe déjà
        const existingAccount = await Account.findOne({ 
          $or: [
            { email: accountData.email.toLowerCase() },
            { user: accountData.userId }
          ]
        });

        if (existingAccount) {
          results.errors.push({
            email: accountData.email,
            error: 'Email ou utilisateur déjà utilisé'
          });
          continue;
        }

        // Créer le compte
        const newAccount = new Account({
          email: accountData.email.toLowerCase(),
          password: accountData.password,
          actif: accountData.actif !== undefined ? accountData.actif : true,
          user: accountData.userId
        });

        const savedAccount = await newAccount.save();
        await savedAccount.populate('user');
        results.success.push(savedAccount);
      } catch (error) {
        results.errors.push({
          email: accountData.email,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `${results.success.length} comptes créés, ${results.errors.length} erreurs`,
      results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la création en masse',
      details: error.message 
    });
  }
};

// Récupérer tous les comptes
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate('user')
      .sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des comptes',
      details: error.message 
    });
  }
};

// Récupérer un compte par ID
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('user');
    
    if (account) {
      res.json(account);
    } else {
      res.status(404).json({ error: 'Compte non trouvé' });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID invalide' });
    }
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du compte',
      details: error.message 
    });
  }
};

// Récupérer un compte par email
export const getAccountByEmail = async (req, res) => {
  try {
    const account = await Account.findOne({ email: req.params.email.toLowerCase() })
      .populate('user');
    
    if (account) {
      res.json(account);
    } else {
      res.status(404).json({ error: 'Compte non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du compte',
      details: error.message 
    });
  }
};

// Mettre à jour un compte
export const updateAccount = async (req, res) => {
  try {
    const { email, password, actif } = req.body;
    
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Vérifier si le nouvel email n'est pas déjà utilisé
    if (email && email !== account.email) {
      const emailExists = await Account.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      account.email = email.toLowerCase();
    }

    if (password) {
      account.password = password;
    }

    if (actif !== undefined) {
      account.actif = actif;
    }

    const updatedAccount = await account.save();
    await updatedAccount.populate('user');
    
    res.json(updatedAccount);
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

// Changer le mot de passe
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await account.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    account.password = newPassword;
    const updatedAccount = await account.save();
    
    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors du changement de mot de passe',
      details: error.message 
    });
  }
};

// Activer/désactiver un compte
export const toggleAccountStatus = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    account.actif = !account.actif;
    const updatedAccount = await account.save();
    await updatedAccount.populate('user');
    
    res.json(updatedAccount);
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

// Supprimer un compte
export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    
    if (account) {
      res.json({ message: 'Compte supprimé avec succès', account });
    } else {
      res.status(404).json({ error: 'Compte non trouvé' });
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

// Réinitialiser les tentatives de connexion
export const resetLoginAttempts = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    account.loginAttempts = 0;
    account.lockUntil = undefined;
    await account.save();

    res.json({ message: 'Tentatives de connexion réinitialisées' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la réinitialisation',
      details: error.message 
    });
  }
};