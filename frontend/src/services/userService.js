import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/users';

// Créer une instance axios avec intercepteur pour le token JWT
const userAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllUsers = async () => {
  try {
    const response = await userAPI.get('/');
    return response.data;
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await userAPI.patch(`/${userId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await userAPI.post('/', userData);
    return response.data;
  } catch (error) {
    console.error('Erreur createUser:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await userAPI.put(`/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Erreur updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await userAPI.delete(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    throw error;
  }
};

export const bulkCreateUsers = async (usersData) => {
  try {
    const response = await userAPI.post('/bulk', usersData);
    return response.data;
  } catch (error) {
    console.error('Erreur bulkCreateUsers:', error);
    throw error;
  }
};