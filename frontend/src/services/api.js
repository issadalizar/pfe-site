// api.js - Version compatible Vite
import axios from 'axios';

// Utiliser import.meta.env au lieu de process.env (pour Vite)
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5001';

class ApiService {
    constructor() {
        this.pythonApi = axios.create({
            baseURL: PYTHON_API_URL,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
    }

    async sendMessage(message, userId = 'user1') {
        try {
            const response = await this.pythonApi.post('/api/chat', {
                message,
                user_id: userId
            });
            return response.data;
        } catch (error) {
            console.error('Erreur chatbot:', error);
            throw error;
        }
    }

    async checkHealth() {
        try {
            const response = await this.pythonApi.get('/api/health');
            return response.data;
        } catch (error) {
            return { status: 'unavailable' };
        }
    }
}

export default new ApiService();