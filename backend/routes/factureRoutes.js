import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createFacture,
    getMyFactures,
    getFactureById,
    getAllFactures
} from '../controllers/factureController.js';

const router = express.Router();

// Routes protégées (client)
router.post('/', protect, createFacture);
router.get('/my-factures', protect, getMyFactures);
router.get('/:id', protect, getFactureById);

// Routes admin
router.get('/', protect, adminOnly, getAllFactures);

export default router;
