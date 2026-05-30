import mongoose from 'mongoose';

const returnItemSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const returnRequestSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['retour', 'echange'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxlength: 1000
    },
    items: [returnItemSchema],
    status: {
        type: String,
        enum: ['en_attente', 'acceptee', 'refusee'],
        default: 'en_attente',
        index: true
    },
    adminNote: {
        type: String,
        default: '',
        maxlength: 1000
    },
    // Date limite pour que le client renvoie physiquement le produit (fixée par l'admin après réception de la demande)
    returnDeadline: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
