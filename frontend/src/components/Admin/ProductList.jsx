// src/components/Admin/ProductList.jsx
import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaBox,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEuroSign,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
} from "react-icons/fa";
import { getProductDetails } from "../../services/productDataService";

// ✅ ProductImage défini EN DEHORS de ProductList pour éviter "Rendered fewer hooks"
function ProductImage({ product }) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const productName = product.nom || product.name || "";
      if (productName) {
        try {
          const details = await getProductDetails(productName);
          if (details && details.images && details.images.length > 0) {
            setImageUrl(details.images[0]);
            return;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des détails du produit:", error);
        }
      }

      if (product.images && product.images.length > 0 && product.images[0]) {
        if (product.images[0].startsWith("blob:") || product.images[0].startsWith("http")) {
          setImageUrl(product.images[0]);
        } else {
          setImageUrl(product.images[0].startsWith("/") ? product.images[0] : `/${product.images[0]}`);
        }
      } else if (product.cheminImageAuto) {
        setImageUrl(product.cheminImageAuto);
      } else {
        setImageError(true);
      }
    };

    fetchProductDetails();
  }, [product]);

  if (imageError || !imageUrl) {
    return (
      <div
        className="rounded me-3 d-flex align-items-center justify-content-center bg-light"
        style={{ width: "60px", height: "60px", border: "1px solid #dee2e6" }}
      >
        <FaImage className="text-muted" size={24} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={product.nom || product.name || "Produit"}
      className="rounded me-3"
      style={{
        width: "60px",
        height: "60px",
        objectFit: "cover",
        border: "1px solid #dee2e6",
        borderRadius: "4px",
      }}
      onError={() => setImageError(true)}
    />
  );
}

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
  onSelectAll,
}) {
  const getStockStatus = (product) => {
    const stock = Number(product.stock || 0);
    const status = product.status || (stock === 0 ? 'rupture' : stock < 5 ? 'faible' : 'available');

    if (status === 'rupture') {
      return {
        badge: 'danger',
        text: 'Rupture',
        icon: <FaTimesCircle className="me-1" />,
      };
    }

    if (status === 'faible') {
      return {
        badge: 'warning',
        text: 'Stock faible',
        icon: <FaBox className="me-1" />,
      };
    }

    return {
      badge: 'success',
      text: 'Disponible',
      icon: <FaCheckCircle className="me-1" />,
    };
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  // Fonctions utilitaires pour récupérer les données de façon sécurisée
  const getCategoryInfo = (product) => {
    const category = product.categorie || product.category;

    if (!category) {
      return {
        icon: "",
        name: "Non catégorisé",
        parentName: "",
      };
    }

    return {
      icon: category.icon || "",
      name: category.nom || category.name || "Non catégorisé",
      parentName: category.parent?.nom || category.parent?.name || "",
    };
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
        <p className="text-muted">Commencez par créer votre premier produit</p>
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
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={onSelectAll}
                  />
                </div>
              </th>
            )}
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("nom")}>
              <div className="d-flex align-items-center">
                <span>Produit</span>
                <span className="ms-1">{getSortIcon("nom")}</span>
              </div>
            </th>
            <th>Catégorie</th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("prix")}>
              <div className="d-flex align-items-center">
                <FaEuroSign className="me-1" />
                <span>Prix</span>
                <span className="ms-1">{getSortIcon("prix")}</span>
              </div>
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("stock")}>
              <div className="d-flex align-items-center">
                <span>Stock</span>
                <span className="ms-1">{getSortIcon("stock")}</span>
              </div>
            </th>
            <th>Statut</th>
            <th width="150">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const categoryInfo = getCategoryInfo(product);

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
                    <ProductImage product={product} />
                    <div>
                      <strong className="d-block">{product.nom || product.name}</strong>
                      {(product.modele || product.model) && (
                        <small className="text-muted d-block">
                          Ref: {product.modele || product.model}
                        </small>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">
                    {categoryInfo.icon} {categoryInfo.name}
                    {categoryInfo.parentName && (
                      <small className="d-block text-muted">
                        {categoryInfo.parentName}
                      </small>
                    )}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaEuroSign className="text-muted me-1" />
                    <strong className="text-primary">
                      {typeof (product.prix || product.price) === "number"
                        ? (product.prix || product.price).toFixed(2)
                        : "0.00"} €
                    </strong>
                  </div>
                </td>
                <td>
                  <span className="fw-bold">{product.stock || 0}</span>
                </td>
                <td>
                  <span className={`badge bg-${stockStatus.badge}`}>
                    {stockStatus.text}
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