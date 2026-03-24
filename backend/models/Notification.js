// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Date de la notification
  dateNotification: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Description de la notification
  description: {
    type: String,
    required: true
  },
  
  // Type de notification
  type: {
    type: String,
    enum: ['rupture', 'reapprovisionnement', 'creation', 'modification'],
    default: 'rupture'
  },
  
  // Référence au produit
  produitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Nom du produit (pour éviter de faire une jointure)
  produitNom: {
    type: String,
    required: true
  },
  
  // Statut de lecture
  lu: {
    type: Boolean,
    default: false
  },
  
  // Date de lecture
  dateLecture: {
    type: Date
  },
  
  // Métadonnées supplémentaires (optionnel)
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
});

// Index pour optimiser les recherches
notificationSchema.index({ dateNotification: -1 });
notificationSchema.index({ produitId: 1, dateNotification: -1 });
notificationSchema.index({ lu: 1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;