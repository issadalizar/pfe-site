// services/userService.js
const API_URL = "http://localhost:5000/api";

// ✅ Fonction pour récupérer tous les utilisateurs
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur dans getAllUsers:", error);
    throw error;
  }
};

// ✅ Fonction pour basculer le statut d'un utilisateur
export const toggleUserStatus = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/toggle`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur dans toggleUserStatus:", error);
    throw error;
  }
};