import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createCheckoutSession,
    createCodOrder,
    createVirementOrder,
    uploadVirementProof,
    handleStripeWebhook,
    verifySession,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getCategoryAnalytics,
    getMonthlyOrderCounts
} from '../controllers/orderController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const virementStorage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads', 'virements'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'virement-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadVirement = multer({
    storage: virementStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|pdf|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Seuls les fichiers image (JPG, PNG, WEBP) et PDF sont acceptés.'));
    }
});

const router = express.Router();

// Webhook Stripe (doit utiliser raw body - monte separement dans server.js)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Routes protegees (client)
router.post('/checkout', protect, createCheckoutSession);
router.post('/checkout-cod', protect, createCodOrder);
router.post('/checkout-virement', protect, createVirementOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/verify-session/:sessionId', protect, verifySession);

// ⚠️  IMPORTANT : routes spécifiques avec suffixe AVANT la route générique /:id
router.post('/:id/virement-proof', protect, uploadVirement.single('proof'), uploadVirementProof);
router.patch('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.get('/:id', protect, getOrderById);

// Routes admin
router.get('/analytics/categories', protect, adminOnly, getCategoryAnalytics);
router.get('/analytics/monthly-orders', protect, adminOnly, getMonthlyOrderCounts);
router.get('/', protect, adminOnly, getAllOrders);

export default router;
