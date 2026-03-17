// frontend/src/services/notificationService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/notifications`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

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

  async getNotifications(params = {}) {
    try {
      const response = await this.api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getNotifications:', error);
      throw error;
    }
  }

  async getNotificationsNonLues(limit = 20) {
    try {
      const response = await this.api.get('/non-lues', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getNotificationsNonLues:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getStats:', error);
      throw error;
    }
  }

  async getRuptures(page = 1, limit = 50) {
    try {
      const response = await this.api.get('/ruptures', { params: { page, limit } });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.getRuptures:', error);
      throw error;
    }
  }

  async marquerCommeLue(id) {
    try {
      const response = await this.api.put(`/${id}/lire`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur notificationService.marquerCommeLue:', error);
      throw error;
    }
  }

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