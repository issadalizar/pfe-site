import Contact from '../models/Contact.js';

// Get all contact messages (Admin only)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des contacts'
    });
  }
};

// Get contact by ID (Admin only)
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Message de contact non trouvé'
      });
    }

    // Mark as read
    contact.status = 'read';
    await contact.save();

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération du contact'
    });
  }
};

// Create a new contact message (Public endpoint)
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis'
      });
    }

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Create new contact
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
      userAgent
    });

    res.status(201).json({
      success: true,
      message: 'Votre message a été reçu avec succès!',
      data: contact
    });
  } catch (error) {
    // Validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi du message'
    });
  }
};

// Update contact status (Admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'responded', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Message de contact non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour du statut'
    });
  }
};

// Delete contact (Admin only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Message de contact non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression du message'
    });
  }
};

// Get contact statistics (Admin only)
export const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const responded = await Contact.countDocuments({ status: 'responded' });
    const archived = await Contact.countDocuments({ status: 'archived' });

    // Messages from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMessages = await Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({
      success: true,
      data: {
        total,
        newMessages,
        responded,
        archived,
        recentMessages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
};
