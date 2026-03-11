// backend/controllers/specificationController.js
import Specification from '../models/Specification.js';
import Product from '../models/Product.js';
import dataSyncService from '../services/dataSyncService.js'; // AJOUT

// @desc    Récupérer toutes les spécifications d'un produit
// @route   GET /api/specifications/product/:productId
export const getProductSpecifications = async (req, res) => {
  try {
    const specs = await Specification.find({ 
      productId: req.params.productId 
    }).sort({ type: 1, order: 1, createdAt: 1 });
    
    res.json({ 
      success: true, 
      count: specs.length,
      data: specs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Récupérer les spécifications groupées par type
// @route   GET /api/specifications/product/:productId/grouped
export const getGroupedSpecifications = async (req, res) => {
  try {
    const specs = await Specification.find({ 
      productId: req.params.productId 
    }).sort({ order: 1 });

    const grouped = {
      general: specs.filter(s => s.type === 'general'),
      advanced: specs.filter(s => s.type === 'advanced')
    };

    res.json({ 
      success: true, 
      data: grouped,
      counts: {
        general: grouped.general.length,
        advanced: grouped.advanced.length,
        total: specs.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Créer une spécification
// @route   POST /api/specifications
export const createSpecification = async (req, res) => {
  try {
    const { productId, key, value, type, order } = req.body;

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produit non trouvé' 
      });
    }

    // Vérifier les champs obligatoires
    if (!key || !value) {
      return res.status(400).json({ 
        success: false, 
        error: 'La clé et la valeur sont obligatoires' 
      });
    }

    // Valider le type
    const validTypes = ['general', 'advanced'];
    const specType = type && validTypes.includes(type) ? type : 'general';

    const spec = new Specification({
      productId,
      key: key.trim(),
      value: value.trim(),
      type: specType,
      order: order || 0
    });

    await spec.save();

    // 🔄 SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.updateSpecificationInFile(
        spec._id.toString(),
        spec.toObject()
      );
    } catch (syncError) {
      console.error('⚠️ Erreur sync productData:', syncError);
    }
    
    res.status(201).json({ 
      success: true, 
      data: spec 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        error: 'Cette spécification existe déjà pour ce produit' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};

// @desc    Créer plusieurs spécifications en lot
// @route   POST /api/specifications/product/:productId/bulk
export const createBulkSpecifications = async (req, res) => {
  try {
    const { specs } = req.body;
    const productId = req.params.productId;

    if (!Array.isArray(specs) || specs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le tableau specs est requis et ne peut pas être vide' 
      });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produit non trouvé' 
      });
    }

    // Valider les types
    const validTypes = ['general', 'advanced'];

    // Préparer les spécifications à créer
    const specsToCreate = specs.map((spec, index) => {
      // Valider le type
      const specType = spec.type && validTypes.includes(spec.type) ? spec.type : 'general';
      
      return {
        productId,
        key: spec.key?.trim(),
        value: spec.value?.trim(),
        type: specType,
        order: spec.order ?? index
      };
    });

    // Valider que chaque spécification a key et value
    for (const spec of specsToCreate) {
      if (!spec.key || !spec.value) {
        return res.status(400).json({ 
          success: false, 
          error: 'Chaque spécification doit avoir une clé et une valeur' 
        });
      }
    }

    // Supprimer les anciennes spécifications du produit
    await Specification.deleteMany({ productId });

    // Créer les nouvelles
    const created = await Specification.insertMany(specsToCreate, { 
      ordered: false
    });

    // 🔄 SYNC AVEC PRODUCTDATA.JS (pour chaque spécification)
    for (const spec of created) {
      try {
        await dataSyncService.updateSpecificationInFile(
          spec._id.toString(),
          spec.toObject()
        );
      } catch (syncError) {
        console.error('⚠️ Erreur sync productData:', syncError);
      }
    }

    res.status(201).json({ 
      success: true, 
      count: created.length,
      data: created 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        error: 'Certaines spécifications existent déjà' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};

// @desc    Mettre à jour une spécification (seulement value et type)
// @route   PUT /api/specifications/:id
export const updateSpecification = async (req, res) => {
  try {
    const { value, type, order } = req.body;
    
    // Valider le type si fourni
    if (type && !['general', 'advanced'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le type doit être "general" ou "advanced"' 
      });
    }

    // Construire l'objet de mise à jour (seulement les champs autorisés)
    const updateData = {};
    if (value !== undefined) updateData.value = value?.trim();
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = order;
    updateData.updatedAt = Date.now();

    const spec = await Specification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!spec) {
      return res.status(404).json({ 
        success: false, 
        error: 'Spécification non trouvée' 
      });
    }

    // 🔄 SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.updateSpecificationInFile(
        req.params.id,
        spec.toObject()
      );
    } catch (syncError) {
      console.error('⚠️ Erreur sync productData:', syncError);
    }

    res.json({ 
      success: true, 
      data: spec 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Supprimer une spécification
// @route   DELETE /api/specifications/:id
export const deleteSpecification = async (req, res) => {
  try {
    const spec = await Specification.findByIdAndDelete(req.params.id);
    
    if (!spec) {
      return res.status(404).json({ 
        success: false, 
        error: 'Spécification non trouvée' 
      });
    }

    // 🔄 SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.deleteSpecificationFromFile(req.params.id);
    } catch (syncError) {
      console.error('⚠️ Erreur sync productData:', syncError);
    }

    res.json({ 
      success: true, 
      data: {} 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Supprimer toutes les spécifications d'un produit
// @route   DELETE /api/specifications/product/:productId
export const deleteProductSpecifications = async (req, res) => {
  try {
    const specs = await Specification.find({ productId: req.params.productId });
    const result = await Specification.deleteMany({ 
      productId: req.params.productId 
    });

    // 🔄 SYNC AVEC PRODUCTDATA.JS (supprimer chaque spécification)
    for (const spec of specs) {
      try {
        await dataSyncService.deleteSpecificationFromFile(spec._id.toString());
      } catch (syncError) {
        console.error('⚠️ Erreur sync productData:', syncError);
      }
    }
    
    res.json({ 
      success: true, 
      message: `${result.deletedCount} spécification(s) supprimée(s)`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Réordonner les spécifications
// @route   PATCH /api/specifications/reorder/:productId
export const reorderSpecifications = async (req, res) => {
  try {
    const { specs } = req.body;
    const productId = req.params.productId;

    if (!Array.isArray(specs)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le tableau specs est requis' 
      });
    }

    // Mettre à jour l'ordre de chaque spécification
    const updatePromises = specs.map((spec) => 
      Specification.findByIdAndUpdate(spec._id, { 
        order: spec.order,
        updatedAt: Date.now()
      })
    );

    await Promise.all(updatePromises);
    
    // Récupérer les spécifications mises à jour
    const updatedSpecs = await Specification.find({ productId })
      .sort({ type: 1, order: 1 });

    // 🔄 SYNC AVEC PRODUCTDATA.JS (mettre à jour chaque spécification)
    for (const spec of updatedSpecs) {
      try {
        await dataSyncService.updateSpecificationInFile(
          spec._id.toString(),
          spec.toObject()
        );
      } catch (syncError) {
        console.error('⚠️ Erreur sync productData:', syncError);
      }
    }
    
    res.json({ 
      success: true, 
      data: updatedSpecs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Dupliquer les spécifications d'un produit vers un autre
// @route   POST /api/specifications/copy
export const copySpecifications = async (req, res) => {
  try {
    const { fromProductId, toProductId } = req.body;

    // Vérifier que les produits existent
    const [sourceProduct, targetProduct] = await Promise.all([
      Product.findById(fromProductId),
      Product.findById(toProductId)
    ]);

    if (!sourceProduct || !targetProduct) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produit source ou cible non trouvé' 
      });
    }

    // Récupérer les spécifications source
    const sourceSpecs = await Specification.find({ 
      productId: fromProductId 
    });

    if (sourceSpecs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucune spécification à copier' 
      });
    }

    // Supprimer les anciennes spécifications du produit cible
    await Specification.deleteMany({ productId: toProductId });

    // Préparer les nouvelles spécifications
    const newSpecs = sourceSpecs.map(spec => ({
      productId: toProductId,
      key: spec.key,
      value: spec.value,
      type: spec.type,
      order: spec.order
    }));

    // Créer les nouvelles
    const created = await Specification.insertMany(newSpecs);

    // 🔄 SYNC AVEC PRODUCTDATA.JS (ajouter les nouvelles spécifications)
    for (const spec of created) {
      try {
        await dataSyncService.updateSpecificationInFile(
          spec._id.toString(),
          spec.toObject()
        );
      } catch (syncError) {
        console.error('⚠️ Erreur sync productData:', syncError);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: `${created.length} spécifications copiées`,
      data: created 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};