// backend/routes/specificationRoutes.js
import express from 'express';
import {
  getProductSpecifications,
  getGroupedSpecifications,
  createSpecification,
  createBulkSpecifications,
  updateSpecification,
  deleteSpecification,
  deleteProductSpecifications,
  reorderSpecifications,
  copySpecifications
} from '../controllers/specificationController.js';

const router = express.Router();

// Routes pour les spécifications groupées
router.get('/product/:productId/grouped', getGroupedSpecifications);

// Routes pour les spécifications d'un produit
router.get('/product/:productId', getProductSpecifications);
router.delete('/product/:productId', deleteProductSpecifications);
router.post('/product/:productId/bulk', createBulkSpecifications);

// Routes pour le réordonnancement
router.patch('/reorder/:productId', reorderSpecifications);

// Routes pour la copie
router.post('/copy', copySpecifications);

// Routes CRUD standards
router.post('/', createSpecification);
router.put('/:id', updateSpecification);
router.delete('/:id', deleteSpecification);

export default router;