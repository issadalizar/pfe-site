// src/components/CategoryProducts.jsx
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaBox, FaChevronLeft } from "react-icons/fa";
import { productAPI } from "../services/api";
import ProductCard from "./ProductCard";

const CategoryProducts = ({ 
  categoryId, 
  categoryName, 
  categoryDescription,
  parentCategory,
  onBack 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching products for category ID:", categoryId);
      console.log("📋 Category name:", categoryName);
      
      const response = await productAPI.getByCategory(categoryId);
      console.log("📦 Réponse API produits:", response);
      
      const productsData = response.data.data || response.data || [];
      console.log("✅ Produits trouvés:", productsData.length);
      
      if (productsData.length > 0) {
        productsData.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name || product.title} (${product._id})`);
        });
      } else {
        console.log("⚠️ Aucun produit trouvé pour cette catégorie");
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des produits:", err);
      setError("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={fetchProducts}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="category-products-container">
      {/* En-tête avec informations */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <button 
            className="btn btn-outline-primary btn-sm me-3 d-flex align-items-center"
            onClick={onBack}
          >
            <FaChevronLeft className="me-1" size={12} />
            Retour
          </button>
          <div>
            {parentCategory && (
              <small className="text-muted d-block">
                {parentCategory.name} / 
              </small>
            )}
            <h3 className="fw-bold mb-1">{categoryName}</h3>
          </div>
        </div>
        
        {categoryDescription && (
          <p className="text-muted mb-4">{categoryDescription}</p>
        )}
        
        <p className="text-muted small">
          {products.length} produit(s) trouvé(s)
        </p>
      </div>

      {/* Liste des produits */}
      {products.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <FaBox className="text-muted" size={48} />
          </div>
          <h5 className="text-muted mb-2">Aucun produit trouvé</h5>
          <p className="text-muted">
            Cette catégorie ne contient pas encore de produits
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-md-6 col-lg-4">
              <ProductCard 
                product={product}
                onView={(id) => console.log("Voir produit:", id)}
                showCategory={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CategoryProducts.propTypes = {
  categoryId: PropTypes.string.isRequired,
  categoryName: PropTypes.string.isRequired,
  categoryDescription: PropTypes.string,
  parentCategory: PropTypes.object,
  onBack: PropTypes.func.isRequired,
};

export default CategoryProducts;