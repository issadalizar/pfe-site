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

  // Récupérer les spécifications groupées
  getGroupedByProductId: async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/specifications/product/${productId}/grouped`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications groupées:', error);
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

  // Créer plusieurs spécifications en lot
  createBulk: async (productId, specs) => {
    try {
      const response = await axios.post(`${API_URL}/specifications/product/${productId}/bulk`, { specs });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création en lot des spécifications:', error);
      throw error;
    }
  },

  // Mettre à jour une spécification (seulement value et type)
  update: async (id, data) => {
    try {
      // Ne permettre la mise à jour que de value et type
      const updateData = {};
      if (data.value !== undefined) updateData.value = data.value;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.order !== undefined) updateData.order = data.order;
      
      const response = await axios.put(`${API_URL}/specifications/${id}`, updateData);
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
  },

  // Réordonner les spécifications
  reorder: async (productId, specs) => {
    try {
      const response = await axios.patch(`${API_URL}/specifications/reorder/${productId}`, { specs });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du réordonnancement des spécifications:', error);
      throw error;
    }
  },

  // Copier les spécifications d'un produit à un autre
  copy: async (fromProductId, toProductId) => {
    try {
      const response = await axios.post(`${API_URL}/specifications/copy`, { fromProductId, toProductId });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la copie des spécifications:', error);
      throw error;
    }
  }
};