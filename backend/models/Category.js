import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true  
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

const Category = mongoose.model('Category', categorySchema);

export default Category;