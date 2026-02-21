//composnat li kayaffichi les sous categories dyal wa7ed category
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaFolder, FaChevronRight, FaBox } from "react-icons/fa";
import { categoryAPI } from "../services/api";

const SubCategoryList = ({ categoryId, categoryName, onBack, onSelectSubCategory }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubCategories();
  }, [categoryId]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      const allCategories = response.data.data || response.data || [];
      
      // Filtrer les sous-catégories qui ont categoryId comme parent
      const subs = allCategories.filter(cat => cat.parent?._id === categoryId || cat.parent === categoryId);
      setSubCategories(subs);
    } catch (err) {
      console.error("Erreur lors du chargement des sous-catégories:", err);
      setError("Impossible de charger les sous-catégories");
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
            onClick={() => onSelectSubCategory({ 
              _id: categoryId, 
              name: categoryName,
              description: "Produits directs"
            })}
          >
            Voir les produits directs
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            {subCategories.length} sous-catégorie(s) disponible(s)
          </p>
          
          <div className="row g-4">
            {subCategories.map((subCat) => (
              <div key={subCat._id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100 border-0 shadow-sm hover-shadow"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => onSelectSubCategory(subCat)}
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
                      <span className="text-primary small">
                        Voir les produits
                      </span>
                      <FaChevronRight className="text-primary" />
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