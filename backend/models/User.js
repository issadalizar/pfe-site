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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});  

// Fonction réutilisable pour supprimer le compte associé
async function deleteAssociatedAccount(doc) {
  if (doc) {
    try {
      const Account = mongoose.model('Account');
      const result = await Account.deleteOne({ user: doc._id });
      if (result.deletedCount > 0) {
        console.log(`✅ Compte supprimé pour l'utilisateur ${doc.client_name} (${doc._id})`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du compte pour l'utilisateur ${doc._id}:`, error);
    }
  }
}

// Middleware pour findOneAndDelete (couvre aussi findByIdAndDelete)
userSchema.post('findOneAndDelete', async function(doc) {
  await deleteAssociatedAccount(doc);
});

// Middleware pour deleteOne
userSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  await deleteAssociatedAccount(doc);
});

const User = mongoose.model('User', userSchema);
export default User;