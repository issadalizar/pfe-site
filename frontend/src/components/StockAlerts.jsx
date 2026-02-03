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
  FaCheckCircle
} from "react-icons/fa";

export default function StockAlertsPage() {
  const [outOfStock, setOutOfStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
      const [outOfStockRes, lowStockRes, statsRes] = await Promise.all([
        productAPI.getOutOfStock(),
        productAPI.getLowStock(),
        productAPI.getStockStats()
      ]);
      
      setOutOfStock(outOfStockRes.data.data || []);
      setLowStock(lowStockRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = () => {
    fetchAlerts();
  };

  const handleEditProduct = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

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
              <img 
                src="/notification.png" 
                alt="Alertes" 
                style={{ 
                  width: '32px', 
                  height: '32px',
                  marginRight: '12px',
                  filter: 'invert(0.3) sepia(1) saturate(8) hue-rotate(320deg)'
                }}
              />
              <span>
                Alertes Stock
              </span>
            </h1>
            <p className="text-muted mb-0">
              Surveillez les produits en rupture et à faible stock
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
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
      {stats && (
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
                      {stats.outOfStockCount}
                    </div>
                  </div>
                  <div className="text-danger opacity-25">
                    <FaExclamationCircle size={28} />
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    {stats.outOfStockPercentage}% du stock total
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
                      {stats.lowStockCount}
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
                      {stats.normalStockCount}
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
                      {stats.totalProducts}
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
      )}

      {/* Rupture de stock */}
      <div className="card border-danger mb-4 shadow-sm">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaExclamationCircle className="me-2" />
            <h6 className="mb-0">Produits en rupture de stock</h6>
            <span className="badge bg-light text-danger ms-2">
              {outOfStock.length}
            </span>
          </div>
          <div>
            <button 
              className="btn btn-sm btn-light"
              onClick={refreshAlerts}
              disabled={loading}
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
            </div>
          ) : outOfStock.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaCheckCircle size={48} className="mb-3 text-success" />
              <h5 className="text-success">Aucun produit en rupture de stock</h5>
              <p className="mb-0">Tout est sous contrôle !</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="40">
                      <input type="checkbox" className="form-check-input" />
                    </th>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Référence</th>
                    <th>Prix</th>
                    <th>Dernière mise à jour</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStock.map(product => (
                    <tr key={product._id} className="align-middle">
                      <td>
                        <input type="checkbox" className="form-check-input" />
                      </td>
                      <td>
                        <div className="fw-bold">{product.name}</div>
                        <small className="text-muted">{product.shortDescription}</small>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {product.category?.name || "Non catégorisé"}
                        </span>
                      </td>
                      <td>
                        <code>{product.model || "N/A"}</code>
                      </td>
                      <td className="fw-bold">
                        {product.price?.toFixed(2)}€
                      </td>
                      <td>
                        <small>
                          {new Date(product.updatedAt).toLocaleDateString('fr-FR')}
                        </small>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          Réapprovisionner
                        </button>
                        <Link 
                          to={`/products/${product._id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Stock faible */}
      <div className="card border-warning shadow-sm">
        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            <h6 className="mb-0">Produits à faible stock</h6>
            <span className="badge bg-light text-warning ms-2">
              {lowStock.length}
            </span>
          </div>
          <div>
            <button 
              className="btn btn-sm btn-light"
              onClick={refreshAlerts}
              disabled={loading}
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
            </div>
          ) : lowStock.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <FaCheckCircle size={48} className="mb-3 text-success" />
              <h5 className="text-success">Aucun produit à faible stock</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="40">
                      <input type="checkbox" className="form-check-input" />
                    </th>
                    <th>Produit</th>
                    <th>Stock restant</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(product => (
                    <tr key={product._id} className="align-middle">
                      <td>
                        <input type="checkbox" className="form-check-input" />
                      </td>
                      <td>
                        <div className="fw-bold">{product.name}</div>
                      </td>
                      <td>
                        <span className="badge bg-warning">
                          {product.stock} unité(s)
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {product.category?.name}
                        </span>
                      </td>
                      <td className="fw-bold">
                        {product.price?.toFixed(2)}€
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          Mettre à jour
                        </button>
                        <Link 
                          to={`/products/${product._id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}