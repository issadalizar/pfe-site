import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router(); //Cette ligne crée un objet router.

<<<<<<< HEAD
// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
=======
// Routes CRUD de base
router.post('/', createAccount);
router.post('/bulk', bulkCreateAccounts);//Cette route permet de créer plusieurs comptes en une seule requête.
router.get('/', getAllAccounts);
router.get('/:id', getAccountById);
router.get('/email/:email', getAccountByEmail);
router.put('/:id', updateAccount);
router.patch('/:id/change-password', changePassword);
router.patch('/:id/toggle', toggleAccountStatus);//Cette route change l’état du compte
router.patch('/:id/reset-login-attempts', resetLoginAttempts);//Cette route remet à zéro le nombre de tentatives de connexion pour un compte donné.
router.delete('/:id', deleteAccount);
>>>>>>> 0750bfa04c8bbb0aa43c45ae2e85416cd5b21824

// Routes protégées
router.get('/profile', protect, getProfile);