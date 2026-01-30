import express from 'express';
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
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

export default router;