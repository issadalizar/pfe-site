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
  article: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  facture_num: {
    type: String,
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    default: 1
  },
  montant: {
    type: Number,
    required: true,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'client'],
    default: 'user'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  // AJOUTEZ CE CHAMP :
  actif: {
    type: Boolean,
    default: true  // Par défaut, le compte est actif
  }
});
const User = mongoose.model('User', userSchema);
export default User;