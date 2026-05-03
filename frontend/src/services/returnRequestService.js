import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/return-requests';

const returnRequestAPI = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token
returnRequestAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Créer une demande de retour/échange (client)
export const createReturnRequest = async (data) => {
    const response = await returnRequestAPI.post('/', data);
    return response.data;
};

// Récupérer mes demandes (client)
export const getMyReturnRequests = async () => {
    const response = await returnRequestAPI.get('/my-requests');
    return response.data;
};

// Récupérer toutes les demandes (admin)
export const getAllReturnRequests = async () => {
    const response = await returnRequestAPI.get('/');
    return response.data;
};

// Récupérer les analytics retour/échange par produit (admin)
export const getReturnRequestAnalytics = async () => {
    const response = await returnRequestAPI.get('/analytics/products');
    return response.data;
};

// Mettre à jour le statut (admin)
export const updateReturnRequestStatus = async (id, status, adminNote) => {
    const response = await returnRequestAPI.patch(`/${id}/status`, { status, adminNote });
    return response.data;
};

// Mettre à jour la date limite de retour du produit (admin)
export const updateReturnRequestDeadline = async (id, returnDeadline) => {
    const response = await returnRequestAPI.patch(`/${id}/deadline`, { returnDeadline });
    return response.data;
};

export default returnRequestAPI;
