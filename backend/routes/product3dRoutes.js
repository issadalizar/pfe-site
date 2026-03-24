import express from 'express';
import mongoose from 'mongoose';

// ✅ IMPORTANT
// Ce fichier est monté dans `server.js` via `app.use('/api/models3d', product3dRoutes)`.
// Il doit donc exporter un Router Express (middleware), pas seulement un modèle Mongoose.

const product3DSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  modelPath: {
    type: String,
    required: true
  },
  thumbnailPath: String,
  format: {
    type: String,
    enum: ['glb', 'gltf', 'obj', 'stl', 'fbx'],
    default: 'glb'
  },
  scale: {
    type: Number,
    default: 1.0
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  materials: [{
    name: String,
    color: String,
    roughness: Number,
    metalness: Number
  }],
  metadata: {
    dimensions: {
      width: Number,
      height: Number,
      depth: Number
    },
    vertices: Number,
    polygons: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Éviter "OverwriteModelError" en dev avec nodemon
export const Product3D = mongoose.models.Product3D || mongoose.model('Product3D', product3DSchema);

const router = express.Router();

// GET /api/models3d - liste des modèles 3D
router.get('/', async (req, res) => {
  try {
    const models = await Product3D.find().sort({ updatedAt: -1 });
    res.json({ success: true, models });
  } catch (error) {
    console.error('models3d list error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du chargement des modèles 3D.' });
  }
});

// GET /api/models3d/product/:productId - modèle d'un produit
// NOTE: côté frontend, on passe souvent le titre/nom depuis productData, pas un ObjectId Mongo
router.get('/product/:productId', async (req, res) => {
  try {
    const raw = req.params.productId || '';
    const decoded = decodeURIComponent(raw);

    const model =
      (await Product3D.findOne({ productId: decoded })) ||
      (await Product3D.findOne({ productName: decoded }));

    if (!model) {
      return res.json({ success: true, has3DModel: false });
    }

    res.json({
      success: true,
      has3DModel: true,
      model: {
        ...model.toObject(),
      },
    });
  } catch (error) {
    console.error('models3d getByProduct error:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du chargement du modèle 3D.' });
  }
});

export default router;