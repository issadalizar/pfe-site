import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
}, { _id: false });

const shippingInfoSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    items: [orderItemSchema],
    shippingInfo: shippingInfoSchema,
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    stripeSessionId: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
        index: true
    },
    orderStatus: {
        type: String,
        enum: ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'],
        default: 'en_attente',
        index: true
    }
}, {
    timestamps: true
});

// Index pour recherche rapide par session Stripe
orderSchema.index({ stripeSessionId: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
