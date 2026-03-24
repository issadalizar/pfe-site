// services/productAPI.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou non valide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productAPI = {
  // ==================== PRODUITS ====================
  
  /**
   * Récupérer tous les produits
   * @param {Object} params - Paramètres de filtrage (search, category, etc.)
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAll products:', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les produits avec leurs spécifications
   */
  getAllWithSpecs: async () => {
    try {
      const response = await api.get('/products?populate=specifications');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAllWithSpecs:', error);
      throw error;
    }
  },

  /**
   * Récupérer un produit par son ID
   * @param {string} id - ID du produit
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getById product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un produit par son ID avec ses spécifications
   * @param {string} id - ID du produit
   */
  getByIdWithSpecs: async (id) => {
    try {
      const response = await api.get(`/products/${id}?populate=specifications`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getByIdWithSpecs ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un produit par son slug
   * @param {string} slug - Slug du produit
   */
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getBySlug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Créer un nouveau produit
   * @param {Object} productData - Données du produit
   */
  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur create product:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un produit
   * @param {string} id - ID du produit
   * @param {Object} productData - Nouvelles données
   */
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur update product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un produit
   * @param {string} id - ID du produit
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur delete product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer plusieurs produits
   * @param {string[]} ids - Tableau d'IDs
   */
  deleteMultiple: async (ids) => {
    try {
      const response = await api.post('/products/delete-multiple', { ids });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteMultiple:', error);
      throw error;
    }
  },

  // ==================== FILTRES PAR CATÉGORIE ====================

  /**
   * Récupérer les produits d'une catégorie
   * @param {string} categoryId - ID de la catégorie
   */
  getByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getByCategory ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les produits d'une catégorie avec toutes ses sous-catégories
   * @param {string} categoryId - ID de la catégorie parent
   */
  getByCategoryWithChildren: async (categoryId) => {
    try {
      const response = await api.get(`/products/category/${categoryId}/with-children`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getByCategoryWithChildren ${categoryId}:`, error);
      throw error;
    }
  },

  // ==================== GESTION DU STOCK ====================

  /**
   * Récupérer les produits en rupture de stock
   */
  getOutOfStock: async () => {
    try {
      const response = await api.get('/products/rupture-stock');
      return response;
    } catch (error) {
      console.error('❌ Erreur getOutOfStock:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le stock d'un produit
   * @param {string} id - ID du produit
   * @param {number} quantity - Nouvelle quantité
   */
  updateStock: async (id, quantity) => {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stock: quantity });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur updateStock ${id}:`, error);
      throw error;
    }
  },

  // ==================== RECHERCHE AVANCÉE ====================

  /**
   * Rechercher des produits avec filtres avancés
   * @param {Object} filters - Filtres de recherche
   */
  search: async (filters = {}) => {
    try {
      const response = await api.get('/products/search', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur search products:', error);
      throw error;
    }
  },

  /**
   * Récupérer les produits en vedette
   */
  getFeatured: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getFeatured:', error);
      throw error;
    }
  },

  /**
   * Récupérer les produits récents
   * @param {number} limit - Nombre de produits à récupérer
   */
  getRecent: async (limit = 10) => {
    try {
      const response = await api.get('/products/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getRecent:', error);
      throw error;
    }
  },

  // ==================== EXPORT/IMPORT ====================

  /**
   * Exporter les produits au format CSV
   */
  exportToCSV: async () => {
    try {
      const response = await api.get('/products/export/csv', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur exportToCSV:', error);
      throw error;
    }
  },

  /**
   * Exporter les produits au format JSON
   */
  exportToJSON: async () => {
    try {
      const response = await api.get('/products/export/json');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur exportToJSON:', error);
      throw error;
    }
  },

  /**
   * Importer des produits depuis un fichier
   * @param {FormData} formData - Données du fichier
   */
  import: async (formData) => {
    try {
      const response = await api.post('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur import products:', error);
      throw error;
    }
  },

  // ==================== STATISTIQUES ====================

  /**
   * Récupérer les statistiques des produits
   */
  getStats: async () => {
    try {
      const response = await api.get('/products/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getStats:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques par catégorie
   */
  getStatsByCategory: async () => {
    try {
      const response = await api.get('/products/stats/by-category');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getStatsByCategory:', error);
      throw error;
    }
  },

  // ==================== GESTION DES IMAGES ====================

  /**
   * Uploader une image pour un produit
   * @param {string} productId - ID du produit
   * @param {File} file - Fichier image
   */
  uploadImage: async (productId, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(`/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur uploadImage ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Uploader plusieurs images pour un produit
   * @param {string} productId - ID du produit
   * @param {File[]} files - Tableau de fichiers images
   */
  uploadMultipleImages: async (productId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await api.post(`/products/${productId}/images/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur uploadMultipleImages ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une image d'un produit
   * @param {string} productId - ID du produit
   * @param {string} imageUrl - URL de l'image à supprimer
   */
  deleteImage: async (productId, imageUrl) => {
    try {
      const response = await api.delete(`/products/${productId}/images`, {
        data: { imageUrl },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur deleteImage ${productId}:`, error);
      throw error;
    }
  },

  // ==================== SPÉCIFICATIONS ====================

  /**
   * Récupérer toutes les spécifications d'un produit
   * @param {string} productId - ID du produit
   */
  getSpecifications: async (productId) => {
    try {
      const response = await api.get(`/specifications/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getSpecifications ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter une spécification à un produit
   * @param {Object} specData - Données de la spécification
   */
  addSpecification: async (specData) => {
    try {
      const response = await api.post('/specifications', specData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur addSpecification:', error);
      throw error;
    }
  },

  /**
   * Ajouter plusieurs spécifications à un produit
   * @param {string} productId - ID du produit
   * @param {Array} specs - Tableau de spécifications
   */
  addMultipleSpecifications: async (productId, specs) => {
    try {
      const response = await api.post(`/specifications/product/${productId}/bulk`, { specs });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur addMultipleSpecifications ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour une spécification
   * @param {string} specId - ID de la spécification
   * @param {Object} specData - Nouvelles données
   */
  updateSpecification: async (specId, specData) => {
    try {
      const response = await api.put(`/specifications/${specId}`, specData);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur updateSpecification ${specId}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une spécification
   * @param {string} specId - ID de la spécification
   */
  deleteSpecification: async (specId) => {
    try {
      const response = await api.delete(`/specifications/${specId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur deleteSpecification ${specId}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer toutes les spécifications d'un produit
   * @param {string} productId - ID du produit
   */
  deleteAllSpecifications: async (productId) => {
    try {
      const response = await api.delete(`/specifications/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur deleteAllSpecifications ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour en masse les spécifications d'un produit
   * @param {string} productId - ID du produit
   * @param {Object} specs - Objet avec les spécifications groupées { general: [], advanced: [] }
   */
  updateSpecificationsBulk: async (productId, specs) => {
    try {
      // D'abord supprimer toutes les anciennes spécifications
      await productAPI.deleteAllSpecifications(productId);
      
      // Puis ajouter les nouvelles
      const allSpecs = [
        ...specs.general.map(s => ({ ...s, type: 'general' })),
        ...specs.advanced.map(s => ({ ...s, type: 'advanced' }))
      ];
      
      if (allSpecs.length > 0) {
        const response = await productAPI.addMultipleSpecifications(productId, allSpecs);
        return response;
      }
      
      return { success: true, data: [] };
    } catch (error) {
      console.error(`❌ Erreur updateSpecificationsBulk ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les spécifications groupées par type
   * @param {string} productId - ID du produit
   */
  getSpecificationsGrouped: async (productId) => {
    try {
      const response = await api.get(`/specifications/product/${productId}`);
      const specs = response.data.data || [];
      
      const grouped = {
        general: specs.filter(s => s.type === 'general'),
        advanced: specs.filter(s => s.type === 'advanced')
      };
      
      return { success: true, data: grouped };
    } catch (error) {
      console.error(`❌ Erreur getSpecificationsGrouped ${productId}:`, error);
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Générer un slug à partir d'un nom
   * @param {string} name - Nom du produit
   */
  generateSlug: (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  },

  /**
   * Formater un prix
   * @param {number} price - Prix à formater
   */
  formatPrice: (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  },

  /**
   * Vérifier si un produit est en stock
   * @param {Object} product - Produit à vérifier
   */
  isInStock: (product) => {
    return product.stock > 0;
  },

  /**
   * Vérifier si un produit a un stock faible
   * @param {Object} product - Produit à vérifier
   * @param {number} threshold - Seuil de stock faible
   */
  isLowStock: (product, threshold = 5) => {
    return product.stock > 0 && product.stock < threshold;
  },
};

// Export par défaut pour plus de flexibilité
export default productAPI;