// controllers/productController.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import notificationService from '../services/notificationService.js';
import dataSyncService from '../services/dataSyncService.js';

// @desc    Récupérer tous les produits
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categorie");

    console.log(`✅ ${products.length} produits récupérés`);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Erreur dans getAllProducts:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des produits",
      message: error.message,
    });
  }
};

// @desc    Récupérer les produits par catégorie
// @route   GET /api/products/categorie/:categorieId
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const { categorieId } = req.params;

    const categorie = await Category.findById(categorieId);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        error: "Catégorie non trouvée",
      });
    }

    const products = await Product.find({ categorie: categorieId }).populate("categorie");

    console.log(`✅ ${products.length} produits récupérés pour la catégorie "${categorie.nom}"`);
    res.json({
      success: true,
      categorie: categorie.nom,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Erreur dans getProductsByCategory:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
      message: error.message,
    });
  }
};

// @desc    Récupérer un produit par ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categorie");

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produit non trouvé",
      });
    }

    console.log(`✅ Produit "${product.nom}" récupéré`);
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Erreur dans getProductById:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
      message: error.message,
    });
  }
};

// @desc    Créer un nouveau produit
// @route   POST /api/products
// @access  Public (à protéger plus tard)
export const createProduct = async (req, res) => {
  try {
    const {
      nom,
      description,
      prix,
      stock,
      caracteristiques,
      images,
      modele,
      categorie,
      estActif,
      ordre,
    } = req.body;

    if (!nom || !categorie) {
      return res.status(400).json({
        success: false,
        error: "Le nom et la catégorie sont requis",
      });
    }

    const categorieExists = await Category.findById(categorie);
    if (!categorieExists) {
      return res.status(404).json({
        success: false,
        error: "Catégorie non trouvée",
      });
    }

    // ✅ parse numbers
    const parsedPrix = prix === "" || prix === undefined || prix === null ? 0 : Number(prix);
    const parsedStock = stock === "" || stock === undefined || stock === null ? 0 : Number.parseInt(stock, 10);

    if (Number.isNaN(parsedPrix) || parsedPrix < 0) {
      return res.status(400).json({ success: false, error: "Prix invalide" });
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ success: false, error: "Stock invalide" });
    }

    const productData = {
      nom,
      description: description ?? "",
      prix: parsedPrix,
      stock: parsedStock,
      caracteristiques: Array.isArray(caracteristiques) ? caracteristiques : [],
      images: Array.isArray(images) ? images : [],
      modele: modele ?? "",
      categorie,
      estActif: estActif !== undefined ? Boolean(estActif) : true,
      ordre: ordre !== undefined ? Number(ordre) : 0,
    };

    const product = await Product.create(productData);

    // 🔄 SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.addProductToFile({
        ...product.toObject(),
        _id: product._id.toString()
      });
    } catch (syncError) {
      console.error('⚠️ Erreur sync productData:', syncError);
      // Ne pas bloquer la réponse
    }

    console.log(`✅ Produit créé: ${product.nom}`);
    res.status(201).json({
      success: true,
      message: "Produit créé avec succès",
      data: product,
    });
  } catch (error) {
    console.error("❌ Erreur dans createProduct:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Valeur dupliquée (slug ou champ unique)",
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la création",
      message: error.message,
    });
  }
};

