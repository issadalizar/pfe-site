import mongoose from 'mongoose';

const devisSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    productId: {
        type: String,
        required: true
    },
    productTitle: {
        type: String,
        required: true
    },
    productCategory: {
        type: String
    },
    productMainCategory: {
        type: String
    },
    productPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'archived'],
        default: 'pending'
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Mettre à jour la date de modification
devisSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Devis = mongoose.model('Devis', devisSchema);

export default Devis;