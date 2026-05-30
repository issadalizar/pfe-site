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
<<<<<<< Updated upstream
    //  MODIFICATION: Référence au produit au lieu de stocker les attributs
=======
    // ✅ AJOUTER productTitle pour l'affichage (obligatoire)
    productTitle: {
        type: String,
        required: true,
        trim: true
    },
    // ✅ Rendre product optionnel (pas obligatoire)
>>>>>>> Stashed changes
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
<<<<<<< Updated upstream
    //  Garder productId si nécessaire pour compatibilité, mais rendre optionnel
=======
    // Garder productId pour compatibilité (optionnel)
>>>>>>> Stashed changes
    productId: {
        type: String,
        required: false
    },
    // Champs optionnels supplémentaires
    productCategory: {
        type: String,
        required: false
    },
    productMainCategory: {
        type: String,
        required: false
    },
    productPrice: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'archived'],
        default: 'pending'
    }
}, {
    timestamps: true
});

<<<<<<< Updated upstream
// Middleware pre-save pour assurer la compatibilité
devisSchema.pre('save', async function(next) {
    // Si product est défini et productId n'existe pas, on peut le générer
    if (this.product && !this.productId) {
        this.productId = this.product.toString();
    }
    next();
});

// Ajouter des indexes pour les performances
devisSchema.index({ product: 1 });
=======
// Index pour les performances
>>>>>>> Stashed changes
devisSchema.index({ status: 1 });
devisSchema.index({ createdAt: -1 });
devisSchema.index({ productTitle: 1 });

const Devis = mongoose.model('Devis', devisSchema);

export default Devis;