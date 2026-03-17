import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,// Supprimer les espaces avant et après l'email
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email invalide']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  actif: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Un compte est lié à un seul utilisateur
  }
});

// Index pour améliorer les performances des recherches
accountSchema.index({ email: 1 });
accountSchema.index({ user: 1 });

// Hasher le mot de passe avant la sauvegarde
accountSchema.pre('save', async function (next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
accountSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le compte est verrouillé
accountSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Incrémenter les tentatives de connexion
accountSchema.methods.incrementLoginAttempts = function() {
  // Si le compte était verrouillé et que la période de verrouillage est passée
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // Verrouillage pour 15 minutes
  }
  
  return this.updateOne(updates);
};

// Ne pas retourner le mot de passe dans les réponses JSON
accountSchema.methods.toJSON = function () {
  const account = this.toObject();
  delete account.password;
  delete account.passwordResetToken;
  delete account.passwordResetExpires;
  return account;
};

const Account = mongoose.model('Account', accountSchema);
export default Account;