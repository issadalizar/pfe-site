import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware pour protéger les routes - vérifie le token JWT
export const protect = async (req, res, next) => {
    try {
        let token;

        // Vérifier le header Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Accès non autorisé. Veuillez vous connecter.'
            });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupérer l'utilisateur
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé.'
            });
        }

        if (!user.actif) {
            return res.status(401).json({
                success: false,
                error: 'Votre compte a été désactivé.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token invalide.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expiré. Veuillez vous reconnecter.'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Erreur d\'authentification.'
        });
    }
};

// Middleware pour vérifier le rôle admin
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Accès réservé aux administrateurs.'
        });
    }
};
