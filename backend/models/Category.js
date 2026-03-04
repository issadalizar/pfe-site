import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true  // Le name devient ton identifiant unique
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
  level: { // Le niveau de la catégorie dans la hiérarchie
    type: Number, 
    default: 1,
    min: 1,
    max: 3
  },
 
  isActive: {
    type: Boolean,
    default: true
  },
 
 
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