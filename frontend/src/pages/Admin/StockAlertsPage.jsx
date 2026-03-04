// src/pages/StockAlertsPage.jsx
import React, { useState, useEffect } from "react";
import { productAPI } from "../../services/CategorieProduct";
import { Link, useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaArrowLeft,
  FaRedo,
  FaBoxOpen,
  FaBell,
  FaExclamationCircle,
  FaCheckCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaEye,
  FaBox,
  FaEuroSign,
  FaHistory,
  FaClock
} from "react-icons/fa";
import ProductList from "../../components/Admin/ProductList";
import notificationService from '../../services/notificationService'; // ✅ AJOUT

export default function StockAlertsPage() {
  const [outOfStock, setOutOfStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("outOfStock");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  
  // ✅ NOUVEAUX STATES POUR LES NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  
  const navigate = useNavigate();

  // Modal & état pour modification de stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  useEffect(() => {
    fetchAlerts();
    fetchNotifications(); // ✅ AJOUT

    // Actualiser toutes les minutes
    const interval = setInterval(() => {
      fetchAlerts();
      fetchNotifications(); // ✅ AJOUT
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      console.log("🔄 Début du chargement des alertes...");

      // Même logique que dans Products.jsx pour garantir la cohérence
      try {
        // Essayez d'abord l'API spécifique
        const [outOfStockRes, lowStockRes] = await Promise.all([
          productAPI.getOutOfStock(),
          productAPI.getLowStock(),
        ]);

        console.log("✅ API spécifique réussie");
        console.log(
          "Produits en rupture:",
          outOfStockRes.data.data?.length || 0,
        );
        console.log(
          "Produits à faible stock:",
          lowStockRes.data.data?.length || 0,
        );

        const outOfStockProducts = outOfStockRes.data.data || [];
        const lowStockProducts = lowStockRes.data.data || [];

        setOutOfStock(outOfStockProducts);
        setLowStock(lowStockProducts);

        // Calculer les stats
        const allProductsRes = await productAPI.getAll();
        const totalProducts = allProductsRes.data.data?.length || 0;
        const normalStockCount =
          totalProducts - (outOfStockProducts.length + lowStockProducts.length);

        setStats({
          outOfStockCount: outOfStockProducts.length,
          lowStockCount: lowStockProducts.length,
          normalStockCount: normalStockCount,
          totalProducts: totalProducts,
          outOfStockPercentage:
            totalProducts > 0
              ? ((outOfStockProducts.length / totalProducts) * 100).toFixed(1)
              : 0,
        });
      } catch (apiError) {
        console.log("⚠️ API spécifique échouée, utilisation alternative...");

        // Récupérer tous les produits
        const allProductsRes = await productAPI.getAll();
        const products = allProductsRes.data.data || [];
        setAllProducts(products);

        console.log(`📦 Total produits récupérés: ${products.length}`);

        // Même calcul que dans Products.jsx
        const outOfStockProducts = products.filter((p) => {
          const stock = Number(p.stock);
          return isNaN(stock) || stock === 0;
        });

        const lowStockProducts = products.filter((p) => {
          const stock = Number(p.stock);
          return stock > 0 && stock < 5;
        });

        console.log(`🔴 Produits en rupture: ${outOfStockProducts.length}`);
        console.log(`🟡 Produits à faible stock: ${lowStockProducts.length}`);

        // Afficher les détails
        outOfStockProducts.forEach((p) => {
          console.log(`  - ${p.name} (ID: ${p._id}, Stock: ${p.stock})`);
        });

        setOutOfStock(outOfStockProducts);
        setLowStock(lowStockProducts);

        // Calculer les stats localement
        const totalProducts = products.length;
        const normalStockCount = products.filter((p) => {
          const stock = Number(p.stock);
          return stock >= 5;
        }).length;

        setStats({
          outOfStockCount: outOfStockProducts.length,
          lowStockCount: lowStockProducts.length,
          normalStockCount: normalStockCount,
          totalProducts: totalProducts,
          outOfStockPercentage:
            totalProducts > 0
              ? ((outOfStockProducts.length / totalProducts) * 100).toFixed(1)
              : 0,
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVELLE FONCTION POUR CHARGER LES NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      // Récupérer l'historique des ruptures
      const response = await notificationService.getRuptures();
      console.log('📋 Historique des ruptures:', response.data);
      setNotifications(response.data);
      
      // Récupérer les statistiques des notifications
      const stats = await notificationService.getStats();
      setNotificationsNonLues(stats.data.nonLues);
      
      console.log(`🔔 ${stats.data.nonLues} notification(s) non lue(s)`);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    }
  };

  // ✅ FONCTION POUR MARQUER COMME LUE
  const handleMarquerLue = async (notificationId) => {
    try {
      await notificationService.marquerCommeLue(notificationId);
      // Recharger les notifications
      fetchNotifications();
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  };

  // ✅ FONCTION POUR MARQUER TOUTES COMME LUES
  const handleMarquerToutesLues = async () => {
    try {
      await notificationService.marquerToutesCommeLues();
      fetchNotifications();
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
    }
  };

  const refreshAlerts = () => {
    fetchAlerts();
    fetchNotifications(); // ✅ AJOUT
  };

  const handleEditProduct = async (product) => {
    try {
      setStockSaving(true);
      const res = await productAPI.getById(product._id);
      const p = res.data.data;
      setStockModalProduct(p);
      setStockValue(
        p.stock !== undefined && p.stock !== null ? String(p.stock) : "",
      );
      setShowStockModal(true);
    } catch (error) {
      console.error("Erreur chargement produit:", error);
      window.alert("Erreur lors du chargement du produit");
    } finally {
      setStockSaving(false);
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/products/${product._id}`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      console.log("Suppression du produit:", productId);
      productAPI
        .delete(productId)
        .then(() => {
          refreshAlerts();
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression:", error);
        });
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentProducts = activeTab === "outOfStock" ? outOfStock : lowStock;
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map((p) => p._id));
    }
  };

  const handleBulkRestock = () => {
    if (selectedProducts.length === 0) {
      alert("Sélectionnez au moins un produit");
      return;
    }
    navigate(`/products/bulk-edit?ids=${selectedProducts.join(",")}`);
  };

  // Fonction pour trier les produits
  const getSortedProducts = (products) => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "category") {
        aValue = a.category?.name || "";
        bValue = b.category?.name || "";
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedOutOfStock = getSortedProducts(outOfStock);
  const sortedLowStock = getSortedProducts(lowStock);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link to="/products" className="btn btn-outline-secondary me-3">
            <FaArrowLeft className="me-2" />
            Retour aux produits
          </Link>
          <div>
            <h1 className="h3 mb-2 text-dark d-flex align-items-center">
              <FaBell className="me-3 text-warning" size={32} />
              <span>Alertes Stock</span>
              {notificationsNonLues > 0 && (
                <span className="badge bg-danger ms-3 rounded-pill">
                  {notificationsNonLues} nouvelle(s)
                </span>
              )}
            </h1>
            <p className="text-muted mb-0">
              Surveillez les produits en rupture et à faible stock
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          {/* ✅ NOUVEAU BOUTON HISTORIQUE */}
          <button
            className="btn btn-outline-info d-flex align-items-center"
            onClick={() => setShowNotificationHistory(!showNotificationHistory)}
            title="Voir l'historique des notifications"
          >
            <FaHistory className="me-2" />
            Historique
            {notificationsNonLues > 0 && (
              <span className="badge bg-danger ms-2">{notificationsNonLues}</span>
            )}
          </button>
          
          {selectedProducts.length > 0 && (
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={handleBulkRestock}
            >
              <FaEdit className="me-2" />
              Réapprovisionner ({selectedProducts.length})
            </button>
          )}
          <button
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={refreshAlerts}
            disabled={loading}
          >
            <FaRedo className={`me-2 ${loading ? "fa-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ✅ SECTION HISTORIQUE DES NOTIFICATIONS (conditionnelle) */}
      {showNotificationHistory && (
        <div className="card border-info shadow-sm mb-4">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaClock className="me-2" />
              <h6 className="mb-0">Historique des ruptures de stock</h6>
              <span className="badge bg-light text-info ms-2">
                {notifications.length}
              </span>
            </div>
            <div className="d-flex gap-2">
              {notificationsNonLues > 0 && (
                <button
                  className="btn btn-sm btn-light"
                  onClick={handleMarquerToutesLues}
                >
                  Tout marquer comme lu
                </button>
              )}
              <button
                className="btn btn-sm btn-light"
                onClick={() => setShowNotificationHistory(false)}
              >
                Fermer
              </button>
            </div>
          </div>
          <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <FaCheckCircle size={32} className="mb-2 text-success" />
                <p className="mb-0">Aucune notification dans l'historique</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${!notif.lu ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex align-items-center">
                      {!notif.lu && (
                        <span className="badge bg-danger rounded-pill me-2" style={{ width: '8px', height: '8px', padding: 0 }}></span>
                      )}
                      <div>
                        <div className="fw-bold">{notif.description}</div>
                        <small className="text-muted">
                          {new Date(notif.dateNotification).toLocaleString('fr-FR')}
                        </small>
                        <div className="mt-1">
                          <small className="text-muted">
                            Produit: {notif.produitNom} | Stock: {notif.stockAvant} → {notif.stockApres}
                          </small>
                        </div>
                      </div>
                    </div>
                    {!notif.lu && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleMarquerLue(notif._id)}
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-danger border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    En rupture
                  </div>
                  <div className="fw-bold text-danger fs-3">
                    {stats?.outOfStockCount || outOfStock.length}
                  </div>
                </div>
                <div className="text-danger opacity-25">
                  <FaExclamationCircle size={28} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {stats?.outOfStockPercentage || "0"}% du stock total
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-warning border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Stock faible
                  </div>
                  <div className="fw-bold text-warning fs-3">
                    {stats?.lowStockCount || lowStock.length}
                  </div>
                </div>
                <div className="text-warning opacity-25">
                  <FaExclamationTriangle size={28} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">Moins de 5 unités</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-success border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Stock normal
                  </div>
                  <div className="fw-bold text-success fs-3">
                    {stats?.normalStockCount || 0}
                  </div>
                </div>
                <div className="text-success opacity-25">
                  <FaCheckCircle size={28} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">5 unités ou plus</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-info border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Total produits
                  </div>
                  <div className="fw-bold text-info fs-3">
                    {stats?.totalProducts || allProducts.length}
                  </div>
                </div>
                <div className="text-info opacity-25">
                  <FaBoxOpen size={28} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">Tous statuts confondus</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="row mb-3">
        <div className="col">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "outOfStock" ? "active text-danger" : ""}`}
                onClick={() => {
                  setActiveTab("outOfStock");
                  setSelectedProducts([]);
                }}
              >
                <FaExclamationCircle className="me-2" />
                Rupture de stock
                <span className="badge bg-danger ms-2">
                  {outOfStock.length}
                </span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "lowStock" ? "active text-warning" : ""}`}
                onClick={() => {
                  setActiveTab("lowStock");
                  setSelectedProducts([]);
                }}
              >
                <FaExclamationTriangle className="me-2" />
                Stock faible
                <span className="badge bg-warning ms-2">{lowStock.length}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="row">
        <div className="col">
          {activeTab === "outOfStock" ? (
            <div className="card border-danger shadow-sm">
              <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaExclamationCircle className="me-2" />
                  <h6 className="mb-0">
                    Produits en rupture de stock (stock = 0)
                  </h6>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-3">
                    {selectedProducts.length} sélectionné(s)
                  </span>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={refreshAlerts}
                    disabled={loading}
                    title="Actualiser"
                  >
                    <FaRedo className={loading ? "fa-spin" : ""} />
                  </button>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3 text-muted">
                      Chargement des produits en rupture...
                    </p>
                  </div>
                ) : outOfStock.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    <FaCheckCircle size={48} className="mb-3 text-success" />
                    <h5 className="text-success">
                      Aucun produit en rupture de stock
                    </h5>
                    <p className="mb-0">Tout est sous contrôle !</p>
                  </div>
                ) : (
                  <ProductList
                    products={sortedOutOfStock}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    loading={false}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    selectedProducts={selectedProducts}
                    onSelectProduct={handleSelectProduct}
                    onSelectAll={handleSelectAll}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="card border-warning shadow-sm">
              <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="me-2" />
                  <h6 className="mb-0">
                    Produits à faible stock (stock &lt; 5)
                  </h6>
                </div>
                <div className="d-flex align-items-center">
                  <span className="me-3">
                    {selectedProducts.length} sélectionné(s)
                  </span>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={refreshAlerts}
                    disabled={loading}
                    title="Actualiser"
                  >
                    <FaRedo className={loading ? "fa-spin" : ""} />
                  </button>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3 text-muted">
                      Chargement des produits à faible stock...
                    </p>
                  </div>
                ) : lowStock.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    <FaCheckCircle size={48} className="mb-3 text-success" />
                    <h5 className="text-success">
                      Aucun produit à faible stock
                    </h5>
                    <p className="mb-0">Tous les stocks sont suffisants !</p>
                  </div>
                ) : (
                  <ProductList
                    products={sortedLowStock}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    loading={false}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    selectedProducts={selectedProducts}
                    onSelectProduct={handleSelectProduct}
                    onSelectAll={handleSelectAll}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions en masse */}
      {selectedProducts.length > 0 && (
        <div className="row mt-4">
          <div className="col">
            <div className="card border-primary shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">
                  Actions groupées ({selectedProducts.length} produits
                  sélectionnés)
                </h6>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleBulkRestock}
                  >
                    <FaEdit className="me-2" />
                    Réapprovisionner en masse
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedProducts([])}
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de stock */}
      {showStockModal && (
        <>
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Modifier le stock
                    {stockModalProduct && ` - ${stockModalProduct.name}`}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowStockModal(false)}
                  ></button>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                      stockValue === "" ||
                      isNaN(Number(stockValue)) ||
                      Number(stockValue) < 0 ||
                      !Number.isInteger(Number(stockValue))
                    ) {
                      window.alert("Le stock doit être un entier >= 0");
                      return;
                    }
                    try {
                      setStockSaving(true);
                      await productAPI.update(stockModalProduct._id, {
                        stock: Number(stockValue),
                      });
                      window.alert("Stock mis à jour.");
                      setShowStockModal(false);
                      fetchAlerts();
                      fetchNotifications(); // ✅ AJOUT pour mettre à jour l'historique
                    } catch (err) {
                      console.error(err);
                      window.alert("Erreur lors de la mise à jour du stock");
                    } finally {
                      setStockSaving(false);
                    }
                  }}
                >
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="stockInput" className="form-label">
                        Stock
                      </label>
                      <input
                        id="stockInput"
                        className="form-control"
                        type="number"
                        min="0"
                        step="1"
                        value={stockValue}
                        onChange={(e) => setStockValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowStockModal(false)}
                      disabled={stockSaving}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={stockSaving}
                    >
                      {stockSaving ? "En cours..." : "Enregistrer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
}