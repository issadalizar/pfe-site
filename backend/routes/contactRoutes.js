import express from 'express';
const router = express.Router();
import { createContact, getContacts, updateContactStatus, deleteContact } from '../controllers/contactController.js';

router.route('/')
    .post(createContact)
    .get(getContacts);

router.patch('/:id/status', updateContactStatus);
router.delete('/:id', deleteContact);

export default router;
