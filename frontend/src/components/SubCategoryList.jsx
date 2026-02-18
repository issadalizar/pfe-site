// src/components/SubCategoryList.jsx
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaFolder, FaChevronRight, FaBox } from "react-icons/fa";
import { categoryAPI } from "../services/api";

const SubCategoryList = ({ categoryId, categoryName, onBack, onSelectSubCategory }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    if (categoryId) {
      fetchSubCategories();
    }
  }, [categoryId]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      console.log("🔍 Recherche des sous-catégories pour categoryId:", categoryId);
      
      const response = await categoryAPI.getAll();
      const allCategories = response.data.data || response.data || [];
      setAllCategories(allCategories);
      
      console.log("📋 Toutes les catégories reçues:", allCategories.length);
      
      // Afficher toutes les catégories avec leurs parents
      allCategories.forEach(cat => {
        console.log(`- ${cat.name} (${cat._id}) - Parent: ${cat.parent?.name || cat.parent || 'Aucun'}`);
      });
      
      // Filtrer les sous-catégories qui ont categoryId comme parent
      const subs = allCategories.filter(cat => {
        const parentId = cat.parent?._id || cat.parent;
        return parentId === categoryId;
      });
      
      console.log(`✅ Sous-catégories trouvées pour ${categoryName}:`, subs.length);
      subs.forEach(sub => console.log(`   → ${sub.name} (${sub._id})`));
      
      setSubCategories(subs);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des sous-catégories:", err);
      setError("Impossible de charger les sous-catégories");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDirectProducts = () => {
    console.log("🔄 Redirection vers les produits directs avec categoryId:", categoryId);
    onSelectSubCategory({ 
      _id: categoryId, 
      name: categoryName,
      description: "Produits directs"
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des sous-catégories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
        <button 
          className="btn btn-outline-danger btn-sm ms-3"
          onClick={fetchSubCategories}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="subcategory-container">
      {subCategories.length === 0 ? (
        <div className="text-center py-5">
          <FaFolder className="text-muted mb-3" size={48} />
          <h5 className="text-muted">Aucune sous-catégorie trouvée</h5>
          <p className="text-muted mb-4">
            Cette catégorie ne contient pas encore de sous-catégories
          </p>
          <button 
            className="btn btn-primary"
            onClick={handleViewDirectProducts}
          >
            Voir les produits directs
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <p className="text-muted mb-0">
              {subCategories.length} sous-catégorie(s) disponible(s)
            </p>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={handleViewDirectProducts}
            >
              Voir tous les produits
            </button>
          </div>
          
          <div className="row g-4">
            {subCategories.map((subCat) => (
              <div key={subCat._id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100 border-0 shadow-sm hover-shadow"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => onSelectSubCategory(subCat)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(67, 97, 238, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle bg-primary bg-opacity-10 p-3 me-3"
                        style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaFolder className="text-primary" size={24} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{subCat.name}</h5>
                        {subCat.level && (
                          <span className="badge bg-info bg-opacity-10 text-info">
                            Niveau {subCat.level}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="card-text text-muted small mb-3">
                      {subCat.description?.substring(0, 100)}
                      {subCat.description?.length > 100 ? "..." : ""}
                    </p>
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-primary small fw-medium">
                        Voir les produits
                      </span>
                      <FaChevronRight className="text-primary" size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

SubCategoryList.propTypes = {
  categoryId: PropTypes.string.isRequired,
  categoryName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onSelectSubCategory: PropTypes.func.isRequired,
};

export default SubCategoryList;