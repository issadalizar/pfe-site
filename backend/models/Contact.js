import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Veuillez fournir une adresse email valide'
        ]
    },
    subject: {
        type: String,
        required: [true, 'Le sujet est requis'],
        enum: ['assistance', 'commercial', 'reclamation', 'autre']
    },
    message: {
        type: String,
        required: [true, 'Le message est requis']
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'archived'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Contact', contactSchema);
