// src/components/FeaturedProducts.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { FaBox } from "react-icons/fa";

const FeaturedProducts = ({ products, title = "Produits Vedettes", subtitle = "Découvrez notre sélection de produits phares" }) => {
  const [imageErrors, setImageErrors] = useState({});

  // Fonction pour gérer les erreurs de chargement d'images
  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  // Fonction pour obtenir la première image valide d'un produit
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  // Fonction pour obtenir l'icône de catégorie (fallback)
  const getCategoryIcon = (mainCategory) => {
    if (mainCategory === "CNC for Education") return "⚙️";
    if (mainCategory === "Voitures") return "🚗";
    if (mainCategory === "MCP lab electronics") return "🔬";
    return "📦";
  };

  // Fonction pour obtenir la couleur de fond basée sur la catégorie
  const getCategoryColor = (mainCategory) => {
    if (mainCategory === "CNC for Education") return "#e3f2fd";
    if (mainCategory === "Voitures") return "#fff3e0";
    if (mainCategory === "MCP lab electronics") return "#e8f5e8";
    return "#f5f5f5";
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="featured-products-section">
      <div className="container-fluid px-5">
        <div className="mb-5 text-center">
          <h2 className="display-5 fw-bold mb-2">{title}</h2>
          <p className="text-muted">{subtitle}</p>
        </div>

        <div className="row g-4 justify-content-center">
          {products.map((product, index) => {
            const productImage = getProductImage(product);
            const hasImageError = imageErrors[product.title];
            const bgColor = getCategoryColor(product.mainCategory);
            
            return (
              <div key={index} className="col-6 col-md-4 col-lg-2">
                <div className="featured-product-card">
                  <div 
                    className="product-image-container"
                    style={{ backgroundColor: bgColor }}
                  >
                    {productImage && !hasImageError ? (
                      <img 
                        src={productImage} 
                        alt={product.title}
                        className="product-image"
                        onError={() => handleImageError(product.title)}
                      />
                    ) : (
                      <div className="fallback-icon">
                        <span style={{ fontSize: "2.5rem" }}>{getCategoryIcon(product.mainCategory)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info text-center mt-2">
                    <p className="product-name text-truncate mb-1" title={product.title}>
                      {product.title}
                    </p>
                    <p className="product-category small text-muted mb-0">
                      {product.mainCategory}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .featured-products-section {
          padding: 60px 0;
        }
        
        .featured-product-card {
          transition: all 0.3s ease;
          cursor: default;
        }
        
        .featured-product-card:hover {
          transform: translateY(-5px);
        }
        
        .featured-product-card:hover .product-image-container {
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .product-image-container {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .fallback-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.5);
          border-radius: 12px;
        }
        
        .product-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #333;
        }
        
        .product-category {
          font-size: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .product-name {
            font-size: 0.75rem;
          }
          
          .product-category {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
};

FeaturedProducts.propTypes = {
  products: PropTypes.array.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string
};

export default FeaturedProducts;