import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    createReturnRequest,
    getMyReturnRequests,
    getAllReturnRequests,
    updateReturnRequestStatus
} from '../controllers/returnRequestController.js';

const router = express.Router();

// Routes client (protégées)
router.post('/', protect, createReturnRequest);
router.get('/my-requests', protect, getMyReturnRequests);

// Routes admin
router.get('/', protect, adminOnly, getAllReturnRequests);
router.patch('/:id/status', protect, adminOnly, updateReturnRequestStatus);

export default router;
