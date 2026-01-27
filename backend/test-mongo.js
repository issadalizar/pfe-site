#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe_db';

console.log('\n🔍 Test de Connexion MongoDB\n');
console.log('━'.repeat(50));
console.log(`📍 URI: ${MONGODB_URI}`);
console.log('━'.repeat(50) + '\n');

async function testConnection() {
  try {
    console.log('⏳ Connexion à MongoDB...\n');
    
    await mongoose.connect(MONGODB_URI);

    console.log('✅ SUCCÈS - Connexion établie!\n');
    console.log('Informations de la connexion:');
    console.log(`  • Base de données: ${mongoose.connection.name}`);
    console.log(`  • Hôte: ${mongoose.connection.host}`);
    console.log(`  • Port: ${mongoose.connection.port}`);
    console.log(`  • État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}\n`);

    // Vérifier les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections disponibles (${collections.length}):`);
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`  • ${col.name}`);
      });
    } else {
      console.log('  (Aucune collection trouvée - Elles seront créées lors du premier insert)');
    }

    console.log('\n━'.repeat(50));
    console.log('✨ MongoDB est prêt à être utilisé!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ ERREUR - Impossible de se connecter à MongoDB\n');
    console.error('Message d\'erreur:', error.message + '\n');
    
    console.error('💡 Solutions possibles:');
    console.error('  1. Démarrer MongoDB:');
    console.error('     • Windows: net start MongoDB');
    console.error('     • Linux: sudo systemctl start mongod');
    console.error('     • Mac: brew services start mongodb-community');
    console.error('');
    console.error('  2. Vérifier que MongoDB écoute sur le port 27017:');
    console.error('     mongosh (ou mongosh --port 27017)');
    console.error('');
    console.error('  3. Vérifier la chaîne de connexion dans .env:');
    console.error(`     MONGODB_URI=${MONGODB_URI}`);
    console.error('');

    process.exit(1);
  }
}

testConnection();
