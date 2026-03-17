// backend/routes/productDataRoutes.js
import express from 'express';
import { cncProductDetails } from '../data/productData.js';

const router = express.Router();

// CORRECTION : Normaliser les apostrophes courbes -> droites
// MongoDB stocke ' (U+2019) mais productData.js utilise ' (U+0027)
const normalizeText = (str) => {
  return str
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"');
};

// Helper function to get product details
const getProductDetails = (productName) => {
  // 1. Chercher avec le nom exact
  if (cncProductDetails[productName]) return cncProductDetails[productName];
  
  // 2. Normaliser les apostrophes et reessayer
  const normalizedName = normalizeText(productName);
  if (cncProductDetails[normalizedName]) return cncProductDetails[normalizedName];
  
  // 3. Recherche insensible a la casse en dernier recours
  const lowerName = normalizedName.toLowerCase();
  const key = Object.keys(cncProductDetails).find(
    k => normalizeText(k).toLowerCase() === lowerName
  );
  return key ? cncProductDetails[key] : null;
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

// Route pour obtenir les details d'un produit specifique
router.get('/details/:productName', (req, res) => {
  try {
    const { productName } = req.params;
    const decodedName = decodeURIComponent(productName);
    
    const productDetails = getProductDetails(decodedName);
    
    if (!productDetails) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouve',
        searched: decodedName
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