// src/services/api.js
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

// Produits
export const productAPI = {
  getAll: () => api.get('/products'),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getById: (id) => api.get(`/products/${id}`),
  // Méthodes CRUD
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  // Nouvelles fonctions pour les alertes stock
  getOutOfStock: () => api.get('/products/out-of-stock'),
  getLowStock: () => api.get('/products/low-stock'),
  getStockStats: () => api.get('/products/stock-stats'),


};


export default api;