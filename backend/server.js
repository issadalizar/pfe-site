import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import mongoose from 'mongoose';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Connexion à MongoDB (ne bloque pas le démarrage du serveur)
connectDB().catch((err) => {
  console.error('⚠️  Erreur lors de la connexion MongoDB:', err.message);
  console.log('💡 Le serveur continue de fonctionner, mais les routes utilisateurs nécessitent MongoDB');
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Backend PFE',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        getById: 'GET /api/users/:id',
        toggle: 'PATCH /api/users/:id/toggle',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      }
    }
  });
});

// Route de test
app.get('/api/health', (req, res) => {
  // États de connexion MongoDB: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = {
    0: 'déconnecté',
    1: 'connecté',
    2: 'connexion en cours',
    3: 'déconnexion en cours'
  };
  
  const dbState = mongoose.connection.readyState;
  const dbStatus = states[dbState] || 'inconnu';
  
  res.json({ 
    status: 'OK', 
    message: 'Serveur backend opérationnel',
    database: `MongoDB ${dbStatus}`,
    mongodbState: dbState
  });
});

// Routes
app.use('/api/users', userRoutes);

// Gestion des erreurs 404 (doit être après toutes les routes)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/users',
      'POST /api/users',
      'GET /api/users/:id',
      'PATCH /api/users/:id/toggle',
      'PUT /api/users/:id',
      'DELETE /api/users/:id'
    ]
  });
});

// Gestion des erreurs globales (doit être en dernier avec 4 paramètres)
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📋 Test: http://localhost:${PORT}/api/health`);
});

export default app;
