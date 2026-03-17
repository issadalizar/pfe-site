// migrateUsersToAccounts.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Account from '../models/Account.js';

export const migrateUsersToAccounts = async () => {
  try {
    console.log('Début de la migration des comptes...');

    // Récupérer tous les utilisateurs qui ont email et password
    const users = await User.find({
      email: { $exists: true, $ne: '' },
      password: { $exists: true, $ne: '' }
    });

    console.log(`${users.length} utilisateurs avec comptes trouvés`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Vérifier si un compte existe déjà pour cet utilisateur
        const existingAccount = await Account.findOne({ user: user._id });
        
        if (!existingAccount) {
          // Créer un nouveau compte
          const newAccount = new Account({
            email: user.email,
            password: user.password, // Le mot de passe est déjà hashé
            actif: user.actif !== undefined ? user.actif : true,
            user: user._id
          });

          await newAccount.save();
          created++;
          console.log(`Compte créé pour ${user.email}`);
        } else {
          skipped++;
          console.log(`Compte déjà existant pour ${user.email}`);
        }
      } catch (error) {
        errors++;
        console.error(`Erreur pour l'utilisateur ${user.email}:`, error.message);
      }
    }

    console.log(`
    Migration terminée :
    - Comptes créés : ${created}
    - Comptes ignorés : ${skipped}
    - Erreurs : ${errors}
    `);

  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
};