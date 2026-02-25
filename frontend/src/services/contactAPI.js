import axios from 'axios';

const API_URL = 'http://localhost:5000/api/contact'; // Ajustez l'URL selon votre configuration

export const contactAPI = {
    // Récupérer tous les messages (pour admin)
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.getAll:', error);
            throw error;
        }
    },
    
    // Récupérer un message par ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.getById:', error);
            throw error;
        }
    },
    
    // Créer un nouveau message de contact
    create: async (contactData) => {
        try {
            const response = await axios.post(API_URL, contactData);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.create:', error);
            throw error;
        }
    },
    
    // Mettre à jour le statut d'un message (pending, read, archived)
    updateStatus: async (id, status) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.updateStatus:', error);
            throw error;
        }
    },
    
    // Supprimer un message
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.delete:', error);
            throw error;
        }
    },
    
    // Récupérer les statistiques des messages
    getStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.getStats:', error);
            throw error;
        }
    },
    
    // Marquer comme lu
    markAsRead: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/read`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.markAsRead:', error);
            throw error;
        }
    },
    
    // Archiver un message
    archive: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/archive`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.archive:', error);
            throw error;
        }
    },
    
    // Récupérer les messages non lus
    getUnread: async () => {
        try {
            const response = await axios.get(`${API_URL}/unread`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.getUnread:', error);
            throw error;
        }
    },
    
    // Récupérer les messages archivés
    getArchived: async () => {
        try {
            const response = await axios.get(`${API_URL}/archived`);
            return response.data;
        } catch (error) {
            console.error('Erreur contactAPI.getArchived:', error);
            throw error;
        }
    }
};