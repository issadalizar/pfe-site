import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  client_code: {
    type: String,
    required: true,
  },
  client_name: {
    type: String,
    required: true
  },
  adresse: {
    type: String,
    required: false,
    trim: true
  },
  telephone: {
    type: String,
    required: false,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// MIDDLEWARE: Après la suppression d'un utilisateur
userSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Account = mongoose.model('Account');
      await Account.deleteOne({ user: doc._id });
      console.log(` Compte supprimé pour l'utilisateur ${doc._id}`);
    } catch (error) {
      console.error(' Erreur lors de la suppression du compte:', error);
    }
  }
});

// MIDDLEWARE: Après la suppression par deleteOne/deleteMany
userSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  if (doc) {
    try {
      const Account = mongoose.model('Account');
      await Account.deleteOne({ user: doc._id });
      console.log(` Compte supprimé pour l'utilisateur ${doc._id}`);
    } catch (error) {
      console.error(' Erreur lors de la suppression du compte:', error);
    }
  }
});

// MIDDLEWARE: Après la suppression par findByIdAndDelete
userSchema.post('findByIdAndDelete', async function(doc) {
  if (doc) {
    try {
      const Account = mongoose.model('Account');
      await Account.deleteOne({ user: doc._id });
      console.log(`Compte supprimé pour l'utilisateur ${doc._id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
    }
  }
});

const User = mongoose.model('User', userSchema);
export default User;