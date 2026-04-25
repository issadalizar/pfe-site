import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendInvoiceEmail, sendAdminNotificationEmail } from '../utils/emailService.js';
import dataSyncService from '../services/dataSyncService.js';
import notificationService from '../services/notificationService.js';

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.trim() === '') return null; //.trim() pour éviter les espaces accidentels
    return new Stripe(key);
};

//  mettre à jour le stock
const updateStockAfterPayment = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            console.error(` Commande ${orderId} non trouvée`);
            return false;
        }

        if (order.stockUpdated) {
            console.log(`ℹ Stock déjà mis à jour pour la commande ${orderId}`);
            return true;
        }

        console.log(` Mise à jour du stock pour la commande ${orderId}`);

        for (const item of order.items) {//les articles de panier
            const product = await Product.findById(item.productId);
            if (!product) {
                console.error(` Produit ${item.productId} non trouvé`);
                continue;
            }

            const ancienStock = product.stock;
            const nouveauStock = Math.max(0, ancienStock - item.quantity);

            product.stock = nouveauStock;
            await product.save();

            console.log(` ${item.productName}: ${ancienStock} → ${nouveauStock}`);

            // Notifications
            if (ancienStock > 0 && nouveauStock === 0) {
                await notificationService.notifierRupture(product, null);
            } else if (ancienStock !== nouveauStock) {
                await notificationService.notifierModificationStock(
                    product, ancienStock, nouveauStock, null
                );
            }

            try {
                await dataSyncService.updateProductInFile(
                    product._id.toString(),
                    product.toObject()
                );
            } catch (syncError) {
                console.error(' Erreur sync product:', syncError);
            }
        }

        order.stockUpdated = true;
        await order.save();

        console.log(` Stock mis à jour pour la commande ${orderId}`);
        return true;

    } catch (error) {
        console.error(' Erreur mise à jour stock:', error);
        return false;
    }
};

