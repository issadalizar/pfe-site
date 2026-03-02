// scripts/migrateSpecifications.js
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Specification from '../models/Specification.js';
import { cncProductDetails } from '../data/productData.js'; // Vos données statiques
import dotenv from 'dotenv';

dotenv.config();

async function migrateSpecifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les produits de la base
    const products = await Product.find({});
    console.log(`📦 ${products.length} produits trouvés`);

    let totalSpecs = 0;

    for (const product of products) {
      // Chercher le produit correspondant dans productData.js
      const productData = cncProductDetails[product.name];
      
      if (!productData) {
        console.log(`⚠️ Produit non trouvé dans productData.js: ${product.name}`);
        continue;
      }

      const specsToCreate = [];

      // Migrer les spécifications générales
      if (productData.specifications) {
        Object.entries(productData.specifications).forEach(([key, value], index) => {
          specsToCreate.push({
            productId: product._id,
            key,
            value: String(value),
            type: 'general',
            order: index
          });
        });
      }

      // Migrer les spécifications avancées
      if (productData.technicalSpecs) {
        Object.entries(productData.technicalSpecs).forEach(([key, value], index) => {
          specsToCreate.push({
            productId: product._id,
            key,
            value: String(value),
            type: 'advanced',
            order: index
          });
        });
      }

      if (specsToCreate.length > 0) {
        // Supprimer les anciennes spécifications si elles existent
        await Specification.deleteMany({ productId: product._id });
        
        // Créer les nouvelles
        await Specification.insertMany(specsToCreate);
        
        console.log(`✅ Produit "${product.name}" : ${specsToCreate.length} spécifications créées`);
        totalSpecs += specsToCreate.length;
      }
    }

    console.log(`\n🎉 Migration terminée ! ${totalSpecs} spécifications créées au total`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

migrateSpecifications();