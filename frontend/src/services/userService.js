//axios pour faire les requetes http vers le backend
import axios from 'axios';
//+/users car c'est la route de base pour les opérations sur les utilisateurs
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/users';

// Créer une instance axios avec intercepteur pour le token JWT
const userAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


// fonction qui s'exécute avant chaque requete pour ajouter le token d'authentification dans les headers
//communique avec database
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonction pour récupérer tous les utilisateurs
//on utilise fonction asynchrone pour attendre la réponse du backend avant de continuer l'exécution du code
export const getAllUsers = async () => {
  try {
    const response = await userAPI.get('/');
    console.log('Données utilisateurs reçues:', response.data.length);
    if (response.data.length > 0) {
      console.log('Premier utilisateur:', {
        name: response.data[0].client_name,
        createdAt: response.data[0].createdAt,
        type: typeof response.data[0].createdAt
      });
    }
    return response.data;
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    throw error;
  }
};
// Fonction pour activer/désactiver un utilisateur
export const toggleUserStatus = async (userId) => {
  try {
    const response = await userAPI.patch(`/${userId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    throw error;
  }
};
// Fonction pour créer un nouvel utilisateur
export const createUser = async (userData) => {
  try {
    const response = await userAPI.post('/', userData);
    return response.data;
  } catch (error) {
    console.error('Erreur createUser:', error);
    throw error;
  }
};
// Fonction pour mettre à jour un utilisateur existant
export const updateUser = async (userId, userData) => {
  try {
    const response = await userAPI.put(`/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Erreur updateUser:', error);
    throw error;
  }
};
// Fonction pour supprimer un utilisateur
export const deleteUser = async (userId) => {
  try {
    const response = await userAPI.delete(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    throw error;
  }
};
// Fonction pour créer plusieurs utilisateurs en une seule requête
export const bulkCreateUsers = async (usersData) => {
  try {
    const response = await userAPI.post('/bulk', usersData);
    return response.data;
  } catch (error) {
    console.error('Erreur bulkCreateUsers:', error);
    throw error;
  }
};