import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createFacture,
    getMyFactures,
    getFactureById,
    getAllFactures,
    regenerateFacture
} from '../controllers/factureController.js';

const router = express.Router();

// Routes protégées (client)
router.post('/', protect, createFacture);
router.get('/my-factures', protect, getMyFactures);
router.get('/:id', protect, getFactureById);
router.post('/:orderId/regenerate', protect, regenerateFacture);

// Routes admin
router.get('/', protect, adminOnly, getAllFactures);

export default router;