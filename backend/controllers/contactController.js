import Contact from '../models/Contact.js';

// @desc    Créer un nouveau message de contact
// @route   POST /api/contact
// @access  Public
export const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            data: contact,
            message: 'Votre message a été envoyé avec succès'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Obtenir tous les messages (pour admin futur)
// @route   GET /api/contact
// @access  Private (TODO: protect)
export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};