//  Créer une session Stripe Checkout
export const createCheckoutSession = async (req, res) => {
    const sendError = (status, message) => {
        try {
            if (!res.headersSent) res.status(status).json({ success: false, error: message });
        } catch (e) {
            console.error('Erreur envoi réponse:', e);
        }
    };
    try {
        const stripe = getStripe();
        if (!stripe) {
            return sendError(500, 'Paiement Stripe non configuré. Contactez l\'administrateur.');
        }

        const { items, shippingInfo } = req.body || {};

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Le panier est vide.'
            });
        }

        if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email ||
            !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city ||
            !shippingInfo.postalCode) {
            return res.status(400).json({
                success: false,
                error: 'Informations de livraison incomplètes.'
            });
        }

        // Vérifier le stock avant de créer la commande 
        for (const item of items) {
            const productName = item.productName || item.product?.nom || item.product?.name || item.product?.title || '';
            const productPrice = parseFloat(item.price) || 0;
            if (!productName || (productPrice <= 0 && !item.productId)) {
                return res.status(400).json({
                    success: false,
                    error: `Item invalide: nom ou prix manquant pour "${productName || 'produit'}".`
                });
            }
            // Tenter de trouver le produit en base pour vérifier le stock
            let product = null;
            if (item.productId) {
                product = await Product.findById(item.productId);
            }
            if (!product && productName) {
                product = await Product.findOne({ nom: productName }) || await Product.findOne({ slug: productName });
            }
            if (product) {
                if (product.stock < (item.quantity || 0)) {
                    return res.status(400).json({
                        success: false,
                        error: `Stock insuffisant pour "${productName}". Disponible: ${product.stock}, demandé: ${item.quantity}`
                    });
                }
            }
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Créer la commande
        const order = await Order.create({
            user: req.user._id,
            items,
            shippingInfo,
            totalAmount,
            paymentStatus: 'pending',
            orderStatus: 'en_attente'
        });

        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        // Créer la session Stripe (unit_amount en centimes, minimum 1)
        const DT_TO_EUR = 0.30;
        const line_items = items.map(item => {
            const unitAmountCents = Math.round((parseFloat(item.price) || 0) * DT_TO_EUR * 100);
            const safeAmount = Math.max(1, Math.min(unitAmountCents, 99999999));
            const name = String(item.productName || 'Produit').slice(0, 500);
            return {
                price_data: {
                    currency: 'eur',
                    product_data: { name },
                    unit_amount: safeAmount,
                },
                quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/cancel?order_id=${order._id}`,
            customer_email: shippingInfo.email,
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString()
            }
        });

        order.stripeSessionId = session.id;
        await order.save();

        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        // Envoyer notification admin (asynchrone)
        sendAdminNotificationEmail(order).catch(err => console.error('Erreur email admin:', err));

        res.json({
            success: true,
            sessionUrl: session.url,
            sessionId: session.id,
            orderId: order._id
        });

    } catch (error) {
        console.error('Erreur checkout:', error && error.stack ? error.stack : error);
        try {
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: (error && error.message) ? error.message : 'Erreur lors de la création de la session de paiement.'
                });
            }
        } catch (e) {
            console.error('Impossible d\'envoyer la réponse d\'erreur:', e);
        }
    }
};

// POST /api/orders/checkout-cod - Créer une commande avec paiement à la livraison
export const createCodOrder = async (req, res) => {
    try {
        const { items, shippingInfo } = req.body || {};

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Le panier est vide.' });
        }

        if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email ||
            !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city ||
            !shippingInfo.postalCode) {
            return res.status(400).json({ success: false, error: 'Informations de livraison incomplètes.' });
        }

        // Vérifier le stock
        for (const item of items) {
            const productName = item.productName || item.product?.nom || item.product?.name || item.product?.title || '';
            const productPrice = parseFloat(item.price) || 0;
            if (!productName || (productPrice <= 0 && !item.productId)) {
                return res.status(400).json({
                    success: false,
                    error: `Item invalide: nom ou prix manquant pour "${productName || 'produit'}".`
                });
            }
            let product = null;
            if (item.productId) {
                product = await Product.findById(item.productId);
            }
            if (!product && productName) {
                product = await Product.findOne({ nom: productName }) || await Product.findOne({ slug: productName });
            }
            if (product) {
                if (product.stock < (item.quantity || 0)) {
                    return res.status(400).json({
                        success: false,
                        error: `Stock insuffisant pour "${productName}". Disponible: ${product.stock}, demandé: ${item.quantity}`
                    });
                }
            }
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Créer la commande COD
        const order = await Order.create({
            user: req.user._id,
            items,
            shippingInfo,
            totalAmount,
            paymentMethod: 'livraison',
            paymentStatus: 'pending',
            orderStatus: 'en_attente'
        });

        // Décrémenter le stock dès la création (paiement à la livraison = commande ferme)
        await updateStockAfterPayment(order._id);

        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        // Envoyer notification admin
        sendAdminNotificationEmail(order).catch(err => console.error('Erreur email admin:', err));

        console.log(`📦 Commande COD créée: ${order._id}`);

        res.json({
            success: true,
            orderId: order._id
        });

    } catch (error) {
        console.error('Erreur checkout COD:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la commande.'
        });
    }
};

// POST /api/orders/checkout-virement - Créer une commande avec virement bancaire
export const createVirementOrder = async (req, res) => {
    try {
        const { items, shippingInfo } = req.body || {};

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Le panier est vide.' });
        }

        if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email ||
            !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city ||
            !shippingInfo.postalCode) {
            return res.status(400).json({ success: false, error: 'Informations de livraison incomplètes.' });
        }

        // Vérifier le stock
        for (const item of items) {
            const productName = item.productName || item.product?.nom || item.product?.name || item.product?.title || '';
            const productPrice = parseFloat(item.price) || 0;
            if (!productName || (productPrice <= 0 && !item.productId)) {
                return res.status(400).json({
                    success: false,
                    error: `Item invalide: nom ou prix manquant pour "${productName || 'produit'}".`
                });
            }
            let product = null;
            if (item.productId) {
                product = await Product.findById(item.productId);
            }
            if (!product && productName) {
                product = await Product.findOne({ nom: productName }) || await Product.findOne({ slug: productName });
            }
            if (product) {
                if (product.stock < (item.quantity || 0)) {
                    return res.status(400).json({
                        success: false,
                        error: `Stock insuffisant pour "${productName}". Disponible: ${product.stock}, demandé: ${item.quantity}`
                    });
                }
            }
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingInfo,
            totalAmount,
            paymentMethod: 'virement',
            paymentStatus: 'pending',
            orderStatus: 'en_attente'
        });

        // Décrémenter le stock dès la création (virement = commande ferme, stock réservé)
        await updateStockAfterPayment(order._id);

        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        sendAdminNotificationEmail(order).catch(err => console.error('Erreur email admin:', err));

        console.log(`🏦 Commande virement créée: ${order._id}`);

        res.json({
            success: true,
            orderId: order._id
        });

    } catch (error) {
        console.error('Erreur checkout virement:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la commande.'
        });
    }
};

// POST /api/orders/:id/virement-proof - Uploader la preuve de virement
export const uploadVirementProof = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvée.' });
        }

        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé.' });
        }

        if (order.paymentMethod !== 'virement') {
            return res.status(400).json({ success: false, error: 'Cette commande n\'est pas un virement bancaire.' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Aucun fichier fourni.' });
        }

        const fileUrl = `/uploads/virements/${req.file.filename}`;

        order.virementProof = {
            fileUrl,
            method: 'platform',
            uploadedAt: new Date()
        };
        await order.save();

        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        // Notifier l'admin
        sendAdminNotificationEmail(order).catch(err => console.error('Erreur email admin:', err));

        console.log(`📄 Preuve de virement uploadée pour commande: ${order._id}`);

        res.json({
            success: true,
            fileUrl,
            message: 'Preuve de virement envoyée avec succès.'
        });

    } catch (error) {
        console.error('Erreur upload preuve virement:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi de la preuve.'
        });
    }
};

// POST /api/orders/webhook - Webhook Stripe
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (webhookSecret && sig) {
            const stripe = getStripe();
            if (!stripe) return res.status(503).json({ error: 'Stripe non configuré' });
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
            try {
                const order = await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'paid',
                    orderStatus: 'confirmee',
                    stripeSessionId: session.id
                }, { new: true });

                console.log(`💰 Commande ${orderId} payée avec succès`);

                if (order) {
                    // Mettre à jour le stock
                    await updateStockAfterPayment(orderId);

                    // Synchroniser et envoyer les emails
                    await dataSyncService.updateOrderInFile(orderId, order.toObject());
                    sendInvoiceEmail(order).catch(err => console.error('Erreur email:', err));
                }
            } catch (err) {
                console.error('❌ Erreur mise à jour commande:', err);
            }
        }
    }

    res.json({ received: true });
};

// GET /api/orders/verify-session/:sessionId - Vérifier le statut d'une session
export const verifySession = async (req, res) => {
    try {
        const stripe = getStripe();
        if (!stripe) return res.status(503).json({ success: false, error: 'Stripe non configuré' });
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const orderId = session.metadata?.orderId;
            if (orderId) {
                const order = await Order.findById(orderId);

                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.orderStatus = 'confirmee';
                    await order.save();

                    // Mettre à jour le stock
                    await updateStockAfterPayment(orderId);

                    await dataSyncService.updateOrderInFile(orderId, order.toObject());
                    sendInvoiceEmail(order).catch(err => console.error('Erreur email:', err));
                }
            }
        }

        res.json({
            success: true,
            paymentStatus: session.payment_status,
            orderId: session.metadata?.orderId
        });
    } catch (error) {
        console.error('Erreur verification session:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification.'
        });
    }
};

// GET /api/orders/my-orders - Mes commandes
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Erreur recup commandes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des commandes.'
        });
    }
};

// GET /api/orders/:id - Détail commande
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'client_name email client_code');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Commande non trouvée.'
            });
        }

        // Vérifier que l'utilisateur est admin ou propriétaire de la commande
        if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Accès non autorisé.'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Erreur détail commande:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la commande.'
        });
    }
};

// GET /api/orders - Toutes les commandes (admin)
export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find()
                .populate('user', 'client_name email client_code')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments()
        ]);

        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur liste commandes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des commandes.'
        });
    }
};

// PATCH /api/orders/:id/status - Mettre à jour le statut (admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, returnDeadline, paymentStatus } = req.body;
        const validStatuses = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Statut invalide.'
            });
        }

        const updateData = { orderStatus };
        if (returnDeadline !== undefined) {
            updateData.returnDeadline = returnDeadline ? new Date(returnDeadline) : null;
        }
        if (paymentStatus && ['pending', 'paid', 'failed'].includes(paymentStatus)) {
            updateData.paymentStatus = paymentStatus;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Commande non trouvée.'
            });
        }

        try {
            await dataSyncService.updateOrderInFile(req.params.id, order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour.'
        });
    }
};

// PATCH /api/orders/:id/cancel - Annuler une commande
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Commande introuvable.'
            });
        }

        const orderOwner = order.user || order.client;
        if (!orderOwner) {
            return res.status(500).json({
                success: false,
                error: 'Impossible de vérifier le propriétaire de la commande.'
            });
        }

        if (orderOwner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Accès non autorisé.'
            });
        }

        const cancellableStatuses = ['en_attente', 'confirmee'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Cette commande ne peut plus être annulée.'
            });
        }

        const heuresEcoulees = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
        if (heuresEcoulees >= 24 && !req.user.isAdmin) {
            return res.status(400).json({
                success: false,
                error: 'Le délai d\'annulation de 24h est dépassé.'
            });
        }

        // Restaurer le stock si celui-ci avait été décrémenté (Stripe payé, COD, ou virement)
        if (order.stockUpdated) {
            console.log(`🔄 Restauration du stock pour la commande annulée ${order._id}`);

            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    const ancienStock = product.stock;
                    const nouveauStock = ancienStock + item.quantity;

                    product.stock = nouveauStock;
                    await product.save();

                    console.log(`📦 ${item.productName}: ${ancienStock} → ${nouveauStock} (restauré)`);

                    await notificationService.notifierModificationStock(
                        product,
                        ancienStock,
                        nouveauStock,
                        null
                    );

                    try {
                        await dataSyncService.updateProductInFile(
                            product._id.toString(),
                            product.toObject()
                        );
                    } catch (syncError) {
                        console.error('⚠️ Erreur sync product:', syncError);
                    }
                }
            }

            order.stockUpdated = false;
        }

        order.orderStatus = 'annulee';
        await order.save();

        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync order:', syncError);
        }

        res.json({
            success: true,
            message: 'Commande annulée avec succès.',
            order
        });

    } catch (error) {
        console.error('Erreur annulation commande:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'annulation.'
        });
    }
};

// GET /api/orders/analytics/monthly-orders - Nombre de commandes payées par mois
export const getMonthlyOrderCounts = async (req, res) => {
    try {
        const monthlyOrders = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    monthKey: {
                        $concat: [
                            { $toString: '$_id.year' },
                            '-',
                            {
                                $cond: [
                                    { $lt: ['$_id.month', 10] },
                                    { $concat: ['0', { $toString: '$_id.month' }] },
                                    { $toString: '$_id.month' }
                                ]
                            }
                        ]
                    },
                    month: {
                        $let: {
                            vars: {
                                months: [
                                    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                                ]
                            },
                            in: {
                                $concat: [
                                    { $arrayElemAt: ['$$months', { $subtract: ['$_id.month', 1] }] },
                                    ' ',
                                    { $toString: '$_id.year' }
                                ]
                            }
                        }
                    },
                    orderCount: 1
                }
            },
            { $sort: { monthKey: 1 } }
        ]);

        res.json({
            success: true,
            monthlyOrders
        });
    } catch (error) {
        console.error('Erreur statistiques commandes mensuelles :', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques de commandes mensuelles.'
        });
    }
};

// GET /api/orders/analytics/categories - Analytique des catégories les plus vendues
export const getCategoryAnalytics = async (req, res) => {
    try {
        // Agréger les données des commandes payées
        const categoryStats = await Order.aggregate([
            // Filtrer seulement les commandes payées
            { $match: { paymentStatus: 'paid' } },
            // Déplier les items de chaque commande
            { $unwind: '$items' },
            // Joindre avec la collection Product par nom de produit
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productName',
                    foreignField: 'nom',
                    as: 'product'
                }
            },
            // Déplier le produit (chaque item a un produit)
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
            // Joindre avec la collection Category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.categorie',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            // Déplier la catégorie
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: false } },
            // Grouper par catégorie
            {
                $group: {
                    _id: '$category._id',
                    categoryName: { $first: '$category.name' },
                    totalRevenue: {
                        $sum: { $multiply: ['$items.quantity', '$items.price'] }
                    },
                    totalQuantity: { $sum: '$items.quantity' },
                    orderCount: { $addToSet: '$_id' }
                }
            },
            // Calculer le nombre de commandes uniques
            {
                $addFields: {
                    uniqueOrders: { $size: '$orderCount' }
                }
            },
            // Trier par revenu total décroissant
            { $sort: { totalRevenue: -1 } },
            // Limiter aux 10 meilleures catégories
            { $limit: 10 },
            // Projeter les champs finaux
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
                    totalRevenue: 1,
                    totalQuantity: 1,
                    uniqueOrders: 1
                }
            }
        ]);

        res.json({
            success: true,
            categories: categoryStats
        });
    } catch (error) {
        console.error('Erreur analytique catégories:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques de catégories.'
        });
    }
};