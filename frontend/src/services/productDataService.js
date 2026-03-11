// frontend/src/services/productDataService.js
// ⚠️ Ce service appelle l'API backend - PAS d'import direct du fichier data

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/product-data';

export const getProductDetails = async (productName) => {
  try {
    const response = await fetch(`${API_URL}/details/${encodeURIComponent(productName)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Produit non trouvé: ${productName}`);
        return null;
      }
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('❌ Erreur API (détails produit):', error.message);
    return null;
  }
};

export const getAllCncProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/all-cnc`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success ? data.data : {};
  } catch (error) {
    console.error('❌ Erreur API (tous produits):', error.message);
    console.error('   → Vérifiez que le backend est démarré sur http://localhost:5000');
    console.error('   → Commande: cd backend && npm run dev');
    
    // Retourner un objet vide - l'UI affichera "aucun produit"
    // PAS DE FALLBACK VERS UN FICHIER LOCAL
    return {};
  }
};