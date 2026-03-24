// routes/products.js
import express from 'express';
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOutOfStockProducts,
  getStockStats
} from '../controllers/productController.js';

const router = express.Router();

// Routes specifiques EN PREMIER (avant /:id)
router.route('/rupture-stock').get(getOutOfStockProducts);
router.route('/statistiques-stock').get(getStockStats);
router.route('/categorie/:categorieId').get(getProductsByCategory);

// Routes generales
router.route('/').get(getAllProducts).post(createProduct);

// Route generique /:id EN DERNIER
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;