import Category from '../models/Category.js';

// @desc    Récupérer toutes les catégories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent');
    
    console.log(`✅ ${categories.length} catégories récupérées`);
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ Erreur dans getAllCategories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des catégories',
      message: error.message 
    });
  }
};

// @desc    Récupérer une catégorie par ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent');
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    console.log(`✅ Catégorie "${category.name}" récupérée`);
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('❌ Erreur dans getCategoryById:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      message: error.message 
    });
  }
};

// @desc    Créer une nouvelle catégorie
// @route   POST /api/categories
// @access  Public (à protéger plus tard)
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, level } = req.body;
    
    // Validation basique
    if (!name) {
      return res.status(400).json({ 
        success: false,
        error: 'Le nom de la catégorie est requis' 
      });
    }
    
    const categoryData = {
      name,
      description: description || '',
      parent: parent || null,
      level: level || 1
    };
    
    const category = await Category.create(categoryData);
    
    console.log(`✅ Catégorie créée: ${category.name}`);
    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category
    });
  } catch (error) {
    console.error('❌ Erreur dans createCategory:', error);
    
    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Cette catégorie existe déjà' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la création',
      message: error.message 
    });
  }
};

// @desc    Mettre à jour une catégorie
// @route   PUT /api/categories/:id
// @access  Public (à protéger plus tard)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    // Mise à jour des champs autorisés
    const allowedUpdates = ['name', 'description', 'parent', 'level', 'isActive'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(category, updates);
    await category.save();
    
    console.log(`✅ Catégorie mise à jour: ${category.name}`);
    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category
    });
  } catch (error) {
    console.error('❌ Erreur dans updateCategory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour',
      message: error.message 
    });
  }
};

// @desc    Supprimer une catégorie
// @route   DELETE /api/categories/:id
// @access  Public (à protéger plus tard)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    await category.deleteOne();
    
    console.log(`✅ Catégorie supprimée: ${category.name}`);
    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur dans deleteCategory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la suppression',
      message: error.message 
    });
  }
};