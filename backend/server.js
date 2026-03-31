// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import contactRoutes from './routes/contactRoutes.js';
import mongoose from 'mongoose';
import devisRoutes from './routes/devisRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { protect, adminOnly } from './middleware/authMiddleware.js';
import { handleStripeWebhook, createCheckoutSession } from './controllers/orderController.js';
import specificationRoutes from './routes/specificationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import productDataRoutes from './routes/productDataRoutes.js';
// AJOUT: Routes de synchronisation
import syncRoutes from './routes/syncRoutes.js';
import returnRequestRoutes from './routes/returnRequestRoutes.js';
// AJOUT: Service de synchronisation
import dataSyncService from './services/dataSyncService.js';

// ========== NOUVEAU: IMPORT POUR LA VISUALISATION 3D ==========
import product3dRoutes from './routes/product3dRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir __dirname équivalent en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ===============================================================

// Charger les variables d'environnement
dotenv.config();

// Éviter que le processus ne tombe sur une exception non gérée (connexion reset côté client)
process.on('uncaughtException', (err) => {
  console.error('❌ uncaughtException:', err && err.message, err && err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ unhandledRejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: /^http:\/\/localhost(:\d+)?$/,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook Stripe (doit etre AVANT express.json car Stripe a besoin du raw body)
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== NOUVEAU: Configuration pour les fichiers 3D ==========
// Créer le dossier uploads/models3d s'il n'existe pas
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
const models3dDir = path.join(uploadsDir, 'models3d');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(models3dDir)) {
  fs.mkdirSync(models3dDir, { recursive: true });
}
const virementsDir = path.join(uploadsDir, 'virements');
if (!fs.existsSync(virementsDir)) {
  fs.mkdirSync(virementsDir, { recursive: true });
}

// Servir les fichiers statiques 3D
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// =================================================================

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Connexion à MongoDB (ne bloque pas le démarrage du serveur)
connectDB().catch((err) => {
  console.error(' Erreur lors de la connexion MongoDB:', err.message);
  console.log(' Le serveur continue de fonctionner, mais les routes nécessitent MongoDB');
});

// AJOUT: Initialiser la synchronisation après connexion MongoDB
mongoose.connection.once('open', async () => {
  console.log(' MongoDB connecté, initialisation de la synchronisation...');
  await dataSyncService.initializeOnStartup();
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
        outOfStock: 'GET /api/products/out-of-stock',
        lowStock: 'GET /api/products/low-stock',
        stockStats: 'GET /api/products/stock-stats'
      },
      productData: {
        allCnc: 'GET /api/product-data/all-cnc',
        details: 'GET /api/product-data/details/:productName'
      },
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        getById: 'GET /api/users/:id',
        toggle: 'PATCH /api/users/:id/toggle',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      contact: {
        create: 'POST /api/contact',
        getAll: 'GET /api/contact'
      },
      devis: {
        list: 'GET /api/devis',
        create: 'POST /api/devis',
        getById: 'GET /api/devis/:id',
        updateStatus: 'PATCH /api/devis/:id/status',
        delete: 'DELETE /api/devis/:id',
        stats: 'GET /api/devis/stats'
      },
      // AJOUT: Routes de synchronisation
      sync: {
        status: 'GET /api/sync/status',
        all: 'POST /api/sync/all',
        products: 'POST /api/sync/products'
      },
      // ========== NOUVEAU: Routes 3D ==========
      models3d: {
        list: 'GET /api/models3d',
        getByProduct: 'GET /api/models3d/product/:productId',
        upload: 'POST /api/models3d/upload/:productId',
        update: 'PUT /api/models3d/:modelId',
        delete: 'DELETE /api/models3d/:modelId'
      }
      // =========================================
    }
  });
});

// Route de test
app.get('/api/health', (req, res) => {
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

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-data', productDataRoutes);
app.use('/api/users', protect, adminOnly, userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/specifications', specificationRoutes);
app.use('/api/notifications', notificationRoutes);
// AJOUT: Routes de synchronisation
app.use('/api/sync', syncRoutes);
app.use('/api/return-requests', returnRequestRoutes);

// ========== NOUVEAU: Routes 3D ==========
app.use('/api/models3d', product3dRoutes);
// =========================================

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
      'GET /api/products/out-of-stock',
      'GET /api/products/low-stock',
      'GET /api/products/stock-stats',
      'GET /api/product-data/all-cnc',
      'GET /api/product-data/details/:productName',
      'GET /api/users',
      'POST /api/users',
      'GET /api/users/:id',
      'PATCH /api/users/:id/toggle',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'POST /api/contact',
      'GET /api/contact',
      'GET /api/devis',
      'POST /api/devis',
      'GET /api/devis/:id',
      'PATCH /api/devis/:id/status',
      'DELETE /api/devis/:id',
      'GET /api/devis/stats',
      // AJOUT: Routes sync
      'GET /api/sync/status',
      'POST /api/sync/all',
      'POST /api/sync/products',
      // ========== NOUVEAU: Routes 3D ==========
      'GET /api/models3d',
      'GET /api/models3d/product/:productId',
      'POST /api/models3d/upload/:productId',
      'PUT /api/models3d/:modelId',
      'DELETE /api/models3d/:modelId'
      // =========================================
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
  console.log(`Serveur backend démarré sur le port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Test: http://localhost:${PORT}/api/health`);
  console.log(` API Categories: http://localhost:${PORT}/api/categories`);
  console.log(` API Products: http://localhost:${PORT}/api/products`);
  console.log(` API orders : http://localhost:${PORT}/api/orders`);
  console.log(` API Product Data: http://localhost:${PORT}/api/product-data/all-cnc`);
  console.log(` API Sync: http://localhost:${PORT}/api/sync/status`);
  console.log(`   - POST /api/sync/all (synchronisation complète)`);
  console.log(`   - POST /api/sync/products (synchronisation produits)`);
  // ========== NOUVEAU: Logs 3D ==========
  console.log(` API 3D Models: http://localhost:${PORT}/api/models3d`);
  console.log(`   - GET /api/models3d (liste tous les modèles)`);
  console.log(`   - GET /api/models3d/product/:productId (modèle d'un produit)`);
  console.log(`   - POST /api/models3d/upload/:productId (upload modèle)`);
  console.log(`   - PUT /api/models3d/:modelId (mise à jour)`);
  console.log(`   - DELETE /api/models3d/:modelId (suppression)`);
  console.log(` Fichiers 3D: ${models3dDir}`);
  // =======================================
  console.log(` Fichier de synchronisation: backend/data/productData.js`);
});

export default app;