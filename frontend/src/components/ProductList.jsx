// src/components/ProductList.jsx
import React from "react";
import { 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaBox,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaStar,
  FaEuroSign,
  FaCube,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle // Ajouté
} from "react-icons/fa";

export default function ProductList({ 
  products, 
  onEdit, 
  onDelete,
  onView,
  loading,
  sortConfig,
  onSort,
  selectedProducts = [],
  onSelectProduct,
  onSelectAll 
}) {
  const getStockStatus = (stock) => {
    const stockNum = Number(stock);
    
    // Ajoutez des logs pour déboguer
    console.log(`getStockStatus: stock=${stock}, num=${stockNum}`);
    
    if (isNaN(stockNum) || stockNum === 0) {
      return {
        badge: "danger",
        text: "Rupture",
        icon: <FaExclamationTriangle className="me-1" /> // Changé d'icône
      };
    }
    if (stockNum < 5) {
      return {
        badge: "warning",
        text: "Faible",
        icon: <FaExclamationTriangle className="me-1" />
      };
    }
    return {
      badge: "success",
      text: "Disponible",
      icon: <FaCheckCircle className="me-1" />
    };
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const renderProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return (
        <img
          src={product.images[0]}
          alt={product.name}
          className="rounded me-3"
          style={{ 
            width: "60px", 
            height: "60px", 
            objectFit: "cover",
            border: "1px solid #dee2e6"
          }}
        />
      );
    }
    return (
      <div 
        className="rounded me-3 d-flex align-items-center justify-content-center"
        style={{ 
          width: "60px", 
          height: "60px", 
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6"
        }}
      >
        <FaBox className="text-muted" size={24} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des produits...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-5">
        <FaBox className="text-muted mb-3" size={48} />
        <h5 className="text-muted">Aucun produit trouvé</h5>
        <p className="text-muted">
          Commencez par créer votre premier produit
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            {onSelectProduct && (
              <th width="50">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={onSelectAll}
                  />
                </div>
              </th>
            )}
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('name')}
            >
              <div className="d-flex align-items-center">
                <span>Produit</span>
                <span className="ms-1">{getSortIcon('name')}</span>
              </div>
            </th>
            <th>Catégorie</th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('price')}
            >
              <div className="d-flex align-items-center">
                <FaEuroSign className="me-1" />
                <span>Prix</span>
                <span className="ms-1">{getSortIcon('price')}</span>
              </div>
            </th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('stock')}
            >
              <div className="d-flex align-items-center">
                <span>Stock</span>
                <span className="ms-1">{getSortIcon('stock')}</span>
              </div>
            </th>
            <th>Statut Stock</th>
            <th>Statut</th>
            <th width="150">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock || 0);
            
            // Log pour déboguer les produits en rupture
            if (stockStatus.text === "Rupture") {
              console.log(`⚠️ Produit en rupture dans ProductList: ${product.name} (ID: ${product._id}, Stock: ${product.stock})`);
            }
            
            return (
              <tr key={product._id} className="align-middle">
                {onSelectProduct && (
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => onSelectProduct(product._id)}
                      />
                    </div>
                  </td>
                )}
                <td>
                  <div className="d-flex align-items-center">
                    {renderProductImage(product)}
                    <div>
                      <strong className="d-block">{product.name}</strong>
                      {product.model && (
                        <small className="text-muted d-block">
                          Ref: {product.model}
                        </small>
                      )}
                      {product.isFeatured && (
                        <small className="text-warning d-block">
                          <FaStar size={12} /> En vedette
                        </small>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">
                    {product.category?.icon} {product.category?.name}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaEuroSign className="text-muted me-1" />
                    <strong className="text-primary">
                      {typeof product.price === 'number' 
                        ? product.price.toFixed(2) 
                        : '0.00'} €
                    </strong>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">
                      {product.stock || 0}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge bg-${stockStatus.badge}`}>
                    {stockStatus.icon}
                    {stockStatus.text}
                  </span>
                </td>
                <td>
                  <span 
                    className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {product.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    {onView && (
                      <button
                        className="btn btn-outline-info"
                        onClick={() => onView(product)}
                        title="Voir détails"
                      >
                        <FaEye />
                      </button>
                    )}
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                        title="Ouvrir le lien"
                      >
                        <FaEye />
                      </a>
                    )}
                    {onEdit && (
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => onEdit(product)}
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => onDelete(product._id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}