// ProductCard.jsx - Version corrigée avec productDataService
import { FaStar, FaArrowRight, FaBox } from "react-icons/fa";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductDetails } from "../services/productDataService"; // Importer la fonction

const ProductCard = ({ product, onView }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // CORRECTION: Utiliser EXACTEMENT le même nom de paramètre que dans ProductDetails.jsx
  const handleDetailsClick = () => {
    if (onView) {
      onView(product._id);
    }
    // Utiliser le nom du produit (gérer les deux formats)
    const productName = product.nom || product.name || "";
    navigate(`/product/${encodeURIComponent(productName)}`);
  };

  // Effet pour charger l'image du produit
  useEffect(() => {
    const loadProductImage = async () => {
      setLoading(true);

      // Vérifier que le produit existe
      if (!product) {
        setImageError(true);
        setLoading(false);
        return;
      }

      // Récupérer le nom du produit (gérer les deux formats)
      const productName = product.nom || product.name || "";

      if (!productName) {
        setImageError(true);
        setLoading(false);
        return;
      }

      try {
        // Essayer de récupérer les détails depuis l'API productDataService (backend)
        const details = await getProductDetails(productName);

        // Priorité 1: Images depuis productData.js (backend)
        if (details && details.images && details.images.length > 0) {
          const firstImage = details.images[0];
          // Vérifier que l'URL n'est pas vide ou invalide
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
        console.error(
          "Erreur lors de la récupération des détails du produit:",
          error,
        );
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
          // Construire l'URL complète si nécessaire
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

      // Déterminer le dossier en fonction de la catégorie
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

      // Générer le nom de fichier à partir du nom du produit
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

  // Gestionnaire d'erreur d'image
  const handleImageError = () => {
    setImageError(true);
  };

  // Fonctions pour récupérer les données du produit de façon sécurisée
  const getProductName = () => {
    return product?.nom || product?.name || "Produit sans nom";
  };

  const getProductDescription = () => {
    const desc = product?.description || "";
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
        style={{ height: "200px", overflow: "hidden" }}
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
        <div className="d-flex justify-content-between align-items-center">
          <span className="h5 mb-0 text-primary fw-bold">
            {getProductPrice()}€
          </span>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleDetailsClick}
          >
            Détails{" "}
            <FaArrowRight className="ms-1" style={{ fontSize: "0.8rem" }} />
          </button>
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
    description: PropTypes.string,
    prix: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    images: PropTypes.array,
    cheminImageAuto: PropTypes.string,
    rating: PropTypes.number,
    categorie: PropTypes.object,
    category: PropTypes.object,
  }).isRequired,
  onView: PropTypes.func,
};

export default ProductCard;
