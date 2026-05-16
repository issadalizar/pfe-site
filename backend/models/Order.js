// models/Order.js
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        required: true
    },
    pdfUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'generated', 'cancelled'],
        default: 'generated'
    }
}, { _id: true, timestamps: true });

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
    stockUpdated: {
        type: Boolean,
        default: false
    },
    // ✅ NOUVEAU: Tableau des factures liées à la commande
    invoices: [invoiceSchema],
    // Facture principale (la plus récente)
    currentInvoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order.invoices'
    }
}, { timestamps: true });

// Index pour améliorer les performances
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ stripeSessionId: 1 });
orderSchema.index({ 'invoices.invoiceNumber': 1 });

// Méthode pour générer un numéro de facture
orderSchema.statics.generateInvoiceNumber = async function() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.aggregate([
        { $unwind: '$invoices' },
        { $count: 'total' }
    ]);
    const invoiceCount = (count[0]?.total || 0) + 1;
    return `INV-${year}${month}-${String(invoiceCount).padStart(6, '0')}`;
};

// Méthode pour ajouter une facture à la commande
orderSchema.methods.addInvoice = async function(invoiceData) {
    const OrderModel = this.constructor;
    const invoiceNumber = await OrderModel.generateInvoiceNumber();
    
    const newInvoice = {
        invoiceNumber,
        generatedAt: new Date(),
        totalAmount: invoiceData.totalAmount || this.totalAmount,
        pdfUrl: invoiceData.pdfUrl || null,
        status: 'generated'
    };
    
    this.invoices.push(newInvoice);
    this.currentInvoice = this.invoices[this.invoices.length - 1]._id;
    await this.save();
    
    return newInvoice;
};

// Méthode pour récupérer la dernière facture
orderSchema.methods.getLastInvoice = function() {
    if (this.invoices.length === 0) return null;
    return this.invoices[this.invoices.length - 1];
};

// Méthode pour récupérer toutes les factures
orderSchema.methods.getAllInvoices = function() {
    return this.invoices.sort((a, b) => b.generatedAt - a.generatedAt);
};

const Order = mongoose.model('Order', orderSchema);

export default Order;