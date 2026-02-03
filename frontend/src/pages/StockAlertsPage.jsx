// src/pages/StockAlertsPage.jsx
import React, { useState, useEffect } from "react";
import { productAPI } from "../services/api";
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
  FaEuroSign
} from "react-icons/fa";
import ProductList from "../components/ProductList";

export default function StockAlertsPage() {
  const [outOfStock, setOutOfStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outOfStock');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Nouveau state
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    
    // Actualiser toutes les minutes
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      console.log("🔄 Début du chargement des alertes...");
      
      // Essayez d'abord l'API spécifique
      try {
        const [outOfStockRes, lowStockRes, statsRes] = await Promise.all([
          productAPI.getOutOfStock(),
          productAPI.getLowStock(),
          productAPI.getStockStats()
        ]);
        
        console.log("✅ API spécifique réussie");
        console.log("Produits en rupture:", outOfStockRes.data.data);
        console.log("Produits à faible stock:", lowStockRes.data.data);
        
        setOutOfStock(outOfStockRes.data.data || []);
        setLowStock(lowStockRes.data.data || []);
        setStats(statsRes.data.data);
      } catch (apiError) {
        console.log("⚠️ API spécifique échouée, utilisation alternative...");
        
        // Récupérer tous les produits
        const allProductsRes = await productAPI.getAll();
        const products = allProductsRes.data.data || [];
        setAllProducts(products);
        
        console.log(`📦 Total produits récupérés: ${products.length}`);
        
        // Filtrer localement
        const outOfStockProducts = products.filter(p => {
          const stock = Number(p.stock);
          return isNaN(stock) || stock === 0;
        });
        
        const lowStockProducts = products.filter(p => {
          const stock = Number(p.stock);
          return stock > 0 && stock < 5;
        });
        
        console.log(`🔴 Produits en rupture: ${outOfStockProducts.length}`);
        console.log(`🟡 Produits à faible stock: ${lowStockProducts.length}`);
        
        // Afficher les détails
        outOfStockProducts.forEach(p => {
          console.log(`  - ${p.name} (ID: ${p._id}, Stock: ${p.stock})`);
        });
        
        setOutOfStock(outOfStockProducts);
        setLowStock(lowStockProducts);
        
        // Calculer les stats localement
        const totalProducts = products.length;
        const normalStockCount = products.filter(p => {
          const stock = Number(p.stock);
          return stock >= 5;
        }).length;
        
        setStats({
          outOfStockCount: outOfStockProducts.length,
          lowStockCount: lowStockProducts.length,
          normalStockCount: normalStockCount,
          totalProducts: totalProducts,
          outOfStockPercentage: totalProducts > 0 ? 
            ((outOfStockProducts.length / totalProducts) * 100).toFixed(1) : 0
        });
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = () => {
    fetchAlerts();
  };

  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product._id}`);
  };

  const handleViewProduct = (product) => {
    navigate(`/products/${product._id}`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      console.log("Suppression du produit:", productId);
      // Appeler l'API pour supprimer
      productAPI.delete(productId).then(() => {
        refreshAlerts();
      }).catch(error => {
        console.error("Erreur lors de la suppression:", error);
      });
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentProducts = activeTab === 'outOfStock' ? outOfStock : lowStock;
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(p => p._id));
    }
  };

  const handleBulkRestock = () => {
    if (selectedProducts.length === 0) {
      alert("Sélectionnez au moins un produit");
      return;
    }
    navigate(`/products/bulk-edit?ids=${selectedProducts.join(',')}`);
  };

  // Fonction pour trier les produits
  const getSortedProducts = (products) => {
    if (!sortConfig.key) return products;
    
    return [...products].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
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
            </h1>
            <p className="text-muted mb-0">
              Surveillez les produits en rupture et à faible stock
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
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
                  {stats?.outOfStockPercentage || '0'}% du stock total
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
                <small className="text-muted">
                  Moins de 5 unités
                </small>
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
                <small className="text-muted">
                  5 unités ou plus
                </small>
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
                <small className="text-muted">
                  Tous statuts confondus
                </small>
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
                className={`nav-link ${activeTab === 'outOfStock' ? 'active text-danger' : ''}`}
                onClick={() => {
                  setActiveTab('outOfStock');
                  setSelectedProducts([]); // Réinitialiser la sélection
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
                className={`nav-link ${activeTab === 'lowStock' ? 'active text-warning' : ''}`}
                onClick={() => {
                  setActiveTab('lowStock');
                  setSelectedProducts([]); // Réinitialiser la sélection
                }}
              >
                <FaExclamationTriangle className="me-2" />
                Stock faible
                <span className="badge bg-warning ms-2">
                  {lowStock.length}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="row">
        <div className="col">
          {activeTab === 'outOfStock' ? (
            <div className="card border-danger shadow-sm">
              <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaExclamationCircle className="me-2" />
                  <h6 className="mb-0">Produits en rupture de stock (stock = 0)</h6>
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
                    <p className="mt-3 text-muted">Chargement des produits en rupture...</p>
                  </div>
                ) : outOfStock.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    <FaCheckCircle size={48} className="mb-3 text-success" />
                    <h5 className="text-success">Aucun produit en rupture de stock</h5>
                    <p className="mb-0">Tout est sous contrôle !</p>
                  </div>
                ) : (
                  <ProductList
                    products={sortedOutOfStock}
                    onEdit={handleEditProduct}
                    onView={handleViewProduct}
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
                  <h6 className="mb-0">Produits à faible stock (stock &lt; 5)</h6>
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
                    <p className="mt-3 text-muted">Chargement des produits à faible stock...</p>
                  </div>
                ) : lowStock.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    <FaCheckCircle size={48} className="mb-3 text-success" />
                    <h5 className="text-success">Aucun produit à faible stock</h5>
                    <p className="mb-0">Tous les stocks sont suffisants !</p>
                  </div>
                ) : (
                  <ProductList
                    products={sortedLowStock}
                    onEdit={handleEditProduct}
                    onView={handleViewProduct}
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
                  Actions groupées ({selectedProducts.length} produits sélectionnés)
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
    </div>
  );
}