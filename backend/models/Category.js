import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true  // Le name devient ton identifiant unique
  },
  // slug a été supprimé 👈
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

// Middleware simplifié (plus de slug)
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index (supprimer l'index sur slug)
categorySchema.index({ parent: 1, level: 1 });
// categorySchema.index({ slug: 1 });  ← À SUPPRIMER

const Category = mongoose.model('Category', categorySchema);

export default Category;