// utils/stockUtils.js
import Product from '../models/Product.js';
import notificationService from '../services/notificationService.js';

/**
 * Vérifie si les produits ont assez de stock
 * @param {Array} items - Liste des articles du panier
 * @returns {Object} - { success: boolean, errors: Array }
 */
export const checkStockAvailability = async (items) => {
    const errors = [];
    
    for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
            errors.push(`Produit "${item.productName}" non trouvé`);
            continue;
        }
        
        if (product.stock < item.quantity) {
            errors.push(`Stock insuffisant pour "${item.productName}". Disponible: ${product.stock}, demandé: ${item.quantity}`);
        }
    }
    
    return {
        success: errors.length === 0,
        errors
    };
};

/**
 * Met à jour le stock après une commande réussie
 * @param {Object} order - La commande
 * @returns {Promise<boolean>}
 */
export const updateStockAfterOrder = async (order) => {
    try {
        if (order.stockUpdated) {
            console.log(`ℹ️ Stock déjà mis à jour pour la commande ${order._id}`);
            return true;
        }

        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            const ancienStock = product.stock;
            const nouveauStock = Math.max(0, ancienStock - item.quantity);
            
            product.stock = nouveauStock;
            await product.save();

            // Notifications
            if (ancienStock > 0 && nouveauStock === 0) {
                await notificationService.notifierRupture(product, null);
            } else if (nouveauStock < 5 && nouveauStock > 0) {
                await notificationService.notifierStockFaible(product, 5, null);
            }
        }

        order.stockUpdated = true;
        await order.save();

        return true;
    } catch (error) {
        console.error('❌ Erreur updateStockAfterOrder:', error);
        return false;
    }
};

/**
 * Restaure le stock après annulation
 * @param {Object} order - La commande annulée
 * @returns {Promise<boolean>}
 */
export const restoreStockAfterCancellation = async (order) => {
    try {
        if (!order.stockUpdated) {
            console.log(`ℹ️ Aucun stock à restaurer pour la commande ${order._id}`);
            return true;
        }

        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();

                await notificationService.notifierModificationStock(
                    product,
                    product.stock - item.quantity,
                    product.stock,
                    null
                );
            }
        }

        order.stockUpdated = false;
        await order.save();

        return true;
    } catch (error) {
        console.error('❌ Erreur restoreStockAfterCancellation:', error);
        return false;
    }
};