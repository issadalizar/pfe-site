import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createCheckoutSession,
    handleStripeWebhook,
    verifySession,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Webhook Stripe (doit utiliser raw body - monte separement dans server.js)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Routes protegees (client)
router.post('/checkout', protect, createCheckoutSession);
router.get('/my-orders', protect, getMyOrders);
router.get('/verify-session/:sessionId', protect, verifySession);

// ⚠️  IMPORTANT : routes spécifiques avec suffixe AVANT la route générique /:id
router.patch('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.get('/:id', protect, getOrderById);

// Routes admin
router.get('/', protect, adminOnly, getAllOrders);

export default router;
