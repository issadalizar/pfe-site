import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      console.error('Erreur:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues
  async getNotificationsNonLues() {
    try {
      const response = await this.api.get('/non-lues');
      return response.data;
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStats() {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }

  // Marquer comme lue
  async marquerCommeLue(id) {
    try {
      const response = await this.api.put(`/${id}/lire`);
      return response.data;
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }

  // Marquer toutes comme lues
  async marquerToutesCommeLues() {
    try {
      const response = await this.api.put('/lire-toutes');
      return response.data;
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }

  // Récupérer les notifications de rupture
  async getRuptures() {
    return this.getNotifications({ type: 'rupture' });
  }
}

export default new NotificationService();