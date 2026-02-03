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
  .get(getAllProducts)       // GET /api/products
  .post(createProduct);      // POST /api/products

router.route('/category/:categoryId')
  .get(getProductsByCategory); // GET /api/products/category/:categoryId

router.route('/:id')
  .get(getProductById)       // GET /api/products/:id
  .put(updateProduct)        // PUT /api/products/:id
  .delete(deleteProduct);    // DELETE /api/products/:id

// Routes pour les alertes stock
router.route('/out-of-stock')
  .get(getOutOfStockProducts);  // GET /api/products/out-of-stock

router.route('/low-stock')
  .get(getLowStockProducts);    // GET /api/products/low-stock

router.route('/stock-stats')
  .get(getStockStats);          // GET /api/products/stock-stats

export default router;