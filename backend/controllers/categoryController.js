import Category from '../models/Category.js';
import dataSyncService from '../services/dataSyncService.js';


export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent');
    
    console.log(`${categories.length} catégories récupérées`);
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error(' Erreur dans getAllCategories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la récupération des catégories',
      message: error.message 
    });
  }
};


export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent');
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    console.log(` Catégorie "${category.name}" récupérée`);
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error(' Erreur dans getCategoryById:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      message: error.message 
    });
  }
};

//   Créer une nouvelle catégorie
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, level } = req.body;
    
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

    //SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.updateCategoryInFile(
        category._id.toString(),
        category.toObject()
      );
    } catch (syncError) {
      console.error(' Erreur sync productData:', syncError);
    }
    
    console.log(` Catégorie créée: ${category.name}`);
    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category
    });
  } catch (error) {
    console.error(' Erreur dans createCategory:', error);
    
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

//    Mettre à jour une catégorie
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Catégorie non trouvée' 
      });
    }
    
    const allowedUpdates = ['name', 'description', 'parent', 'level', 'isActive'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(category, updates);
    await category.save();

    //SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.updateCategoryInFile(
        req.params.id,
        category.toObject()
      );
    } catch (syncError) {
      console.error(' Erreur sync productData:', syncError);
    }
    
    console.log(` Catégorie mise à jour: ${category.name}`);
    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category
    });
  } catch (error) {
    console.error(' Erreur dans updateCategory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la mise à jour',
      message: error.message 
    });
  }
};

//    Supprimer une catégorie
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

    //SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.deleteCategoryFromFile(req.params.id);
    } catch (syncError) {
      console.error(' Erreur sync productData:', syncError);
    }
    
    console.log(` Catégorie supprimée: ${category.name}`);
    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error(' Erreur dans deleteCategory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de la suppression',
      message: error.message 
    });
  }
};