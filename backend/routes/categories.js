import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Routes pour les catégories
router.route('/')
  .get(getAllCategories)     // GET /api/categories
  .post(createCategory);     // POST /api/categories

router.route('/:id')
  .get(getCategoryById)      // GET /api/categories/:id
  .put(updateCategory)       // PUT /api/categories/:id
  .delete(deleteCategory);   // DELETE /api/categories/:id

export default router;