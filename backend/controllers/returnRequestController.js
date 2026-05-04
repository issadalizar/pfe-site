import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import { sendReturnRequestNotificationEmail } from '../utils/emailService.js';

// POST /api/return-requests - Créer une demande de retour/échange (client)
export const createReturnRequest = async (req, res) => {
    try {
        const { orderId, type, reason, items } = req.body;

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

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvée.' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé.' });
        }

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

        if (order.returnDeadline && new Date() > new Date(order.returnDeadline)) {
            return res.status(400).json({
                success: false,
                error: 'Le délai pour effectuer un retour/échange est dépassé.'
            });
        }

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

        const returnRequest = await ReturnRequest.create({
            order: orderId,
            user: req.user._id,
            type,
            reason,
            items
        });

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
            .populate('order', 'items totalAmount orderStatus paymentStatus createdAt returnDeadline')
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
            .populate('order', 'items totalAmount orderStatus paymentStatus createdAt shippingInfo returnDeadline')
            .sort({ createdAt: -1 });

        res.json({ success: true, returnRequests: requests });
    } catch (error) {
        console.error('Erreur liste demandes retour:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des demandes.' });
    }
};

// GET /api/return-requests/analytics/products - Taux de retour / échange par produit (admin)
export const getReturnRequestAnalytics = async (req, res) => {
    try {
        // DEBUG: compter toutes les commandes
        const totalOrders = await Order.countDocuments({});
        const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
        console.log(`📊 Total commandes: ${totalOrders}, Payées: ${paidOrders}`);

        const soldProducts = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productName',
                    totalSoldQuantity: { $sum: '$items.quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: '$_id',
                    totalSoldQuantity: 1
                }
            }
        ]);

        console.log('✅ soldProducts:', JSON.stringify(soldProducts));

        const returnCounts = await ReturnRequest.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        productName: '$items.productName',
                        type: '$type'
                    },
                    quantity: { $sum: '$items.quantity' }
                }
            },
            {
                $group: {
                    _id: '$_id.productName',
                    items: {
                        $push: {
                            type: '$_id.type',
                            quantity: '$quantity'
                        }
                    },
                    totalReturnExchangeQuantity: { $sum: '$quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: '$_id',
                    totalReturnExchangeQuantity: 1,
                    items: 1
                }
            }
        ]);

        console.log('✅ returnCounts:', JSON.stringify(returnCounts));

        const soldMap = new Map(soldProducts.map(item => [item.productName, item.totalSoldQuantity]));
        const returnMap = new Map(returnCounts.map(item => [item.productName, item]));

        const allProductNames = new Set([
            ...soldProducts.map(item => item.productName),
            ...returnCounts.map(item => item.productName)
        ]);

        console.log('✅ allProductNames:', [...allProductNames]);

        const productsWithRates = Array.from(allProductNames).map((productName) => {
            const soldQty = soldMap.get(productName) || 0;
            const returnItem = returnMap.get(productName);
            const returnQty = returnItem?.items.find(i => i.type === 'retour')?.quantity || 0;
            const exchangeQty = returnItem?.items.find(i => i.type === 'echange')?.quantity || 0;
            const totalReturnExchangeQty = returnItem?.totalReturnExchangeQuantity || 0;

            const totalRate = soldQty > 0 ? (totalReturnExchangeQty / soldQty) * 100 : 0;
            const returnRate = soldQty > 0 ? (returnQty / soldQty) * 100 : 0;
            const exchangeRate = soldQty > 0 ? (exchangeQty / soldQty) * 100 : 0;

            return {
                productName,
                totalSoldQuantity: soldQty,
                returnQuantity: returnQty,
                exchangeQuantity: exchangeQty,
                totalReturnExchangeQuantity: totalReturnExchangeQty,
                totalRate: Number(totalRate.toFixed(1)),
                returnRate: Number(returnRate.toFixed(1)),
                exchangeRate: Number(exchangeRate.toFixed(1))
            };
        })
            .sort((a, b) => {
                if (b.totalRate !== a.totalRate) return b.totalRate - a.totalRate;
                return b.totalSoldQuantity - a.totalSoldQuantity;
            })
            .slice(0, 8);

        console.log('✅ productsWithRates:', JSON.stringify(productsWithRates));

        res.json({ success: true, products: productsWithRates });
    } catch (error) {
        console.error('Erreur analytics retour/échange produits:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des analytics de retour/échange.' });
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
            .populate('order', 'items totalAmount orderStatus paymentStatus createdAt shippingInfo returnDeadline');

        if (!returnRequest) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée.' });
        }

        res.json({ success: true, returnRequest });
    } catch (error) {
        console.error('Erreur mise à jour demande retour:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour.' });
    }
};

// PATCH /api/return-requests/:id/deadline - Mettre à jour la date limite de retour du produit (admin)
export const updateReturnRequestDeadline = async (req, res) => {
    try {
        const { returnDeadline } = req.body;

        const value = returnDeadline ? new Date(returnDeadline) : null;
        if (returnDeadline && isNaN(value.getTime())) {
            return res.status(400).json({ success: false, error: 'Date invalide.' });
        }

        const returnRequest = await ReturnRequest.findByIdAndUpdate(
            req.params.id,
            { returnDeadline: value },
            { new: true }
        ).populate('user', 'client_name email client_code')
         .populate('order', 'items totalAmount orderStatus paymentStatus createdAt shippingInfo returnDeadline');

        if (!returnRequest) {
            return res.status(404).json({ success: false, error: 'Demande non trouvée.' });
        }

        res.json({ success: true, returnRequest });
    } catch (error) {
        console.error('Erreur mise à jour deadline:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de la date limite.' });
    }
};