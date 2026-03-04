import express from 'express';
import {
  getNotifications,
  marquerNotificationLue,
  getNotificationsStats
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes sont protégées (admin seulement)
router.use(protect, adminOnly);

// GET /api/notifications - Liste des notifications
router.get('/', getNotifications);

// GET /api/notifications/stats - Statistiques
router.get('/stats', getNotificationsStats);

// GET /api/notifications/non-lues - Notifications non lues (via le service)
router.get('/non-lues', async (req, res) => {
  try {
    const result = await notificationService.getNotificationsNonLues();
    res.status(200).json({
      success: true,
      data: result.notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/:id/lire - Marquer comme lue
router.put('/:id/lire', marquerNotificationLue);

// PUT /api/notifications/lire-toutes - Marquer toutes comme lues
router.put('/lire-toutes', async (req, res) => {
  try {
    const result = await notificationService.marquerToutesCommeLues();
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s)`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;