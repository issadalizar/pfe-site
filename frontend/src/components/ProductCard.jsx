// ProductCard.jsx - Version corrigée avec productDataService et bouton 3D
import { FaStar, FaArrowRight, FaBox, FaCube } from "react-icons/fa";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductDetails } from "../services/productDataService";

const ProductCard = ({ product, onView, show3DButton = true }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Fonction pour naviguer vers les détails
  const handleDetailsClick = () => {
    if (onView) {
      onView(product._id);
    }
    const productName = product.nom || product.name || product.title || "";
    navigate(`/product/${encodeURIComponent(productName)}`);
  };

  // ========== NOUVELLE FONCTION: Navigation vers la vue 3D ==========
  const handleView3D = (e) => {
    e.stopPropagation(); // Empêcher la propagation au clic sur la carte
    const productName = product.nom || product.name || product.title || "";
    navigate(`/product3d/${encodeURIComponent(productName)}`);
  };
  // ==================================================================

  // Effet pour charger l'image du produit
  useEffect(() => {
    const loadProductImage = async () => {
      setLoading(true);

      if (!product) {
        setImageError(true);
        setLoading(false);
        return;
      }

      const productName = product.nom || product.name || product.title || "";

      if (!productName) {
        setImageError(true);
        setLoading(false);
        return;
      }

      try {
        const details = await getProductDetails(productName);

        // Priorité 1: Images depuis productData.js
        if (details && details.images && details.images.length > 0) {
          const firstImage = details.images[0];
          if (
            firstImage &&
            firstImage !== ".PNG" &&
            firstImage !== ".JPG" &&
            firstImage !== ".JPEG"
          ) {
            setImageUrl(firstImage);
            setImageError(false);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
      }

      // Priorité 2: Images du produit dans la base de données
      if (
        product.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        const firstImage = product.images[0];
        if (
          firstImage &&
          firstImage !== ".PNG" &&
          firstImage !== ".JPG" &&
          firstImage !== ".JPEG"
        ) {
          let imagePath = firstImage;
          if (!firstImage.startsWith("http") && !firstImage.startsWith("/")) {
            imagePath = `/${firstImage}`;
          }
          setImageUrl(imagePath);
          setImageError(false);
          setLoading(false);
          return;
        }
      }

      // Priorité 3: Chemin d'image auto-généré
      if (product.cheminImageAuto && product.cheminImageAuto !== ".PNG") {
        setImageUrl(product.cheminImageAuto);
        setImageError(false);
        setLoading(false);
        return;
      }

      // Priorité 4: Générer un chemin basé sur la catégorie
      const category = product.categorie || product.category;
      const categoryName = category?.nom || category?.name || "";
      let categoryPath = "products";

      if (categoryName.includes("CNC") || productName.includes("CNC")) {
        if (productName.includes("Turning") || productName.includes("Lathe")) {
          categoryPath = "CNC EDUCATION/CNC Turing Machine";
        } else if (productName.includes("Milling")) {
          categoryPath = "CNC EDUCATION/CNC Milling Machine";
        } else {
          categoryPath = "CNC EDUCATION";
        }
      } else if (
        categoryName.includes("Accessoires") ||
        productName.includes("PTL")
      ) {
        categoryPath = "MCP lab electronics/Accessoires";
      } else if (categoryName.includes("EDUCATION EQUIPMENT")) {
        categoryPath = "MCP lab electronics/EDUCATION EQUIPMENT";
      } else if (
        categoryName.includes("CAPTEURS") ||
        categoryName.includes("ÉLECTRICITÉ") ||
        categoryName.includes("RÉSEAUX")
      ) {
        categoryPath = `voitures/${categoryName}`;
      }

      const filename =
        productName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "_") + ".png";

      const generatedPath = `/images/products/${categoryPath}/${filename}`;
      setImageUrl(generatedPath);
      setImageError(false);
      setLoading(false);
    };

    loadProductImage();
  }, [product]);

  const handleImageError = () => {
    setImageError(true);
  };

  const getProductName = () => {
    return product?.nom || product?.name || product?.title || "Produit sans nom";
  };

  const getProductDescription = () => {
    const desc = product?.description || product?.fullDescription || "";
    return desc.length > 60 ? desc.substring(0, 60) + "..." : desc;
  };

  const getProductPrice = () => {
    const price = product?.prix ?? product?.price ?? 0;
    return typeof price === "number" ? price.toFixed(2) : price;
  };

  const renderStars = (rating = 4.5) => {
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            size={14}
            color={i < Math.floor(rating) ? "#ffc107" : "#e4e5e9"}
          />
        ))}
        <small className="text-muted ms-1">{rating}/5</small>
      </div>
    );
  };

  return (
    <div className="product-card card h-100 border-0 shadow-sm hover-shadow">
      <div
        className="product-image-wrapper bg-light d-flex align-items-center justify-content-center"
        style={{ height: "200px", overflow: "hidden", position: "relative" }}
      >
        {loading ? (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        ) : imageError ? (
          <FaBox className="text-muted" size={48} />
        ) : (
          <img
            src={imageUrl}
            alt={getProductName()}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              padding: "20px",
            }}
            onError={handleImageError}
          />
        )}
      </div>
      <div className="card-body">
        <h5 className="card-title fw-bold mb-2 text-truncate">
          {getProductName()}
        </h5>
        <p className="card-text text-muted small mb-3">
          {getProductDescription()}
        </p>
        <div className="mb-3">{renderStars(product.rating || 4.5)}</div>
        
        {/* ========== NOUVEAU: Boutons d'action ========== */}
        <div className="d-flex gap-2 mb-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={handleDetailsClick}
          >
            Détails{" "}
            <FaArrowRight className="ms-1" style={{ fontSize: "0.8rem" }} />
          </button>
          
          {show3DButton && (
            <button
              className="btn btn-sm"
              onClick={handleView3D}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              title="Voir en 3D"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FaCube size={16} />
            </button>
          )}
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="h5 mb-0 text-primary fw-bold">
            {getProductPrice()}€
          </span>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nom: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    fullDescription: PropTypes.string,
    prix: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    images: PropTypes.array,
    cheminImageAuto: PropTypes.string,
    rating: PropTypes.number,
    categorie: PropTypes.object,
    category: PropTypes.object,
  }).isRequired,
  onView: PropTypes.func,
  show3DButton: PropTypes.bool,
};

export default ProductCard;