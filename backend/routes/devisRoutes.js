import express from 'express';
import {
    getAllDevis,
    getDevisById,
    createDevis,
    updateDevisStatus,
    deleteDevis,
    getDevisStats
} from '../controllers/devisController.js';

const router = express.Router();

// Routes publiques
router.post('/', createDevis);

// Routes protégées (admin) - à mettre avec middleware d'auth plus tard
router.get('/', getAllDevis);
router.get('/stats', getDevisStats);
router.get('/:id', getDevisById);
router.patch('/:id/status', updateDevisStatus);
router.delete('/:id', deleteDevis);

export default router;