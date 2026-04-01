import mongoose from 'mongoose';
import Devis from '../models/Devis.js';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateDevis = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Récupérer tous les devis
        const devisList = await Devis.find({});
        console.log(`Found ${devisList.length} devis to migrate`);
        
        let migrated = 0;
        let errors = 0;
        
        for (const devis of devisList) {
            try {
                // Chercher le produit correspondant par productId
                let product = await Product.findOne({ 
                    $or: [
                        { _id: devis.productId },
                        { productId: devis.productId },
                        { nom: devis.productTitle } // Fallback par nom
                    ]
                });
                
                if (!product) {
                    console.log(`⚠️ Product not found for devis ${devis._id}, creating fallback product...`);
                    
                    // Créer un produit fallback
                    product = await Product.create({
                        nom: devis.productTitle || 'Produit inconnu',
                        prix: devis.productPrice || 0,
                        categorie: devis.productCategory ? 
                            (await Category.findOne({ nom: devis.productCategory }))?._id : null,
                        estActif: true
                    });
                    console.log(`✅ Created fallback product: ${product.nom}`);
                }
                
                // Mettre à jour le devis
                devis.product = product._id;
                await devis.save();
                
                migrated++;
                console.log(`✅ Migrated devis ${devis._id} -> product ${product.nom}`);
                
            } catch (error) {
                errors++;
                console.error(`❌ Error migrating devis ${devis._id}:`, error.message);
            }
        }
        
        console.log(`\nMigration complete: ${migrated} migrated, ${errors} errors`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

migrateDevis();