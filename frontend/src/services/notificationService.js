// frontend/src/services/notificationService.js
import axios from 'axios';

// ✅ CORRECTION : Utiliser import.meta.env pour Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/notifications`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Ajouter le token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Récupérer toutes les notifications
  async getNotifications(params = {}) {
    try {
      const response = await this.api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getNotifications:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues
  async getNotificationsNonLues(limit = 20) {
    try {
      const response = await this.api.get('/non-lues', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getNotificationsNonLues:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStats() {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getStats:', error);
      throw error;
    }
  }

  // Récupérer les notifications de rupture
  async getRuptures(page = 1, limit = 50) {
    try {
      const response = await this.api.get('/ruptures', { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getRuptures:', error);
      throw error;
    }
  }

  // Marquer comme lue
  async marquerCommeLue(id) {
    try {
      const response = await this.api.put(`/${id}/lire`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.marquerCommeLue:', error);
      throw error;
    }
  }

  // Marquer toutes comme lues
  async marquerToutesCommeLues() {
    try {
      const response = await this.api.put('/lire-toutes');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.marquerToutesCommeLues:', error);
      throw error;
    }
  }
}

export default new NotificationService();