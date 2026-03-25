import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import { sendReturnRequestNotificationEmail } from '../utils/emailService.js';

// POST /api/return-requests - Créer une demande de retour/échange (client)
export const createReturnRequest = async (req, res) => {
    try {
        const { orderId, type, reason, items } = req.body;

        // Validations
        if (!orderId || !type || !reason || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Veuillez remplir tous les champs obligatoires (commande, type, motif, articles).'
            });
        }

        if (!['retour', 'echange'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Type invalide. Choisissez "retour" ou "echange".'
            });
        }

        // Vérifier que la commande existe et appartient au user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvée.' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé.' });
        }

        // Vérifier que la commande est livrée et payée
        if (order.orderStatus !== 'livree') {
            return res.status(400).json({
                success: false,
                error: 'La commande doit être livrée pour faire une demande de retour/échange.'
            });
        }

        if (order.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'La commande doit être payée pour faire une demande de retour/échange.'
            });
        }

        // Vérifier la date limite de retour
        if (order.returnDeadline && new Date() > new Date(order.returnDeadline)) {
            return res.status(400).json({
                success: false,
                error: 'Le délai pour effectuer un retour/échange est dépassé.'
            });
        }

        // Vérifier qu'il n'y a pas déjà une demande en cours pour cette commande
        const existingRequest = await ReturnRequest.findOne({
            order: orderId,
            status: 'en_attente'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                error: 'Une demande est déjà en cours pour cette commande.'
            });
        }

        // Créer la demande
        const returnRequest = await ReturnRequest.create({
            order: orderId,
            user: req.user._id,
            type,
            reason,
            items
        });

        // Envoyer notification email à l'admin
        sendReturnRequestNotificationEmail(returnRequest, order)
            .catch(err => console.error('Erreur email notification retour:', err));

        res.status(201).json({
            success: true,
            returnRequest,
            message: 'Votre demande a été envoyée avec succès.'
        });

    } catch (error) {
        console.error('Erreur création demande retour:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la création de la demande.' });
    }
};

// GET /api/return-requests/my-requests - Mes demandes (client)
export const getMyReturnRequests = async (req, res) => {
    try {
        const requests = await ReturnRequest.find({ user: req.user._id })
            .populate('order', 'items totalAmount orderStatus paymentStatus createdAt')
            .sort({ createdAt: -1 });

        res.json({ success: true, returnRequests: requests });
    } catch (error) {
        console.error('Erreur récup demandes retour:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des demandes.' });
    }
};

// GET /api/return-requests - Toutes les demandes (admin)
export const getAllReturnRequests = async (req, res) => {
    try {
        const requests = await ReturnRequest.find()
            .populate('user', 'client_name email client_code')
            .populate('order', 'items totalAmount orderStatus paymentStatus createdAt shippingInfo')
            .sort({ createdAt: -1 });

        res.json({ success: true, returnRequests: requests });
    } catch (error) {
        console.error('Erreur liste demandes retour:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des demandes.' });
    }
};

// PATCH /api/return-requests/:id/status - Mettre à jour le statut (admin)
export const updateReturnRequestStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const validStatuses = ['en_attente', 'acceptee', 'refusee'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Statut invalide.' });
        }

        const updateData = { status };
        if (adminNote !== undefined) {
            updateData.adminNote = adminNote;
        }

        const returnRequest = await ReturnRequest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'client_name email client_code')
            .populate('order', 'items totalAmount orderStatus paymentStatus createdAt shippingInfo');

        if (!returnRequest) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée.' });
        }

        res.json({ success: true, returnRequest });
    } catch (error) {
        console.error('Erreur mise à jour demande retour:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour.' });
    }
};
