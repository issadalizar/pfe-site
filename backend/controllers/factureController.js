import Facture from '../models/Facture.js';
import Order from '../models/Order.js';

// @desc    Créer une facture à partir d'une commande
// @route   POST /api/factures
// @access  Private
export const createFacture = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Vérifier si la facture existe déjà pour cette commande
        const existing = await Facture.findOne({ order: orderId, user: req.user._id });
        if (existing) {
            return res.json({ success: true, data: existing });
        }

        // Récupérer la commande
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvée' });
        }

        // Vérifier que la commande appartient à l'utilisateur
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Accès refusé' });
        }

        // Générer le numéro de facture
        const year = new Date().getFullYear();
        const count = await Facture.countDocuments();
        const factureNumber = `FAC-${year}-${String(count + 1).padStart(5, '0')}`;

        const facture = await Facture.create({
            order: order._id,
            user: req.user._id,
            factureNumber,
            items: order.items,
            shippingInfo: order.shippingInfo,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
        });

        res.status(201).json({ success: true, data: facture });
    } catch (error) {
        console.error('Erreur création facture:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Récupérer les factures de l'utilisateur connecté
// @route   GET /api/factures/my-factures
// @access  Private
export const getMyFactures = async (req, res) => {
    try {
        const factures = await Facture.find({ user: req.user._id })
            .populate('order', 'orderStatus paymentStatus paymentMethod totalAmount')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: factures });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Récupérer une facture par ID
// @route   GET /api/factures/:id
// @access  Private
export const getFactureById = async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id)
            .populate('order', 'orderStatus paymentStatus paymentMethod totalAmount');
        if (!facture) {
            return res.status(404).json({ success: false, error: 'Facture non trouvée' });
        }
        if (facture.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Accès refusé' });
        }
        res.json({ success: true, data: facture });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Récupérer toutes les factures (admin)
// @route   GET /api/factures
// @access  Private (Admin)
export const getAllFactures = async (req, res) => {
    try {
        const factures = await Facture.find()
            .populate('user', 'client_name email')
            .populate('order', 'orderStatus paymentStatus')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: factures.length, data: factures });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
