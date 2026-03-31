// services/orderService.js
import axios from 'axios';

// En dev : utiliser le proxy Vite (requêtes vers même origine → pas de ERR_CONNECTION_RESET)
// En prod : utiliser VITE_API_URL ou fallback
const isDev = import.meta.env.DEV;
const BASE = isDev ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
const API_URL = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;

console.log('🔗 orderService baseURL:', `${API_URL}/orders`);

const orderAPI = axios.create({
    baseURL: `${API_URL}/orders`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token
orderAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token JWT présent dans la requête');
    } else {
        // ✅ CORRECTION : alerter clairement si pas de token
        console.warn('⚠️ Aucun token JWT trouvé dans localStorage — la route /checkout nécessite une authentification');
    }
    console.log('📤 Requête vers:', config.baseURL + config.url);
    return config;
}, (error) => Promise.reject(error));

// Intercepteur de réponse pour logguer les erreurs
orderAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ Erreur orderAPI:', {
            status: error.response?.status,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            fullURL: (error.config?.baseURL || '') + (error.config?.url || ''),
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

// ✅ Créer session checkout
export const createCheckoutSession = async (items, shippingInfo) => {
    // S'assurer que chaque item a bien un productId
    const itemsWithIds = items.map(item => ({
        ...item,
        productId: item.productId || item._id
    }));

    console.log('📦 Envoi checkout avec items:', itemsWithIds);

    const response = await orderAPI.post('/checkout', {
        items: itemsWithIds,
        shippingInfo
    });
    return response.data;
};

// Vérifier le statut d'une session
export const verifySession = async (sessionId) => {
    const response = await orderAPI.get(`/verify-session/${sessionId}`);
    return response.data;
};

// Récupérer mes commandes
export const getMyOrders = async () => {
    const response = await orderAPI.get('/my-orders');
    return response.data;
};

// Récupérer le détail d'une commande
export const getOrderById = async (orderId) => {
    const response = await orderAPI.get(`/${orderId}`);
    return response.data;
};

// Annuler une commande
export const cancelOrder = async (orderId) => {
    const response = await orderAPI.patch(`/${orderId}/cancel`);
    return response.data;
};
// ✅ Créer une commande avec paiement à la livraison
export const createCodOrder = async (items, shippingInfo) => {
    const itemsWithIds = items.map(item => ({
        ...item,
        productId: item.productId || item._id
    }));

    console.log('📦 Envoi commande COD avec items:', itemsWithIds);

    const response = await orderAPI.post('/checkout-cod', {
        items: itemsWithIds,
        shippingInfo
    });
    return response.data;
};

// Créer une commande avec virement bancaire
export const createVirementOrder = async (items, shippingInfo) => {
    const itemsWithIds = items.map(item => ({
        ...item,
        productId: item.productId || item._id
    }));

    console.log('🏦 Envoi commande virement avec items:', itemsWithIds);

    const response = await orderAPI.post('/checkout-virement', {
        items: itemsWithIds,
        shippingInfo
    });
    return response.data;
};

// Uploader la preuve de virement
export const uploadVirementProof = async (orderId, file) => {
    const formData = new FormData();
    formData.append('proof', file);

    const token = localStorage.getItem('token');
    const response = await orderAPI.post(`/${orderId}/virement-proof`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export default orderAPI;