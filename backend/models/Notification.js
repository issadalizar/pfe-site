import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  dateNotification: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['rupture', 'reapprovisionnement', 'creation', 'modification'],
    default: 'rupture'
  },
  
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
  
  lu: {
    type: Boolean,
    default: false
  },
  
  dateLecture: {
    type: Date
  },
  
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