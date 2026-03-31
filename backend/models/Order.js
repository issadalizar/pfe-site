// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    shippingInfo: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'livraison', 'virement'],
        default: 'stripe'
    },
    virementProof: {
        fileUrl: { type: String, default: null },
        method: { type: String, enum: ['platform', 'email', 'whatsapp', null], default: null },
        uploadedAt: { type: Date, default: null }
    },
    returnDeadline: {
        type: Date,
        default: null
    },
    stripeSessionId: {
        type: String
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
    },
    // ✅ NOUVEAU CHAMP POUR ÉVITER LES DOUBLES MISES À JOUR
    stockUpdated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index pour améliorer les performances
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;