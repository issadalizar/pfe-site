import axios from 'axios';

const isDev = import.meta.env.DEV;
const BASE = isDev ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
const API_URL = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;

const factureAPI = axios.create({
    baseURL: `${API_URL}/factures`,
    headers: { 'Content-Type': 'application/json' }
});

factureAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

factureAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Erreur factureAPI:', error.response?.data);
        return Promise.reject(error);
    }
);

// Créer une facture à partir d'une commande
export const createFacture = async (orderId) => {
    const response = await factureAPI.post('/', { orderId });
    return response.data;
};

// Récupérer mes factures
export const getMyFactures = async () => {
    const response = await factureAPI.get('/my-factures');
    return response.data;
};

// Récupérer une facture par ID
export const getFactureById = async (id) => {
    const response = await factureAPI.get(`/${id}`);
    return response.data;
};

export default factureAPI;
