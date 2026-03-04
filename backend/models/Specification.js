import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  key: {//name
    type: String,
    required: true,
    trim: true
  },
  value: {//description
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'advanced'],
    required: true,
    default: 'general'
  },
  order: {
    type: Number,
    default: 0
  }
});

specificationSchema.index({ productId: 1, key: 1, type: 1 }, { unique: true });

specificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Specification = mongoose.model('Specification', specificationSchema);
export default Specification;