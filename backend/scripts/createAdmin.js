import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Account from '../models/Account.js';

dotenv.config();

const ADMIN_DATA = {
    client_code: 'ADMIN-001',
    client_name: 'Administrateur',
    email: 'admin@univertechno.tn',
    password: 'Admin123!',
    isAdmin: true,
    actif: true,
};

const createAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pfe_db';
        console.log('Connexion à MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('Connecté à MongoDB !\n');

        // Vérifier si un compte admin existe déjà
        const existingAccount = await Account.findOne({ email: ADMIN_DATA.email.toLowerCase() });

        if (existingAccount) {
            console.log('⚠️  Un compte admin existe déjà avec cet email :');
            console.log(`   Email: ${existingAccount.email}`);
            console.log('\n   Aucune modification effectuée.');
        } else {
            // 1. Créer le User admin
            let adminUser = await User.findOne({ client_code: ADMIN_DATA.client_code });
            
            if (!adminUser) {
                adminUser = new User({
                    client_code: ADMIN_DATA.client_code,
                    client_name: ADMIN_DATA.client_name,
                    isAdmin: true,
                });
                await adminUser.save();
                console.log('✅ Utilisateur admin créé.');
            } else {
                // S'assurer qu'il est bien admin
                adminUser.isAdmin = true;
                await adminUser.save();
                console.log('✅ Utilisateur admin existant mis à jour.');
            }

            // 2. Créer le Account associé
            const account = new Account({
                email: ADMIN_DATA.email.toLowerCase(),
                password: ADMIN_DATA.password,
                actif: true,
                user: adminUser._id
            });
            await account.save();

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
