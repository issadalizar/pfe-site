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

const router = express.Router();

// Routes CRUD de base
router.post('/', createAccount);
router.post('/bulk', bulkCreateAccounts);
router.get('/', getAllAccounts);
router.get('/:id', getAccountById);
router.get('/email/:email', getAccountByEmail);
router.put('/:id', updateAccount);
router.patch('/:id/change-password', changePassword);
router.patch('/:id/toggle', toggleAccountStatus);
router.patch('/:id/reset-login-attempts', resetLoginAttempts);
router.delete('/:id', deleteAccount);

export default router;