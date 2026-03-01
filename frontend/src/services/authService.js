import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Créer une instance axios avec intercepteur pour le token
const authAPI = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token à chaque requête
authAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Inscription client
export const registerUser = async (userData) => {
    const response = await authAPI.post('/register', userData);
    return response.data;
};

// Connexion (client ou admin)
export const loginUser = async (credentials) => {
    const response = await authAPI.post('/login', credentials);
    return response.data;
};

// Récupérer le profil de l'utilisateur connecté
export const getProfile = async () => {
    const response = await authAPI.get('/profile');
    return response.data;
};

// Modifier le profil de l'utilisateur connecté
export const updateProfileAPI = async (profileData) => {
    const response = await authAPI.put('/profile', profileData);
    return response.data;
};

// Sauvegarder le token et l'utilisateur dans localStorage
export const saveAuthData = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Supprimer les données d'auth du localStorage
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Récupérer le token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Récupérer l'utilisateur stocké
export const getStoredUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export default authAPI;
