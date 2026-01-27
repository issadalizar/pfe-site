// Service pour communiquer avec l'API backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Récupérer tous les utilisateurs
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('Utilisateur non trouvé');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getUserById:', error);
    throw error;
  }
};

// Activer ou désactiver un utilisateur
export const toggleUserStatus = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la modification du statut');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    throw error;
  }
};
