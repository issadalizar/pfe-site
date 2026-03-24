import express from 'express';
import {
  getNotifications,
  marquerNotificationLue,
  getNotificationsStats,
  getRuptureNotifications,
  marquerToutesNotificationsLues
} from '../controllers/productController.js';
import notificationService from '../services/notificationService.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

// GET /api/notifications
router.get('/', getNotifications);

// GET /api/notifications/stats
router.get('/stats', getNotificationsStats);

// GET /api/notifications/ruptures
router.get('/ruptures', getRuptureNotifications);

// GET /api/notifications/non-lues
router.get('/non-lues', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await notificationService.getNotificationsNonLues(limit);
    res.status(200).json({
      success: true,
      data: result.notifications,
      nonLuesCount: result.notifications.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/lire-toutes  ← DOIT être AVANT /:id/lire
router.put('/lire-toutes', marquerToutesNotificationsLues);

// PUT /api/notifications/:id/lire
router.put('/:id/lire', marquerNotificationLue);

export default router;