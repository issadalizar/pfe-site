import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/devis';

export const devisAPI = {
    // Récupérer tous les devis
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.getAll:', error);
            throw error;
        }
    },
    
    // Récupérer un devis par ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.getById:', error);
            throw error;
        }
    },
    
    // Créer une nouvelle demande de devis
    create: async (data) => {
        try {
            const response = await axios.post(API_URL, data);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.create:', error);
            throw error;
        }
    },
    
    // Mettre à jour le statut
    updateStatus: async (id, status) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.updateStatus:', error);
            throw error;
        }
    },
    
    // Supprimer un devis
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.delete:', error);
            throw error;
        }
    },
    
    // Récupérer les statistiques
    getStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.getStats:', error);
            throw error;
        }
    },
    
    // Méthodes supplémentaires utiles
    getByStatus: async (status) => {
        try {
            const response = await axios.get(`${API_URL}/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.getByStatus:', error);
            throw error;
        }
    },
    
    getByUser: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.getByUser:', error);
            throw error;
        }
    },
    
    updateDevis: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.updateDevis:', error);
            throw error;
        }
    },
    
    getRecentDevis: async (limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Erreur devisAPI.getRecentDevis:', error);
            throw error;
        }
    }
};