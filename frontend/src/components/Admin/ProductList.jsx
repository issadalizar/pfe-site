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
  FaCube,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaStar
} from "react-icons/fa";
import { getProductDetails } from "../../pages/productData"; // Importer la fonction

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
    if (stock === 0) {
      return {
        badge: "danger",
        text: "Rupture",
        icon: <FaTimesCircle className="me-1" />
      };
    }
    if (stock < 5) {
      return {
        badge: "warning",
        text: "Faible",
        icon: <FaCube className="me-1" />
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

  // Fonctions utilitaires pour récupérer les données de façon sécurisée
  const getCategoryInfo = (product) => {
    const category = product.categorie || product.category;
    
    if (!category) {
      return {
        icon: '',
        name: 'Non catégorisé',
        parentName: ''
      };
    }

    return {
      icon: category.icon || '',
      name: category.nom || category.name || 'Non catégorisé',
      parentName: category.parent?.nom || category.parent?.name || ''
    };
  };

  // Composant pour afficher l'image du produit en utilisant productData.js
  function ProductImage({ product }) {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [productDetails, setProductDetails] = useState(null);

    useEffect(() => {
      // Utiliser le nom du produit pour récupérer les détails depuis productData.js
      const productName = product.nom || product.name || '';
      if (productName) {
        const details = getProductDetails(productName);
        setProductDetails(details);
        
        // Si des images existent dans productData.js, utiliser la première
        if (details && details.images && details.images.length > 0) {
          setImageUrl(details.images[0]);
        }
        // Sinon, utiliser l'image du produit dans la base de données
        else if (product.images && product.images.length > 0 && product.images[0]) {
          // Si l'image est une URL blob ou relative, on la garde telle quelle
          if (product.images[0].startsWith('blob:') || product.images[0].startsWith('http')) {
            setImageUrl(product.images[0]);
          } else {
            // Sinon, on construit l'URL complète
            setImageUrl(product.images[0].startsWith('/') ? product.images[0] : `/${product.images[0]}`);
          }
        }
        // Sinon, utiliser le chemin d'image auto-généré
        else if (product.cheminImageAuto) {
          setImageUrl(product.cheminImageAuto);
        }
        // Dernier recours : générer un chemin basé sur le nom du produit
        else if (productName) {
          // Déterminer le dossier en fonction de la catégorie
          let categoryPath = 'products';
          
          // Utiliser la catégorie du produit si disponible
          const category = product.categorie || product.category;
          if (category) {
            const catName = category.nom || category.name || '';
            if (catName.includes('CNC') || productName.includes('CNC')) {
              if (productName.includes('Turning') || productName.includes('Lathe')) {
                categoryPath = 'CNC EDUCATION/CNC Turing Machine';
              } else if (productName.includes('Milling')) {
                categoryPath = 'CNC EDUCATION/CNC Milling Machine';
              } else {
                categoryPath = 'CNC EDUCATION';
              }
            } else if (catName.includes('Accessoires') || productName.includes('PTL')) {
              categoryPath = 'MCP lab electronics/Accessoires';
            } else if (catName.includes('EDUCATION EQUIPMENT')) {
              categoryPath = 'MCP lab electronics/EDUCATION EQUIPMENT';
            } else if (catName.includes('CAPTEURS') || catName.includes('ÉLECTRICITÉ') || catName.includes('RÉSEAUX')) {
              categoryPath = `voitures/${catName}`;
            }
          }
          
          // Générer le nom de fichier
          const filename = productName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            + '.png';
          
          setImageUrl(`/images/products/${categoryPath}/${filename}`);
        } else {
          setImageError(true);
        }
      } else {
        setImageError(true);
      }
    }, [product]);

    if (imageError) {
      return (
        <div 
          className="rounded me-3 d-flex align-items-center justify-content-center bg-light"
          style={{ 
            width: '60px', 
            height: '60px', 
            border: '1px solid #dee2e6'
          }}
        >
          <FaImage className="text-muted" size={24} />
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={product.nom || product.name || 'Produit'}
        className="rounded me-3"
        style={{
          width: '60px',
          height: '60px',
          objectFit: 'cover',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}
        onError={() => setImageError(true)}
      />
    );
  }

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
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={onSelectAll}
                  />
                </div>
              </th>
            )}
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('nom')}
            >
              <div className="d-flex align-items-center">
                <span>Produit</span>
                <span className="ms-1">{getSortIcon('nom')}</span>
              </div>
            </th>
            <th>Catégorie</th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('prix')}
            >
              <div className="d-flex align-items-center">
                <FaEuroSign className="me-1" />
                <span>Prix</span>
                <span className="ms-1">{getSortIcon('prix')}</span>
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
            <th>Statut</th>
            <th width="150">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock || 0);
            
            // Récupérer les informations de catégorie de façon sécurisée
            const categoryInfo = getCategoryInfo(product);
            
            // Récupérer les détails du produit depuis productData.js
            const productName = product.nom || product.name || '';
            const details = getProductDetails(productName);
            
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
                      {/* Afficher la catégorie principale si disponible */}
                      {details && details.mainCategory && (
                        <small className="badge bg-info text-white mt-1">
                          {details.mainCategory}
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
                      {typeof (product.prix || product.price) === 'number' 
                        ? (product.prix || product.price).toFixed(2) 
                        : '0.00'} €
                    </strong>
                  </div>
                </td>
                <td>
                  <span className="fw-bold">
                    {product.stock || 0}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${stockStatus.badge}`}>{stockStatus.text}</span>
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