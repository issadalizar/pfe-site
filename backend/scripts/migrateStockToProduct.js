// scripts/migrateNotifications.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateNotifications() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer toutes les notifications
    const notifications = await Notification.find({});
    console.log(`📊 ${notifications.length} notifications trouvées`);

    let migratedCount = 0;

    for (const notif of notifications) {
      try {
        // Récupérer le produit associé
        const product = await Product.findById(notif.produitId);
        
        // Créer l'objet metadata
        const metadata = new Map();
        
        // Ajouter les anciennes valeurs si elles existent
        if (notif.stockAvant !== undefined) {
          metadata.set('stockAvant', notif.stockAvant.toString());
        }
        if (notif.stockApres !== undefined) {
          metadata.set('stockApres', notif.stockApres.toString());
        }
        
        // Ajouter le stock actuel du produit
        if (product) {
          metadata.set('stockActuel', product.stock.toString());
        } else {
          metadata.set('stockActuel', '0');
        }

        // Mettre à jour la notification
        await Notification.updateOne(
          { _id: notif._id },
          { 
            $set: { metadata: metadata },
            $unset: { stockAvant: "", stockApres: "" }
          }
        );
        
        migratedCount++;
        console.log(`✅ Notification ${notif._id} migrée`);
        
      } catch (notifError) {
        console.error(`❌ Erreur pour notification ${notif._id}:`, notifError.message);
      }
    }

    console.log(`\n📊 Migration terminée : ${migratedCount}/${notifications.length} notifications traitées`);
    
    // Vérifier que les champs ont bien été supprimés
    const sampleNotif = await Notification.findOne();
    console.log('\n📋 Exemple de notification après migration :');
    console.log({
      id: sampleNotif._id,
      description: sampleNotif.description,
      type: sampleNotif.type,
      metadata: sampleNotif.metadata,
      // Vérifier que les anciens champs n'existent plus
      hasStockAvant: sampleNotif.stockAvant === undefined,
      hasStockApres: sampleNotif.stockApres === undefined
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

// Exécuter la migration
migrateNotifications();