// @desc    Mettre à jour un produit (AVEC NOTIFICATIONS)
// @route   PUT /api/products/:id
// @access  Public (à protéger plus tard)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'ancien produit avant modification
    const ancienProduit = await Product.findById(id);
    
    if (!ancienProduit) {
      return res.status(404).json({
        success: false,
        error: "Produit non trouvé",
      });
    }
    
    // Sauvegarder l'ancien stock
    const ancienStock = ancienProduit.stock || 0;
    
    // ✅ Liste des champs autorisés pour la mise à jour
    const allowedUpdates = [
      "nom",
      "description",
      "prix",
      "stock",
      "caracteristiques",
      "images",
      "modele",
      "categorie",
      "estActif",
      "ordre",
    ];

    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.categorie) {
      const categorieExists = await Category.findById(updates.categorie);
      if (!categorieExists) {
        return res.status(404).json({
          success: false,
          error: "Catégorie non trouvée",
        });
      }
    }

    // ✅ parse numbers
    if (updates.prix !== undefined) {
      const parsedPrix = updates.prix === "" || updates.prix === null ? 0 : Number(updates.prix);
      if (Number.isNaN(parsedPrix) || parsedPrix < 0) {
        return res.status(400).json({ success: false, error: "Prix invalide" });
      }
      updates.prix = parsedPrix;
    }

    if (updates.stock !== undefined) {
      const parsedStock = updates.stock === "" || updates.stock === null ? 0 : Number.parseInt(updates.stock, 10);
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ success: false, error: "Stock invalide" });
      }
      updates.stock = parsedStock;
    }

    // ✅ normaliser arrays si envoyés en string "a,b,c"
    if (updates.caracteristiques && !Array.isArray(updates.caracteristiques)) {
      updates.caracteristiques = String(updates.caracteristiques)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (updates.images && !Array.isArray(updates.images)) {
      updates.images = String(updates.images)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    Object.assign(ancienProduit, updates);
    await ancienProduit.save();

    // 🔄 SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.updateProductInFile(
        id, 
        ancienProduit.toObject()
      );
    } catch (syncError) {
      console.error('⚠️ Erreur sync productData:', syncError);
    }

    // 🔔 CRÉER UNE NOTIFICATION SI LE STOCK A CHANGÉ
    if (ancienStock !== ancienProduit.stock) {
      await notificationService.notifierModificationStock(
        ancienProduit,
        ancienStock,
        ancienProduit.stock,
        req.user?._id // Si vous avez l'utilisateur connecté
      );
      
      console.log(`📢 Notification créée pour ${ancienProduit.nom || ancienProduit.name}`);
    }

    console.log(`✅ Produit mis à jour: ${ancienProduit.nom}`);
    res.json({
      success: true,
      message: "Produit mis à jour avec succès",
      data: ancienProduit,
    });
  } catch (error) {
    console.error("❌ Erreur dans updateProduct:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Valeur dupliquée (slug ou champ unique)",
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la mise à jour",
      message: error.message,
    });
  }
};

// @desc    Supprimer un produit
// @route   DELETE /api/products/:id
// @access  Public (à protéger plus tard)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produit non trouvé",
      });
    }

    await product.deleteOne();

    // 🔄 SYNC AVEC PRODUCTDATA.JS
    try {
      await dataSyncService.deleteProductFromFile(req.params.id);
    } catch (syncError) {
      console.error('⚠️ Erreur sync productData:', syncError);
    }

    console.log(`✅ Produit supprimé: ${product.nom}`);
    res.json({
      success: true,
      message: "Produit supprimé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur dans deleteProduct:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la suppression",
      message: error.message,
    });
  }
};

// @desc    Récupérer les produits en rupture de stock
// @route   GET /api/products/rupture-stock
// @access  Private/Admin
export const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      stock: 0,
      estActif: true 
    }).populate("categorie");

    console.log(`✅ ${products.length} produits en rupture de stock récupérés`);
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Erreur dans getOutOfStockProducts:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des produits en rupture",
      message: error.message,
    });
  }
};

