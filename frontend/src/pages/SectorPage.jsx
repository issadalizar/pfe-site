// src/pages/SectorPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaChevronRight } from "react-icons/fa";
import { categoryAPI } from "../services/CategorieProduct";
import SubCategoryList from "../components/SubCategoryList";
import CategoryProducts from "../components/CategoryProducts";
import "bootstrap/dist/css/bootstrap.min.css";

const SectorPage = () => {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const [sector, setSector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [viewMode, setViewMode] = useState('subcategories');

  // Détails des secteurs
  const sectorDetails = {
    'cnc-education': {
      name: 'CNC for Education',
      description: 'Machines CNC pour l\'enseignement et la formation professionnelle',
      keywords: ['cnc', 'education', 'formation', 'machine']
    },
    'voiture': {
      name: 'Automotive',
      description: 'Équipements didactiques pour l\'automobile et diagnostic',
      keywords: ['auto', 'voiture', 'automobile', 'diagnostic']
    },
    'mcp-lab': {
      name: 'Electronics Lab',
      description: 'Matériel de laboratoire pour l\'électronique et l\'instrumentation',
      keywords: ['electronique', 'lab', 'laboratoire', 'mesure']
    }
  };

  useEffect(() => {
    if (sectorId) {
      fetchSectorCategory();
    }
  }, [sectorId]);

  const fetchSectorCategory = async () => {
    try {
      setLoading(true);
      
      const sectorInfo = sectorDetails[sectorId];
      if (!sectorInfo) {
        setError("Secteur non trouvé");
        setLoading(false);
        return;
      }

      // Récupérer toutes les catégories
      const response = await categoryAPI.getAll();
      const categories = response.data.data || response.data || [];
      
      console.log("📋 Toutes les catégories disponibles:", 
        categories.map(cat => ({
          id: cat._id,
          name: cat.name,
          parent: cat.parent?.name || cat.parent || 'Aucun'
        }))
      );

      // Chercher une catégorie qui correspond au secteur
      let matchingCategory = null;
      
      // Stratégie de recherche améliorée
      for (const cat of categories) {
        const catNameLower = cat.name.toLowerCase();
        
        // Vérifier si le nom de la catégorie contient des mots-clés du secteur
        for (const keyword of sectorInfo.keywords) {
          if (catNameLower.includes(keyword.toLowerCase())) {
            matchingCategory = cat;
            break;
          }
        }
        
        // Vérifier si le secteurId est dans le nom
        if (catNameLower.includes(sectorId.replace('-', ' '))) {
          matchingCategory = cat;
          break;
        }
        
        if (matchingCategory) break;
      }

      // Si toujours pas trouvé, prendre la première catégorie parent
      if (!matchingCategory) {
        matchingCategory = categories.find(cat => !cat.parent) || categories[0];
      }

      if (matchingCategory) {
        console.log("✅ Catégorie trouvée:", matchingCategory.name, "avec ID:", matchingCategory._id);
        setSector({
          _id: matchingCategory._id,
          name: sectorInfo.name,
          description: sectorInfo.description,
          originalName: matchingCategory.name
        });
      } else {
        setError("Aucune catégorie trouvée pour ce secteur");
      }

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
      <div className="sector-page">
        <div className="loading-container text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement du secteur...</p>
        </div>
      </div>
    );
  }

  if (error || !sector) {
    return (
      <div className="sector-page">
        <div className="error-container text-center py-5">
          <div className="alert alert-danger">
            {error || "Secteur non trouvé"}
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
    <div className="sector-page">
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
                <span className="fw-bold text-primary">{sector.name}</span>
                {selectedSubCategory && (
                  <>
                    <FaChevronRight className="mx-2 text-muted" size={12} />
                    <span className="text-dark">{selectedSubCategory.name}</span>
                  </>
                )}
              </nav>
            </div>

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

      <main className="container-fluid px-5 py-4">
        {viewMode === 'subcategories' ? (
          <SubCategoryList
            categoryId={sector._id}
            categoryName={sector.name}
            onBack={handleBackToHome}
            onSelectSubCategory={handleSelectSubCategory}
          />
        ) : (
          <CategoryProducts
            categoryId={selectedSubCategory._id}
            categoryName={selectedSubCategory.name}
            categoryDescription={selectedSubCategory.description}
            parentCategory={sector}
            onBack={handleBackToSubCategories}
          />
        )}
      </main>
    </div>
  );
};

export default SectorPage;