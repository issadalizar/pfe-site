// services/notificationService.js
import Notification from '../models/Notification.js';

class NotificationService {
  
  // Créer une notification
  async creerNotification(data) {
    try {
      const notification = new Notification({
        dateNotification: new Date(),
        ...data
      });
      
      const saved = await notification.save();
      console.log(`✅ Notification créée: ${saved.description}`);
      return saved;
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  // Notification de rupture de stock
  async notifierRupture(produit, utilisateurId = null) {
    return this.creerNotification({
      description: `🔴 Le produit "${produit.nom || produit.name}" est en rupture de stock`,
      type: 'rupture',
      produitId: produit._id,
      produitNom: produit.nom || produit.name,
      utilisateurId,
      metadata: {
        stockActuel: '0'
      }
    });
  }

  // Notification de modification de stock
  async notifierModificationStock(produit, ancienStock, nouveauStock, utilisateurId = null) {
    let type = 'modification';
    let description = `📝 Stock modifié: ${ancienStock} → ${nouveauStock}`;
    
    if (ancienStock > 0 && nouveauStock === 0) {
      type = 'rupture';
      description = `🔴 Rupture de stock: ${ancienStock} → 0`;
    } else if (ancienStock === 0 && nouveauStock > 0) {
      type = 'reapprovisionnement';
      description = `✅ Réapprovisionnement: 0 → ${nouveauStock}`;
    }
    
    return this.creerNotification({
      description: `${description} pour "${produit.nom || produit.name}"`,
      type,
      produitId: produit._id,
      produitNom: produit.nom || produit.name,
      utilisateurId,
      metadata: {
        stockAvant: ancienStock.toString(),
        stockApres: nouveauStock.toString(),
        stockActuel: nouveauStock.toString()
      }
    });
  }

  // Récupérer toutes les notifications (avec filtres)
  async getNotifications(filtres = {}, page = 1, limit = 50) {
    try {
      const query = {};
      
      if (filtres.type) query.type = filtres.type;
      if (filtres.lu !== undefined) query.lu = filtres.lu === 'true';
      if (filtres.produitId) query.produitId = filtres.produitId;
      if (filtres.dateDebut || filtres.dateFin) {
        query.dateNotification = {};
        if (filtres.dateDebut) query.dateNotification.$gte = new Date(filtres.dateDebut);
        if (filtres.dateFin) query.dateNotification.$lte = new Date(filtres.dateFin);
      }
      
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find(query)
        .sort({ dateNotification: -1 })
        .skip(skip)
        .limit(limit)
        .populate('produitId', 'nom name prix stock images')
        .populate('utilisateurId', 'nom email');
      
      const total = await Notification.countDocuments(query);
      
      // Enrichir les notifications avec les infos de stock actuelles du produit
      const notificationsEnrichies = await Promise.all(notifications.map(async (notif) => {
        const notifObj = notif.toObject();
        if (notif.produitId) {
          notifObj.stockActuel = notif.produitId.stock;
        }
        return notifObj;
      }));
      
      return {
        notifications: notificationsEnrichies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error;
    }
  }

  // Récupérer les notifications non lues
  async getNotificationsNonLues(limit = 20) {
    return this.getNotifications({ lu: false }, 1, limit);
  }

  // Récupérer les notifications de rupture
  async getNotificationsRupture(limit = 50) {
    return this.getNotifications({ type: 'rupture' }, 1, limit);
  }

  // Marquer une notification comme lue
  async marquerCommeLue(id) {
    try {
      return await Notification.findByIdAndUpdate(
        id,
        { 
          lu: true, 
          dateLecture: new Date() 
        },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Erreur mise à jour notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async marquerToutesCommeLues() {
    try {
      return await Notification.updateMany(
        { lu: false },
        { 
          lu: true, 
          dateLecture: new Date() 
        }
      );
    } catch (error) {
      console.error('❌ Erreur mise à jour notifications:', error);
      throw error;
    }
  }

  // Compter les notifications non lues
  async countNonLues() {
    try {
      return await Notification.countDocuments({ lu: false });
    } catch (error) {
      console.error('❌ Erreur comptage notifications:', error);
      return 0;
    }
  }

  // Supprimer les anciennes notifications (plus de 30 jours)
  async nettoyerAnciennes(jours = 30) {
    try {
      const dateLimite = new Date();
      dateLimite.setDate(dateLimite.getDate() - jours);
      
      return await Notification.deleteMany({
        dateNotification: { $lt: dateLimite }
      });
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
      throw error;
    }
  }

  // Obtenir les statistiques
  async getStatistiques() {
    try {
      const total = await Notification.countDocuments();
      const nonLues = await Notification.countDocuments({ lu: false });
      
      const parType = await Notification.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const aujourdHui = new Date();
      aujourdHui.setHours(0, 0, 0, 0);
      
      const aujourdHuiCount = await Notification.countDocuments({
        dateNotification: { $gte: aujourdHui }
      });
      
      const dernieresRuptures = await Notification.find({ type: 'rupture' })
        .sort({ dateNotification: -1 })
        .limit(5)
        .populate('produitId', 'nom name stock');
      
      return {
        total,
        nonLues,
        parType: parType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        aujourdHui: aujourdHuiCount,
        dernieresRuptures
      };
    } catch (error) {
      console.error('❌ Erreur statistiques:', error);
      throw error;
    }
  }
}

export default new NotificationService();