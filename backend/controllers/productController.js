// controllers/productController.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// @desc    Récupérer tous les produits
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");

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
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Catégorie non trouvée",
      });
    }

    const products = await Product.find({ category: categoryId }).populate("category");

    console.log(`✅ ${products.length} produits récupérés pour la catégorie "${category.name}"`);
    res.json({
      success: true,
      category: category.name,
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
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produit non trouvé",
      });
    }

    console.log(`✅ Produit "${product.name}" récupéré`);
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
      name,
      description,
      shortDescription,
      price,
      stock,
      features,
      images,
      model,
      category,
      link,
      isActive,
      isFeatured,
      order,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: "Le nom et la catégorie sont requis",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        error: "Catégorie non trouvée",
      });
    }

    // ✅ parse numbers
    const parsedPrice = price === "" || price === undefined || price === null ? 0 : Number(price);
    const parsedStock = stock === "" || stock === undefined || stock === null ? 0 : Number.parseInt(stock, 10);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, error: "Prix invalide" });
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ success: false, error: "Stock invalide" });
    }

    const productData = {
      name,
      description: description ?? "",
      shortDescription: shortDescription ?? "",
      price: parsedPrice,
      stock: parsedStock,
      features: Array.isArray(features) ? features : [],
      images: Array.isArray(images) ? images : [],
      model: model ?? "",
      category,
      link: link ?? "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      order: order !== undefined ? Number(order) : 0,
    };

    const product = await Product.create(productData);

    console.log(`✅ Produit créé: ${product.name}`);
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

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Public (à protéger plus tard)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produit non trouvé",
      });
    }

    // ✅ IMPORTANT: ajouter price + stock + isFeatured
    const allowedUpdates = [
      "name",
      "description",
      "shortDescription",
      "price",
      "stock",
      "features",
      "images",
      "model",
      "category",
      "link",
      "isActive",
      "isFeatured",
      "order",
    ];

    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.category) {
      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          error: "Catégorie non trouvée",
        });
      }
    }

    // ✅ parse numbers
    if (updates.price !== undefined) {
      const parsedPrice = updates.price === "" || updates.price === null ? 0 : Number(updates.price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, error: "Prix invalide" });
      }
      updates.price = parsedPrice;
    }

    if (updates.stock !== undefined) {
      const parsedStock = updates.stock === "" || updates.stock === null ? 0 : Number.parseInt(updates.stock, 10);
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ success: false, error: "Stock invalide" });
      }
      updates.stock = parsedStock;
    }

    // ✅ normaliser arrays si envoyés en string "a,b,c"
    if (updates.features && !Array.isArray(updates.features)) {
      updates.features = String(updates.features)
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

    Object.assign(product, updates);
    await product.save();

    console.log(`✅ Produit mis à jour: ${product.name}`);
    res.json({
      success: true,
      message: "Produit mis à jour avec succès",
      data: product,
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

    console.log(`✅ Produit supprimé: ${product.name}`);
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
