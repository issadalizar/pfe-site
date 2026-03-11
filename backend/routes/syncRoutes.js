// backend/routes/syncRoutes.js
import express from 'express';
import dataSyncService from '../services/dataSyncService.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/sync/status - Vérifier l'état de la synchronisation
router.get('/status', protect, adminOnly, async (req, res) => {
  try {
    const data = await dataSyncService.readProductData();
    
    const stats = {
      products: Object.keys(data).filter(k => !k.startsWith('_')).length,
      categories: Object.keys(data._categories || {}).length,
      orders: Object.keys(data._orders || {}).length,
      specifications: Object.keys(data._specifications || {}).length,
      lastSync: data._lastSync || null
    };
    
    res.json({
      success: true,
      data: stats,
      message: `Fichier productData.js contient ${stats.products} produits`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/sync/all - Synchroniser toutes les données
router.post('/all', protect, adminOnly, async (req, res) => {
  try {
    const result = await dataSyncService.syncAllFromMongoDB();
    
    res.json({
      success: true,
      message: 'Synchronisation complète effectuée avec succès',
      data: result.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/sync/products - Synchroniser seulement les produits
router.post('/products', protect, adminOnly, async (req, res) => {
  try {
    const Product = (await import('../models/Product.js')).default;
    const products = await Product.find().populate('categorie').lean();
    
    const data = await dataSyncService.readProductData();
    
    // Mettre à jour seulement les produits
    products.forEach(product => {
      const key = product.nom || product.name || `product_${product._id}`;
      data[key] = {
        ...product,
        _id: product._id.toString(),
        category: product.categorie?.nom || product.categorie,
        categoryId: product.categorie?._id?.toString()
      };
    });
    
    await dataSyncService.writeProductData(data);
    
    res.json({
      success: true,
      message: `${products.length} produits synchronisés`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;