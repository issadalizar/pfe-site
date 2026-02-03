import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
// Import des nouvelles routes
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
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
  console.log('💡 Le serveur continue de fonctionner, mais les routes nécessitent MongoDB');
});

// Route racine (mise à jour avec les nouvelles routes)
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Backend PFE - CNC Education',
    version: '2.0.0',
    endpoints: {
      health: 'GET /api/health',
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
        getById: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      products: {
        list: 'GET /api/products',
        byCategory: 'GET /api/products/category/:categoryId',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        // API DE STOCK AJOUTÉES
        outOfStock: 'GET /api/products/out-of-stock',
        lowStock: 'GET /api/products/low-stock',
        stockStats: 'GET /api/products/stock-stats'
      },
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
    mongodbState: dbState,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Gestion des erreurs 404 (doit être après toutes les routes)
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/categories',
      'POST /api/categories',
      'GET /api/categories/:id',
      'PUT /api/categories/:id',
      'DELETE /api/categories/:id',
      'GET /api/products',
      'POST /api/products',
      'GET /api/products/category/:categoryId',
      'GET /api/products/:id',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      // ROUTES DE STOCK AJOUTÉES
      'GET /api/products/out-of-stock',
      'GET /api/products/low-stock',
      'GET /api/products/stock-stats',
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
  console.error('Erreur globale:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur serveur interne',
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📋 Test: http://localhost:${PORT}/api/health`);
  console.log(`📂 API Categories: http://localhost:${PORT}/api/categories`);
  console.log(`📦 API Products: http://localhost:${PORT}/api/products`);
  console.log(`📊 API Stock Stats: http://localhost:${PORT}/api/products/stock-stats`);
  console.log(`🚨 API Rupture stock: http://localhost:${PORT}/api/products/out-of-stock`);
  console.log(`⚠️  API Stock faible: http://localhost:${PORT}/api/products/low-stock`);
});

export default app;