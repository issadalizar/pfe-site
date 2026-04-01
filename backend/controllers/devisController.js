import Devis from '../models/Devis.js';

// @desc    Récupérer tous les devis
// @route   GET /api/devis
// @access  Private (Admin)
export const getAllDevis = async (req, res) => {
    try {
        const devis = await Devis.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: devis.length,
            data: devis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Récupérer un devis par ID
// @route   GET /api/devis/:id
// @access  Private (Admin)
export const getDevisById = async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);
        
        if (!devis) {
            return res.status(404).json({
                success: false,
                error: 'Devis non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: devis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Créer un nouveau devis
// @route   POST /api/devis
// @access  Public
export const createDevis = async (req, res) => {
    try {
        const devisData = {
            ...req.body,
            status: 'pending'
        };
        
        const devis = await Devis.create(devisData);
        
        res.status(201).json({
            success: true,
            data: devis
        });
    } catch (error) {
        console.error('Erreur création devis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Mettre à jour le statut d'un devis
// @route   PATCH /api/devis/:id/status
// @access  Private (Admin)
export const updateDevisStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Vérifier si le statut est valide
        if (!['pending', 'read', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Statut invalide'
            });
        }
        
        const devis = await Devis.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!devis) {
            return res.status(404).json({
                success: false,
                error: 'Devis non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: devis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Supprimer un devis
// @route   DELETE /api/devis/:id
// @access  Private (Admin)
export const deleteDevis = async (req, res) => {
    try {
        const { id } = req.params;
        const devis = await Devis.findByIdAndDelete(id);
        
        if (!devis) {
            return res.status(404).json({
                success: false,
                error: 'Devis non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Devis supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Récupérer les statistiques des devis
// @route   GET /api/devis/stats
// @access  Private (Admin)
export const getDevisByProduct = async (req, res) => {
    try {
        const devis = await Devis.find({ product: req.params.productId })
            .populate('product', 'nom prix description images categorie modele')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDevisStats = async (req, res) => {
    try {
        const total = await Devis.countDocuments();
        const pending = await Devis.countDocuments({ status: 'pending' });
        const read = await Devis.countDocuments({ status: 'read' });
        const archived = await Devis.countDocuments({ status: 'archived' });
        
        res.json({
            success: true,
            data: {
                total,
                pending,
                read,
                archived
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};