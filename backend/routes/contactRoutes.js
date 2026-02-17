import express from 'express';
const router = express.Router();
import { createContact, getContacts } from '../controllers/contactController.js';

router.route('/')
    .post(createContact)
    .get(getContacts);

export default router;
