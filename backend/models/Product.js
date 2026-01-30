import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: '',
    maxlength: 150
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  features: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  model: {
    type: String,
    default: ''
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  link: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    default: 0
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

// Middleware pour mettre à jour updatedAt avant la sauvegarde
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Créer le slug si non existant
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  
  next();
});

// Index pour améliorer les performances
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;