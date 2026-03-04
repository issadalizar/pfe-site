// src/services/CategorieProduct.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Catégories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  getByParent: (parentId) => api.get(`/categories/parent/${parentId}`),
};

export const contactAPI = {
  create: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Produits avec gestion d'erreur améliorée
export const productAPI = {
  getAll: () => api.get('/products'),
  
  getByCategory: async (categoryId) => {
    try {
      console.log(`🔍 Tentative avec route française: /products/categorie/${categoryId}`);
      const response = await api.get(`/products/categorie/${categoryId}`);
      return response;
    } catch (error) {
      console.log(`⚠️ Route française échouée, essai route anglaise: /products/category/${categoryId}`);
      
      // Fallback vers l'ancienne route
      try {
        const fallbackResponse = await api.get(`/products/category/${categoryId}`);
        console.log("✅ Route anglaise fonctionne");
        return fallbackResponse;
      } catch (fallbackError) {
        console.error("❌ Les deux routes ont échoué");
        throw error;
      }
    }
  },
  
  getById: (id) => api.get(`/products/${id}`),
  
  // Méthodes CRUD
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  
  // Alertes stock (routes françaises)
  getOutOfStock: () => api.get('/products/rupture-stock'),
  getLowStock: () => api.get('/products/stock-faible'),
  getStockStats: () => api.get('/products/statistiques-stock'),
};

export default api;