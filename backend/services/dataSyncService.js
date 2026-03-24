// backend/services/dataSyncService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCT_DATA_PATH = path.join(__dirname, '../data/productData.js');

/**
 * Service pour synchroniser les données avec productData.js
 */
class DataSyncService {
  constructor() {
    this.isSyncing = false;
  }

  /**
   * Lire le fichier productData.js actuel
   */
  async readProductData() {
    try {
      // Vérifier si le fichier existe
      if (!fs.existsSync(PRODUCT_DATA_PATH)) {
        console.log('📝 Fichier productData.js non trouvé, création...');
        const initialContent = 'export const cncProductDetails = {};\n';
        fs.writeFileSync(PRODUCT_DATA_PATH, initialContent, 'utf8');
        return {};
      }

      // Importer dynamiquement le fichier
      const data = await import('file://' + PRODUCT_DATA_PATH + '?update=' + Date.now());
      return data.cncProductDetails || {};
    } catch (error) {
      console.error('❌ Erreur lecture productData.js:', error);
      return {};
    }
  }

  /**
   * Écrire dans le fichier productData.js
   */
  async writeProductData(data) {
    // Éviter les écritures concurrentes
    if (this.isSyncing) {
      console.log('⏳ Synchronisation déjà en cours, attente...');
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.writeProductData(data);
    }

    this.isSyncing = true;
    
    try {
      // Nettoyer les données pour éviter les références circulaires
      const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
        // Exclure les champs problématiques
        if (key === '__v' || key === 'password' || key === 'salt') return undefined;
        return value;
      }));

      // Formater le contenu
      const content = `export const cncProductDetails = ${JSON.stringify(cleanData, null, 2)};\n`;
      
      // Écrire dans un fichier temporaire puis renommer pour éviter la corruption
      const tempPath = PRODUCT_DATA_PATH + '.tmp';
      fs.writeFileSync(tempPath, content, 'utf8');
      fs.renameSync(tempPath, PRODUCT_DATA_PATH);
      
      console.log('✅ productData.js mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur écriture productData.js:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Mettre à jour un produit spécifique
   */
  async updateProductInFile(productId, productData) {
    const data = await this.readProductData();
    
    // Convertir l'ID ObjectId en string si nécessaire
    const id = productId?.toString?.() || productId;
    
    // Chercher le produit par ID dans les données
    let found = false;
    for (const [key, value] of Object.entries(data)) {
      if (value._id === id || value._id?.toString?.() === id || key === id) {
        // Mettre à jour le produit existant
        data[key] = { 
          ...value, 
          ...productData, 
          _id: id,
          updatedAt: new Date().toISOString()
        };
        found = true;
        console.log(`🔄 Produit "${key}" mis à jour dans productData.js`);
        break;
      }
    }
    
    // Si non trouvé, ajouter comme nouveau
    if (!found) {
      const key = productData.title || productData.nom || `product_${Date.now()}`;
      data[key] = { 
        ...productData, 
        _id: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log(`➕ Nouveau produit "${key}" ajouté dans productData.js`);
    }
    
    await this.writeProductData(data);
    return data;
  }

  /**
   * Ajouter un nouveau produit
   */
  async addProductToFile(productData) {
    const data = await this.readProductData();
    
    const id = productData._id?.toString?.() || productData._id || `temp_${Date.now()}`;
    const key = productData.title || productData.nom || `product_${Date.now()}`;
    
    data[key] = { 
      ...productData, 
      _id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`➕ Produit "${key}" ajouté dans productData.js`);
    await this.writeProductData(data);
    return data;
  }

  /**
   * Supprimer un produit
   */
  async deleteProductFromFile(productId) {
    const data = await this.readProductData();
    
    const id = productId?.toString?.() || productId;
    let deleted = false;
    
    for (const [key, value] of Object.entries(data)) {
      if (value._id === id || value._id?.toString?.() === id || key === id) {
        delete data[key];
        console.log(`🗑️ Produit "${key}" supprimé de productData.js`);
        deleted = true;
        break;
      }
    }
    
    if (deleted) {
      await this.writeProductData(data);
    }
    
    return data;
  }

  /**
   * Mettre à jour une catégorie
   */
  async updateCategoryInFile(categoryId, categoryData) {
    const data = await this.readProductData();
    
    const id = categoryId?.toString?.() || categoryId;
    
    // Initialiser la section catégories si elle n'existe pas
    if (!data._categories) {
      data._categories = {};
    }
    
    // Mettre à jour la catégorie
    data._categories[id] = { 
      ...categoryData, 
      _id: id,
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour les produits qui utilisent cette catégorie
    for (const [key, product] of Object.entries(data)) {
      if (!key.startsWith('_') && product.categoryId === id) {
        product.category = categoryData;
      }
    }
    
    console.log(`🔄 Catégorie "${categoryData.name}" mise à jour dans productData.js`);
    await this.writeProductData(data);
    return data;
  }

  /**
   * Supprimer une catégorie
   */
  async deleteCategoryFromFile(categoryId) {
    const data = await this.readProductData();
    
    const id = categoryId?.toString?.() || categoryId;
    
    if (data._categories && data._categories[id]) {
      delete data._categories[id];
      console.log(`🗑️ Catégorie ID ${id} supprimée de productData.js`);
      await this.writeProductData(data);
    }
    
    return data;
  }

  /**
   * Mettre à jour une commande
   */
  async updateOrderInFile(orderId, orderData) {
    const data = await this.readProductData();
    
    const id = orderId?.toString?.() || orderId;
    
    // Initialiser la section orders si elle n'existe pas
    if (!data._orders) {
      data._orders = {};
    }
    
    data._orders[id] = { 
      ...orderData, 
      _id: id,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`🔄 Commande ${id} mise à jour dans productData.js`);
    await this.writeProductData(data);
    return data;
  }

  /**
   * Supprimer une commande
   */
  async deleteOrderFromFile(orderId) {
    const data = await this.readProductData();
    
    const id = orderId?.toString?.() || orderId;
    
    if (data._orders && data._orders[id]) {
      delete data._orders[id];
      console.log(`🗑️ Commande ${id} supprimée de productData.js`);
      await this.writeProductData(data);
    }
    
    return data;
  }

  /**
   * Mettre à jour une spécification
   */
  async updateSpecificationInFile(specId, specData) {
    const data = await this.readProductData();
    
    const id = specId?.toString?.() || specId;
    
    // Initialiser la section specifications si elle n'existe pas
    if (!data._specifications) {
      data._specifications = {};
    }
    
    data._specifications[id] = { 
      ...specData, 
      _id: id,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`🔄 Spécification ${id} mise à jour dans productData.js`);
    await this.writeProductData(data);
    return data;
  }

  /**
   * Supprimer une spécification
   */
  async deleteSpecificationFromFile(specId) {
    const data = await this.readProductData();
    
    const id = specId?.toString?.() || specId;
    
    if (data._specifications && data._specifications[id]) {
      delete data._specifications[id];
      console.log(`🗑️ Spécification ${id} supprimée de productData.js`);
      await this.writeProductData(data);
    }
    
    return data;
  }

  /**
   * Synchroniser toutes les données depuis MongoDB
   */
  async syncAllFromMongoDB() {
    try {
      console.log('🔄 Début synchronisation complète avec productData.js...');
      
      // Importer les modèles
      const Product = (await import('../models/Product.js')).default;
      const Category = (await import('../models/Category.js')).default;
      const Order = (await import('../models/Order.js')).default;
      const Specification = (await import('../models/Specification.js')).default;
      
      // Récupérer toutes les données
      const [products, categories, orders, specifications] = await Promise.all([
        Product.find().populate('categorie').lean(),
        Category.find().lean(),
        Order.find().lean(),
        Specification.find().lean()
      ]);
      
      console.log(`📊 Données récupérées: ${products.length} produits, ${categories.length} catégories, ${orders.length} commandes, ${specifications.length} spécifications`);
      
      // Construire la structure pour productData.js
      const productData = {};
      
      // Ajouter les produits
      products.forEach(product => {
        const key = product.nom || product.name || `product_${product._id}`;
        productData[key] = {
          ...product,
          _id: product._id.toString(),
          category: product.categorie?.nom || product.categorie,
          categoryId: product.categorie?._id?.toString(),
          __v: undefined,
          password: undefined,
          salt: undefined
        };
      });
      
      // Ajouter les catégories
      productData._categories = {};
      categories.forEach(cat => {
        productData._categories[cat._id.toString()] = {
          ...cat,
          _id: cat._id.toString(),
          __v: undefined
        };
      });
      
      // Ajouter les commandes
      productData._orders = {};
      orders.forEach(order => {
        productData._orders[order._id.toString()] = {
          ...order,
          _id: order._id.toString(),
          __v: undefined
        };
      });
      
      // Ajouter les spécifications
      productData._specifications = {};
      specifications.forEach(spec => {
        productData._specifications[spec._id.toString()] = {
          ...spec,
          _id: spec._id.toString(),
          __v: undefined
        };
      });
      
      await this.writeProductData(productData);
      console.log('✅ Synchronisation complète terminée avec succès');
      
      return {
        success: true,
        stats: {
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          specifications: specifications.length
        }
      };
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      throw error;
    }
  }

  /**
   * Initialiser le fichier productData.js au démarrage
   */
  async initializeOnStartup() {
    try {
      const data = await this.readProductData();
      
      // Si le fichier est vide, synchroniser depuis MongoDB
      if (Object.keys(data).length === 0) {
        console.log('🚀 productData.js vide, synchronisation initiale...');
        await this.syncAllFromMongoDB();
      } else {
        console.log(`📁 productData.js chargé avec ${Object.keys(data).filter(k => !k.startsWith('_')).length} produits`);
      }
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    }
  }
}

export default new DataSyncService();