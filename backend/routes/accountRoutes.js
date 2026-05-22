import express from 'express';
import {
  createAccount,
  bulkCreateAccounts,
  getAllAccounts,
  getAccountById,
  getAccountByEmail,
  updateAccount,
  changePassword,
  toggleAccountStatus,
  deleteAccount,
  resetLoginAttempts
} from '../controllers/accountController.js';

const router = express.Router(); //Cette ligne crée un objet router.

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

export default router;