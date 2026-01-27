import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  bulkCreateUsers //bch njam nzid users koul m3a b3thoum fi nafs wa9t
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser);
router.post('/bulk', bulkCreateUsers); // Route pour la création en masse des utilisateurs
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/toggle', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;