// Dans User.js, modifiez le schéma :
import mongoose from 'mongoose';
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
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email invalide']
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
    default: false  // Par défaut, l'utilisateur n'est pas admin
  },
  actif: {
    type: Boolean,
    default: true  // Par défaut, le compte est actif
  }
});
const User = mongoose.model('User', userSchema);
export default User;