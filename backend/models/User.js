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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,// Supprimer les espaces avant et après l'email
    lowercase: true,// Convertir l'email en minuscules98
    match: [/^\S+@\S+\.\S+$/, 'Format email invalide']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
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
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hasher le mot de passe avant la sauvegarde
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ne pas retourner le mot de passe dans les réponses JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;