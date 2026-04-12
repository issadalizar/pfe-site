const API_URL = import.meta.env.VITE_PRODUCT_DATA_URL || 'http://localhost:5000/api/product-data';

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  let normalized = url.trim().replace(/\\/g, '/');

  if (!normalized.startsWith('http') && !normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace('/CNC Turning Machine/', '/CNC Turing Machine/');
  normalized = normalized.replace('/CNC Turing Machine /', '/CNC Turing Machine/');

  return normalized;
};

const normalizeProduct = (product) => {
  if (!product || typeof product !== 'object') return {};

  const rawImages = Array.isArray(product.images)
    ? product.images
    : product.cheminImageAuto
    ? [product.cheminImageAuto]
    : product.image
    ? [product.image]
    : product.productImage
    ? [product.productImage]
    : [];

  const images = rawImages
    .map(normalizeImageUrl)
    .filter((img) => typeof img === 'string' && img.length > 0);

  return {
    ...product,
    title: product.title || product.nom || product.name || product.productName || '',
    fullDescription:
      product.fullDescription || product.description || product.descriptif || '',
    description:
      product.description || product.fullDescription || product.descriptif || '',
    price:
      product.price !== undefined && product.price !== null
        ? product.price
        : product.prix !== undefined && product.prix !== null
        ? product.prix
        : product.tarif !== undefined && product.tarif !== null
        ? product.tarif
        : 0,
    category: product.category || product.categorie || product.categorieName || '',
    mainCategory:
      product.mainCategory || product.mainCategorie || product.main_category || '',
    images,
    features: Array.isArray(product.features) ? product.features : [],
    specifications: product.specifications || {},
    technicalSpecs: product.technicalSpecs || {},
  };
};

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
    return data.success ? normalizeProduct(data.data) : null;
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
    if (!data.success) return {};

    return Object.fromEntries(
      Object.entries(data.data || {}).map(([key, product]) => [key, normalizeProduct(product)]),
    );
  } catch (error) {
    console.error('❌ Erreur API (tous produits):', error.message);
    console.error('   → Vérifiez que le backend est démarré sur http://localhost:5000');
    console.error('   → Commande: cd backend && npm run dev');
    
    // Retourner un objet vide - l'UI affichera "aucun produit"
    // PAS DE FALLBACK VERS UN FICHIER LOCAL
    return {};
  }
};