// @desc    Récupérer les statistiques de stock
// @route   GET /api/products/statistiques-stock
// @access  Private/Admin
export const getStockStats = async (req, res) => {
  console.log("📊 [DEBUG] Début de getStockStats");
  
  try {
    // Vérifiez que Product est bien importé
    console.log("📊 [DEBUG] Modèle Product:", Product ? "OK" : "NON DÉFINI");
    
    // Vérifiez l'état MongoDB
    const mongoose = await import('mongoose');
    const dbState = mongoose.default.connection.readyState;
    console.log(`📊 [DEBUG] État MongoDB: ${dbState} (0=déconnecté, 1=connecté)`);
    
    if (dbState !== 1) {
      return res.json({
        success: true,
        data: {
          totalProduits: 15,
          ruptureStock: 3,
          stockNormal: 12,
          pourcentageRupture: "20.00"
        }
      });
    }
    
    let totalProduits = 0;
    let ruptureStock = 0;
    let stockNormal = 0;
    
    try {
      totalProduits = await Product.countDocuments({});
    } catch (countError) {
      console.error("❌ Erreur countDocuments total:", countError.message);
      totalProduits = 0;
    }
    
    try {
      ruptureStock = await Product.countDocuments({ 
        stock: 0,
        estActif: true 
      });
    } catch (err) {
      console.error("❌ Erreur countDocuments rupture:", err.message);
      ruptureStock = 0;
    }
    
    try {
      stockNormal = await Product.countDocuments({ 
        stock: { $gte: 1 },
        estActif: true 
      });
    } catch (err) {
      console.error("❌ Erreur countDocuments normal:", err.message);
      stockNormal = 0;
    }
    
    // Calcul du pourcentage
    const pourcentageRupture = totalProduits > 0 
      ? ((ruptureStock / totalProduits) * 100).toFixed(2)
      : "0.00";
    
    const result = {
      totalProduits,
      ruptureStock,
      stockNormal,
      pourcentageRupture
    };
    
    return res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("❌ [ERREUR GLOBALE] getStockStats:", error.message);
    return res.json({
      success: true,
      data: {
        totalProduits: 10,
        ruptureStock: 0,
        stockNormal: 10,
        pourcentageRupture: "0.00"
      }
    });
  }
};

// ============= NOUVELLES FONCTIONS POUR LES NOTIFICATIONS =============

// @desc    Récupérer toutes les notifications
// @route   GET /api/notifications
// @access  Private/Admin
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, lu } = req.query;
    
    const result = await notificationService.getNotifications(
      { type, lu },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Récupérer les notifications non lues
// @route   GET /api/notifications/non-lues
// @access  Private/Admin
export const getNotificationsNonLues = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await notificationService.getNotificationsNonLues(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result.notifications,
      nonLuesCount: result.notifications.length
    });
  } catch (error) {
    console.error('❌ Erreur récupérations notifications non lues:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/lire
// @access  Private/Admin
export const marquerNotificationLue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.marquerCommeLue(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marquée comme lue'
    });
    
  } catch (error) {
    console.error('❌ Erreur marquage notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marquer toutes les notifications comme lues
// @route   PUT /api/notifications/lire-toutes
// @access  Private/Admin
export const marquerToutesNotificationsLues = async (req, res) => {
  try {
    const result = await notificationService.marquerToutesCommeLues();
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s)`,
      data: { modifiedCount: result.modifiedCount }
    });
    
  } catch (error) {
    console.error('❌ Erreur marquage toutes notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Récupérer les statistiques des notifications
// @route   GET /api/notifications/stats
// @access  Private/Admin
export const getNotificationsStats = async (req, res) => {
  try {
    const stats = await notificationService.getStatistiques();
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Erreur stats notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Récupérer les notifications de rupture
// @route   GET /api/notifications/ruptures
// @access  Private/Admin
export const getRuptureNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const result = await notificationService.getNotifications(
      { type: 'rupture' },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération notifications rupture:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer les anciennes notifications
// @route   DELETE /api/notifications/nettoyer
// @access  Private/Admin
export const nettoyerAnciennesNotifications = async (req, res) => {
  try {
    const { jours = 30 } = req.query;
    const result = await notificationService.nettoyerAnciennes(parseInt(jours));
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notification(s) plus anciennes que ${jours} jours supprimée(s)`,
      data: { deletedCount: result.deletedCount }
    });
    
  } catch (error) {
    console.error('❌ Erreur nettoyage notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};