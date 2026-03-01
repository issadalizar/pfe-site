import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const ADMIN_DATA = {
    client_code: 'ADMIN-001',
    client_name: 'Administrateur',
    email: 'admin@univertechno.tn',
    password: 'Admin123!',
    isAdmin: true,
    actif: true,
    telephone: '',
    adresse: ''
};

const createAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe_db';
        console.log('Connexion à MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connecté à MongoDB !\n');

        // Vérifier si un admin existe déjà
        const existingAdmin = await User.findOne({ email: ADMIN_DATA.email });

        if (existingAdmin) {
            console.log('⚠️  Un compte admin existe déjà avec cet email :');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Nom: ${existingAdmin.client_name}`);
            console.log(`   Code: ${existingAdmin.client_code}`);
            console.log('\n   Aucune modification effectuée.');
        } else {
            const admin = new User(ADMIN_DATA);
            await admin.save();
            console.log('✅ Compte administrateur créé avec succès !');
            console.log(`   Email: ${ADMIN_DATA.email}`);
            console.log(`   Mot de passe: ${ADMIN_DATA.password}`);
            console.log(`   Code: ${ADMIN_DATA.client_code}`);
            console.log('\n   ⚠️  Changez le mot de passe après la première connexion !');
        }

        await mongoose.connection.close();
        console.log('\nConnexion MongoDB fermée.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdmin();
