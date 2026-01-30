import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
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
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  level: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 3
  },
  icon: {
    type: String,
    default: '📁'
  },
  isActive: {
    type: Boolean,
    default: true
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
categorySchema.pre('save', function(next) {
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
categorySchema.index({ parent: 1, level: 1 });
categorySchema.index({ slug: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;