import mongoose from 'mongoose';

const factureSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    factureNumber: {
        type: String,
        unique: true,
        required: true
    },
    items: [{
        productName: String,
        quantity: Number,
        price: Number
    }],
    shippingInfo: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        postalCode: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'livraison', 'virement']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'],
        default: 'en_attente'
    }
}, { timestamps: true });

// Générer un numéro de facture unique avant la sauvegarde
factureSchema.pre('save', async function (next) {
    if (!this.factureNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Facture').countDocuments();
        this.factureNumber = `FAC-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

const Facture = mongoose.model('Facture', factureSchema);
export default Facture;
