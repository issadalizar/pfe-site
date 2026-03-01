import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

const orderAPI = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token
orderAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Creer une session Stripe Checkout
export const createCheckoutSession = async (items, shippingInfo) => {
    const response = await orderAPI.post('/checkout', { items, shippingInfo });
    return response.data;
};

// Verifier le statut d'une session
export const verifySession = async (sessionId) => {
    const response = await orderAPI.get(`/verify-session/${sessionId}`);
    return response.data;
};

// Recuperer mes commandes
export const getMyOrders = async () => {
    const response = await orderAPI.get('/my-orders');
    return response.data;
};

// Recuperer le detail d'une commande
export const getOrderById = async (orderId) => {
    const response = await orderAPI.get(`/${orderId}`);
    return response.data;
};

export default orderAPI;
