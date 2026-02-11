import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact,
  getContactStats
} from '../controllers/contactController.js';

const router = express.Router();

// Public endpoint - Create a new contact message
router.post('/', createContact);

// Admin endpoints - Get all contacts with stats
router.get('/', getAllContacts);
router.get('/stats', getContactStats);

// Admin endpoints - Get, Update, Delete contact by ID
router.get('/:id', getContactById);
router.patch('/:id/status', updateContactStatus);
router.delete('/:id', deleteContact);

export default router;
