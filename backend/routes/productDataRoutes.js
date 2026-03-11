// backend/routes/productDataRoutes.js
import express from 'express';
import { cncProductDetails } from '../data/productData.js';

const router = express.Router();

// Helper function to get product details
const getProductDetails = (productName) => {
  return cncProductDetails[productName] || null;
};

// Route pour obtenir tous les produits
router.get('/all-cnc', (req, res) => {
  try {
    res.json({
      success: true,
      data: cncProductDetails,
    });
  } catch (error) {
    console.error('Erreur dans /all-cnc:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message,
    });
  }
});

// Route pour obtenir les détails d'un produit spécifique
router.get('/details/:productName', (req, res) => {
  try {
    const { productName } = req.params;
    const decodedName = decodeURIComponent(productName);
    
    const productDetails = getProductDetails(decodedName);
    
    if (!productDetails) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé',
      });
    }

    res.json({
      success: true,
      data: productDetails,
    });
  } catch (error) {
    console.error('Erreur dans /details/:productName:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message,
    });
  }
});

export default router;