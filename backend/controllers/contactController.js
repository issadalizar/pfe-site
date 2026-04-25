import Contact from '../models/Contact.js';

//  Créer un message de contact
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

//   Récupérer tous les messages de contact 
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

//   Mettre à jour le statut d'un message
//  Private (admin)
export const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'read', 'archived'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Statut invalide.' });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ success: false, error: 'Message non trouve.' });
        }

        res.json({ success: true, data: contact });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

//   Supprimer un message de contact
//  Private (admin)
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({ success: false, error: 'Message non trouve.' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};
