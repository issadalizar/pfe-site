// services/factureService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer une facture
export const createFacture = async (orderId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/factures`,
            { orderId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Erreur création facture:', error);
        throw error;
    }
};

// Récupérer les factures de l'utilisateur
export const getMyFactures = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/factures/my-factures`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur récupération factures:', error);
        throw error;
    }
};

// Récupérer une facture par ID
export const getFactureById = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/factures/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur récupération facture:', error);
        throw error;
    }
};

// Régénérer une facture
export const regenerateFacture = async (orderId, pdfUrl = null) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/factures/${orderId}/regenerate`,
            { pdfUrl },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Erreur régénération facture:', error);
        throw error;
    }
};