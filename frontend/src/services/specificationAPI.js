// services/specificationAPI.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const specificationAPI = {
  // Récupérer toutes les spécifications d'un produit
  getByProductId: async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/specifications/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications:', error);
      throw error;
    }
  },

  // Ajouter une spécification
  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/specifications`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la spécification:', error);
      throw error;
    }
  },

  // Mettre à jour une spécification
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/specifications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la spécification:', error);
      throw error;
    }
  },

  // Supprimer une spécification
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/specifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la spécification:', error);
      throw error;
    }
  },

  // Supprimer toutes les spécifications d'un produit
  deleteByProductId: async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/specifications/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression des spécifications:', error);
      throw error;
    }
  }
};