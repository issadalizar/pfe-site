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
    // ✅ MODIFICATION: Référence au produit au lieu de stocker les attributs
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // ⚠️ Garder productId si nécessaire pour compatibilité, mais rendre optionnel
    productId: {
        type: String,
        required: false // Optionnel maintenant car on utilise product
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'archived'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Middleware pre-save pour assurer la compatibilité
devisSchema.pre('save', async function(next) {
    // Si product est défini et productId n'existe pas, on peut le générer
    if (this.product && !this.productId) {
        this.productId = this.product.toString();
    }
    next();
});

// ✅ Ajouter des indexes pour les performances
devisSchema.index({ product: 1 });
devisSchema.index({ status: 1 });
devisSchema.index({ createdAt: -1 });

// Méthode pour peupler automatiquement les données du produit
devisSchema.methods.populateProduct = function() {
    return this.populate('product', 'nom prix description images categorie');
};

// Méthode statique pour récupérer un devis avec les détails du produit
devisSchema.statics.findByIdWithProduct = function(id) {
    return this.findById(id).populate('product', 'nom prix description images categorie modele');
};

// Méthode statique pour récupérer tous les devis avec produits
devisSchema.statics.findAllWithProducts = function() {
    return this.find()
        .sort({ createdAt: -1 })
        .populate('product', 'nom prix description images categorie modele');
};

const Devis = mongoose.model('Devis', devisSchema);

export default Devis;