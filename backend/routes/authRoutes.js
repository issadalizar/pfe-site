import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Routes protégées
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
