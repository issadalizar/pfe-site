import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  bulkCreateUsers,
  updateUserAndAccount  // ← Changé de updateUserWithAccount à updateUserAndAccount
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser);
router.post('/bulk', bulkCreateUsers);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/with-account', updateUserAndAccount); // ← Changé ici aussi
router.patch('/:id/toggle', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;