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
  getLowStockProducts,
  getStockStats
} from '../controllers/productController.js';

const router = express.Router();

// Routes pour les produits
router.route('/')
  .get(getAllProducts)
  .post(createProduct);

// Route pour les produits par catégorie (en français)
router.route('/categorie/:categorieId')
  .get(getProductsByCategory);

// Routes pour un produit spécifique
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// Routes pour les alertes stock (en français)
router.route('/rupture-stock')
  .get(getOutOfStockProducts);

router.route('/stock-faible')
  .get(getLowStockProducts);

router.route('/statistiques-stock')
  .get(getStockStats);

export default router;