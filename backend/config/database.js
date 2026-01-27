import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe_db';

console.log('🔗 URI de connexion MongoDB:', MONGODB_URI);

// Connexion à MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB avec succès!');
    console.log(`📍 Base de données: ${mongoose.connection.name}`);
    console.log(`📍 Hôte: ${mongoose.connection.host}`);
    console.log(`📍 Port: ${mongoose.connection.port}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    console.error('');
    console.error('💡 SOLUTIONS:');
    console.error('1. Assurez-vous que MongoDB est démarré:');
    console.error('   Windows: net start MongoDB');
    console.error('   Linux: sudo systemctl start mongod');
    console.error('   Mac: brew services start mongodb-community');
    console.error('');
    console.error('2. Vérifiez la chaîne de connexion dans .env');
    console.error('3. MongoDB écoute sur localhost:27017?');
    console.error('');
    return false;
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connecté à MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose déconnecté de MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur Mongoose:', err);
});

// Fermeture propre lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée proprement');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error);
    process.exit(1);
  }
});

// Export mongoose pour utilisation dans d'autres fichiers
export { mongoose };
export default mongoose;
