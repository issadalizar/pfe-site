import api from './api';

export const devisAPI = {
    // Récupérer tous les devis
    getAll: () => api.get('/devis'),
    
    // Récupérer un devis par ID
    getById: (id) => api.get(`/devis/${id}`),
    
    // Créer une nouvelle demande de devis
    create: (data) => api.post('/devis', data),
    
    // Mettre à jour le statut
    updateStatus: (id, status) => api.patch(`/devis/${id}/status`, { status }),
    
    // Supprimer un devis
    delete: (id) => api.delete(`/devis/${id}`),
    
    // Récupérer les statistiques
    getStats: () => api.get('/devis/stats')
};