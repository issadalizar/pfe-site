// controllers/factureController.js
import Order from '../models/Order.js';

// @desc    Créer une facture à partir d'une commande
// @route   POST /api/factures
// @access  Private
export const createFacture = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvée' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Accès refusé' });
        }

        if (order.invoices && order.invoices.length > 0) {
            // Transformer les données au format attendu par le frontend
            const formattedInvoices = order.invoices.map(inv => ({
                _id: inv._id,
                factureNumber: inv.invoiceNumber,
                createdAt: inv.generatedAt,
                totalAmount: inv.totalAmount,
                items: order.items,
                shippingInfo: order.shippingInfo,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                order: order._id
            }));
            return res.json({ success: true, data: formattedInvoices });
        }

        const newInvoice = await order.addInvoice({
            totalAmount: order.totalAmount
        });

        // Retourner au format attendu par le frontend
        res.status(201).json({ 
            success: true, 
            data: {
                _id: newInvoice._id,
                factureNumber: newInvoice.invoiceNumber,
                createdAt: newInvoice.generatedAt,
                totalAmount: newInvoice.totalAmount,
                items: order.items,
                shippingInfo: order.shippingInfo,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                order: order._id
            }
        });
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
        const orders = await Order.find({ 
            user: req.user._id,
            invoices: { $exists: true, $ne: [] }
        }).sort({ createdAt: -1 });
        
        const allInvoices = [];
        
        for (const order of orders) {
            if (order.invoices && order.invoices.length > 0) {
                for (const invoice of order.invoices) {
                    // Transformer au format attendu par le frontend
                    allInvoices.push({
                        _id: invoice._id,
                        factureNumber: invoice.invoiceNumber,  // ← clé factureNumber
                        createdAt: invoice.generatedAt,        // ← clé createdAt
                        totalAmount: invoice.totalAmount,
                        order: order._id,
                        orderStatus: order.orderStatus,
                        paymentStatus: order.paymentStatus,
                        paymentMethod: order.paymentMethod,
                        items: order.items,
                        shippingInfo: order.shippingInfo
                    });
                }
            }
        }
        
        // Trier par date décroissante
        allInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log(`📄 ${allInvoices.length} factures retournées`);
        res.json({ success: true, data: allInvoices });
    } catch (error) {
        console.error('Erreur récupération factures:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Récupérer une facture par ID
// @route   GET /api/factures/:id
// @access  Private
export const getFactureById = async (req, res) => {
    try {
        const order = await Order.findOne({
            user: req.user._id,
            'invoices._id': req.params.id
        });
        
        if (!order) {
            return res.status(404).json({ success: false, error: 'Facture non trouvée' });
        }
        
        const invoice = order.invoices.id(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Facture non trouvée' });
        }
        
        // Transformer au format attendu par le frontend
        res.json({ 
            success: true, 
            data: {
                _id: invoice._id,
                factureNumber: invoice.invoiceNumber,
                createdAt: invoice.generatedAt,
                totalAmount: invoice.totalAmount,
                order: order._id,
                items: order.items,
                shippingInfo: order.shippingInfo,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod
            }
        });
    } catch (error) {
        console.error('Erreur récupération facture:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Récupérer toutes les factures (admin)
// @route   GET /api/factures
// @access  Private (Admin)
export const getAllFactures = async (req, res) => {
    try {
        const orders = await Order.find({ 
            invoices: { $exists: true, $ne: [] } 
        })
        .populate('user', 'client_name email')
        .sort({ createdAt: -1 });
        
        const allInvoices = [];
        for (const order of orders) {
            if (order.invoices && order.invoices.length > 0) {
                for (const invoice of order.invoices) {
                    allInvoices.push({
                        _id: invoice._id,
                        factureNumber: invoice.invoiceNumber,
                        createdAt: invoice.generatedAt,
                        totalAmount: invoice.totalAmount,
                        orderId: order._id,
                        user: order.user,
                        orderStatus: order.orderStatus,
                        paymentStatus: order.paymentStatus
                    });
                }
            }
        }
        
        res.json({ success: true, count: allInvoices.length, data: allInvoices });
    } catch (error) {
        console.error('Erreur récupération factures admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Régénérer une facture
// @route   POST /api/factures/:orderId/regenerate
// @access  Private
export const regenerateFacture = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvée' });
        }
        
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ success: false, error: 'Accès refusé' });
        }
        
        const newInvoice = await order.addInvoice({
            totalAmount: order.totalAmount,
            pdfUrl: req.body.pdfUrl || null
        });
        
        // Retourner au format attendu par le frontend
        res.json({ 
            success: true, 
            data: {
                _id: newInvoice._id,
                factureNumber: newInvoice.invoiceNumber,
                createdAt: newInvoice.generatedAt,
                totalAmount: newInvoice.totalAmount
            },
            message: 'Nouvelle facture générée avec succès'
        });
    } catch (error) {
        console.error('Erreur régénération facture:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};