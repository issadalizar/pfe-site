// src/pages/PublicCategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaChevronRight } from "react-icons/fa";
import { categoryAPI } from "../services/CategorieProduct";
import SubCategoryList from "../components/SubCategoryList";
import CategoryProducts from "../components/CategoryProducts";
import "bootstrap/dist/css/bootstrap.min.css";

const PublicCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [viewMode, setViewMode] = useState('subcategories'); // 'subcategories' ou 'products'

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getById(categoryId);
      const categoryData = response.data.data || response.data;
      setCategory(categoryData);
      
      // Réinitialiser quand on change de catégorie
      setSelectedSubCategory(null);
      setViewMode('subcategories');
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Impossible de charger les informations");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubCategory = (subCategory) => {
    console.log("Sous-catégorie sélectionnée:", subCategory);
    setSelectedSubCategory(subCategory);
    setViewMode('products');
  };

  const handleBackToSubCategories = () => {
    setSelectedSubCategory(null);
    setViewMode('subcategories');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="public-category-page">
        <div className="loading-container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="public-category-page">
        <div className="error-container text-center py-5">
          <div className="alert alert-danger">
            {error || "Catégorie non trouvée"}
          </div>
          <button 
            className="btn btn-primary mt-3"
            onClick={handleBackToHome}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-category-page">
      {/* Header avec navigation */}
      <header className="category-header bg-white shadow-sm">
        <div className="container-fluid px-5 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-primary btn-sm me-3 d-flex align-items-center"
                onClick={handleBackToHome}
              >
                <FaArrowLeft className="me-2" size={14} />
                Accueil
              </button>
              
              <nav className="breadcrumb-nav d-flex align-items-center">
                <FaHome 
                  className="text-primary cursor-pointer" 
                  onClick={handleBackToHome}
                  style={{ cursor: 'pointer' }}
                />
                <FaChevronRight className="mx-2 text-muted" size={12} />
                <span className="fw-bold text-primary">{category.name}</span>
                {selectedSubCategory && (
                  <>
                    <FaChevronRight className="mx-2 text-muted" size={12} />
                    <span className="text-dark">{selectedSubCategory.name}</span>
                  </>
                )}
              </nav>
            </div>

            {/* Bouton de retour spécifique selon le mode */}
            {viewMode === 'products' && (
              <button 
                className="btn btn-link text-primary"
                onClick={handleBackToSubCategories}
              >
                ← Retour aux sous-catégories
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container-fluid px-5 py-4">
        {viewMode === 'subcategories' ? (
          // ✅ 1. AFFICHAGE DES SOUS-CATÉGORIES avec SubCategoryList
          <SubCategoryList
            categoryId={category._id}
            categoryName={category.name}
            onBack={handleBackToHome}
            onSelectSubCategory={handleSelectSubCategory}
          />
        ) : (
          // ✅ 2. AFFICHAGE DES PRODUITS avec CategoryProducts
          <CategoryProducts
            categoryId={selectedSubCategory._id}
            categoryName={selectedSubCategory.name}
            categoryDescription={selectedSubCategory.description}
            parentCategory={category}
            onBack={handleBackToSubCategories}
          />
        )}
      </main>
    </div>
  );
};

export default PublicCategoryPage;