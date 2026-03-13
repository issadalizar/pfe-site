// controllers/orderController.js
import Stripe from 'stripe';
import Order from '../models/Order.js';
import { sendInvoiceEmail, sendAdminNotificationEmail } from '../utils/emailService.js';
import dataSyncService from '../services/dataSyncService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/orders/checkout - Creer une session Stripe Checkout
export const createCheckoutSession = async (req, res) => {
    try {
        const { items, shippingInfo } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'Le panier est vide.' });
        }
        if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
            return res.status(400).json({ success: false, error: 'Informations de livraison incompletes.' });
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const DT_TO_EUR = 0.30;
        const line_items = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.productName,
                },
                unit_amount: Math.round(item.price * DT_TO_EUR * 100),
            },
            quantity: item.quantity,
        }));

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
            console.error('⚠️ Erreur sync productData:', syncError);
        }

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
            console.error('⚠️ Erreur sync productData:', syncError);
        }

        sendAdminNotificationEmail(order).catch(err => console.error('Erreur email admin:', err));

        res.json({
            success: true,
            sessionUrl: session.url,
            sessionId: session.id,
            orderId: order._id
        });

    } catch (error) {
        console.error('Erreur checkout:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur lors de la creation de la session de paiement.' });
    }
};

// POST /api/orders/webhook - Webhook Stripe
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (webhookSecret && sig) {
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

                console.log(`Commande ${orderId} payee avec succes`);

                if (order) {
                    await dataSyncService.updateOrderInFile(orderId, order.toObject());
                    sendInvoiceEmail(order).catch(err => console.error('Erreur email:', err));
                }
            } catch (err) {
                console.error('Erreur mise a jour commande:', err);
            }
        }
    }

    res.json({ received: true });
};

// GET /api/orders/verify-session/:sessionId - Verifier le statut d'une session
export const verifySession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const orderId = session.metadata?.orderId;
            if (orderId) {
                const order = await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'paid',
                    orderStatus: 'confirmee'
                }, { new: true });

                if (order) {
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
        res.status(500).json({ success: false, error: 'Erreur lors de la verification.' });
    }
};

// GET /api/orders/my-orders - Mes commandes
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Erreur recup commandes:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la recuperation des commandes.' });
    }
};

// GET /api/orders/:id - Detail commande
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'client_name email client_code');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvee.' });
        }

        if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Acces non autorise.' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Erreur detail commande:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la recuperation de la commande.' });
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
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Erreur liste commandes:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la recuperation des commandes.' });
    }
};

// PATCH /api/orders/:id/status - Mettre a jour le statut (admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ success: false, error: 'Statut invalide.' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande non trouvee.' });
        }

        try {
            await dataSyncService.updateOrderInFile(req.params.id, order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync productData:', syncError);
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Erreur mise a jour statut:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la mise a jour.' });
    }
};

// PATCH /api/orders/:id/cancel - Annuler une commande (client, dans les 24h)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Commande introuvable.' });
        }

        // Récupérer le champ owner (supporte "user" et "client" selon le modèle)
        const orderOwner = order.user || order.client;
        if (!orderOwner) {
            return res.status(500).json({ success: false, error: 'Impossible de vérifier le propriétaire de la commande.' });
        }

        // Vérifier que la commande appartient bien au client connecté
        if (orderOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé.' });
        }

        // Vérifier le statut : seulement en_attente ou confirmee
        const cancellableStatuses = ['en_attente', 'confirmee'];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Cette commande ne peut plus être annulée (déjà expédiée, livrée ou annulée).'
            });
        }

        // Vérifier la fenêtre de 24h
        const heuresEcoulees = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
        if (heuresEcoulees >= 24) {
            return res.status(400).json({
                success: false,
                error: 'Le délai d\'annulation de 24h est dépassé.'
            });
        }

        // Annuler la commande
        order.orderStatus = 'annulee';
        await order.save();

        // Sync fichier
        try {
            await dataSyncService.updateOrderInFile(order._id.toString(), order.toObject());
        } catch (syncError) {
            console.error('⚠️ Erreur sync productData:', syncError);
        }

        res.json({ success: true, message: 'Commande annulée avec succès.', order });

    } catch (error) {
        console.error('Erreur annulation commande:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation.' });
    }
};