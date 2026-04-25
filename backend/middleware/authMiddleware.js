//jsonwebtoken est utilisé pour vérifier les tokens d'authentification et protéger les routes.
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';

export const protect = async (req, res, next) => {
  try {
    let token;
// Vérifier que le token est présent dans les headers(les en-têtes de la requête) et commence par "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Non autorisé - Token manquant' 
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Non autorisé - Utilisateur inexistant' 
      });
    }

    // Vérifier que le compte est actif
    const account = await Account.findOne({ user: user._id });
    if (!account || !account.actif) {
      return res.status(401).json({ 
        success: false, 
        error: 'Compte désactivé' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    try {
      if (!res.headersSent) {
        return res.status(401).json({ 
          success: false, 
          error: 'Non autorisé - Token invalide' 
        });
      }
    } catch (e) {
      console.error('authMiddleware: impossible d\'envoyer 401', e);
    }
    return;
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      error: 'Accès interdit - Administrateur requis' 
    });
  }
};