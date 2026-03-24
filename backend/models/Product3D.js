const mongoose = require('mongoose');

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
    enum: ['glb', 'gltf', 'obj', 'stl'],
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

module.exports = mongoose.model('Product3D', product3DSchema);