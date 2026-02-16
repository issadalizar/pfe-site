import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Ajustez l'URL selon votre configuration

export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await axios.patch(`${API_URL}/${userId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Erreur createUser:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Erreur updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    throw error;
  }
};

export const bulkCreateUsers = async (usersData) => {
  try {
    const response = await axios.post(`${API_URL}/bulk`, usersData);
    return response.data;
  } catch (error) {
    console.error('Erreur bulkCreateUsers:', error);
    throw error;
  }
};