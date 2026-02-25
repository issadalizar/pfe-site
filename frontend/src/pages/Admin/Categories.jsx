// src/pages/Categories.jsx
import React, { useState, useEffect } from "react";
import CategoryForm from "../../components/Admin/CategoryForm";
import CategoryList from "../../components/Admin/CategoryList";
import { categoryAPI } from "../../services/api";
import { FaPlus, FaSearch, FaFilter, FaThLarge, FaList } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" ou "card"
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    status: "all",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      showAlert("Erreur lors du chargement des catégories", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
        showAlert("Catégorie modifiée avec succès", "success");
      } else {
        await categoryAPI.create(formData);
        showAlert("Catégorie créée avec succès", "success");
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showAlert("Erreur lors de la sauvegarde", "danger");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await categoryAPI.delete(id);
        fetchCategories();
        showAlert("Catégorie supprimée avec succès", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showAlert("Erreur lors de la suppression", "danger");
      }
    }
  };

  const handleAddSubcategory = (parentCategory) => {
    setSelectedParent(parentCategory);
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setSelectedParent(null);
    setShowModal(true);
  };

  const handleAddNewCategory = () => {
    setEditingCategory(null);
    setSelectedParent(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setSelectedParent(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      level: "",
      status: "all",
    });
  };

  const showAlert = (message, type) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 1050;
      min-width: 300px;
    `;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  // Formatage de la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrage des catégories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !filters.search || 
      category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      category.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLevel = !filters.level || category.level === parseInt(filters.level);
    
    const matchesStatus = filters.status === "all" || 
      (filters.status === "active" && category.isActive) ||
      (filters.status === "inactive" && !category.isActive);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Statistiques
  const activeCategoriesCount = categories.filter(c => c.isActive).length;
  const level1Count = categories.filter(c => c.level === 1).length;
  const subCategoriesCount = categories.filter(c => c.level > 1).length;

  return (
    <div className="bg-light min-vh-100">
      <main className="p-4">
        {/* Header avec date */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold text-primary mb-1" style={{ fontSize: '2.5rem' }}>
              <i className="bi bi-folder me-2"></i>
              Gestion des Catégories
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>
              Organisez vos produits par catégories et sous-catégories
            </p>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            {/* Date comme dans Products */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <span className="badge bg-light text-dark p-3 shadow-sm rounded-3">
                <i className="bi bi-calendar me-2"></i>
                {formatDate(new Date())}
              </span>
            </div>
            
            {/* Boutons de changement de vue avec texte */}
            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn d-flex align-items-center gap-2 ${viewMode === "card" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewMode("card")}
                title="Vue Cartes"
              >
                <FaThLarge />
                <span>Cartes</span>
              </button>
              <button
                className={`btn d-flex align-items-center gap-2 ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewMode("table")}
                title="Vue Tableau"
              >
                <FaList />
                <span>Tableau</span>
              </button>
            </div>
            
            {/* Bouton Nouvelle Catégorie */}
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={handleAddNewCategory}
            >
              <FaPlus className="me-2" />
              Nouvelle Catégorie
            </button>
          </div>
        </div>

        {/* Statistiques avec le même design que Products */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <i className="bi bi-folder fs-2 text-primary"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Catégories</h6>
                  <h2 className="fw-bold mb-0 text-primary">{categories.length}</h2>
                  <small className="text-muted">
                    {activeCategoriesCount} actives • {categories.length - activeCategoriesCount} inactives
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <i className="bi bi-check-circle fs-2 text-success"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Catégories Actives</h6>
                  <h2 className="fw-bold text-success mb-0">{activeCategoriesCount}</h2>
                  <small className="text-muted">
                    {categories.length > 0 ? ((activeCategoriesCount / categories.length) * 100).toFixed(1) : 0}% du total
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <i className="bi bi-layers fs-2 text-info"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Niveau 1</h6>
                  <h2 className="fw-bold text-info mb-0">{level1Count}</h2>
                  <small className="text-muted">Catégories principales</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <i className="bi bi-diagram-3 fs-2 text-warning"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Sous-catégories</h6>
                  <h2 className="fw-bold text-warning mb-0">{subCategoriesCount}</h2>
                  <small className="text-muted">Niveaux 2 et 3</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de filtres */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Rechercher catégorie..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">Tous les niveaux</option>
                  <option value="1">Niveau 1</option>
                  <option value="2">Niveau 2 (Sous-catégorie)</option>
                  <option value="3">Niveau 3 (Sous-sous-catégorie)</option>
                </select>
              </div>

              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives seulement</option>
                  <option value="inactive">Inactives seulement</option>
                </select>
              </div>

              <div className="col-md-1 d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                  onClick={handleResetFilters}
                >
                  <FaFilter className="me-1" size={14} />
                  <span className="d-none d-sm-inline">Réinitialiser</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* En-tête de la liste */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="mb-0 text-dark">
              Liste des Catégories
            </h6>
            <small className="text-muted">
              {filteredCategories.length} catégorie(s) trouvée(s)
            </small>
          </div>
        </div>

        {/* Liste des catégories */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">Chargement des catégories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-folder text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-muted mt-3">Aucune catégorie trouvée</h5>
            <p className="text-muted">Commencez par créer votre première catégorie</p>
            <button
              className="btn btn-primary"
              onClick={handleAddNewCategory}
            >
              <FaPlus className="me-2" />
              Créer une catégorie
            </button>
          </div>
        ) : viewMode === "table" ? (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <CategoryList
                categories={filteredCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onAddSubcategory={handleAddSubcategory}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCategories.map(category => (
              <div key={category._id} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card h-100 border-0 shadow-sm hover-shadow transition rounded-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <span className="fs-1 me-2">{category.icon || '📁'}</span>
                        <div>
                          <h5 className="card-title fw-bold mb-1">{category.name}</h5>
                          <span className={`badge ${category.isActive ? 'bg-success' : 'bg-secondary'} rounded-pill px-3 py-1`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <span className="badge bg-info rounded-pill px-3 py-1">
                        Niveau {category.level}
                      </span>
                    </div>
                    
                    <p className="card-text text-muted small mb-3">
                      {category.description || 'Aucune description'}
                    </p>
                    
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill"
                        onClick={() => handleEditCategory(category)}
                      >
                        Modifier
                      </button>
                      {category.level < 3 && (
                        <button
                          className="btn btn-outline-info btn-sm rounded-pill"
                          onClick={() => handleAddSubcategory(category)}
                          title="Ajouter une sous-catégorie"
                        >
                          <FaPlus size={12} className="me-1" />
                          Sous-cat
                        </button>
                      )}
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <FaPlus size={14} className="rotate-45" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingCategory 
                      ? 'Modifier la Catégorie'
                      : selectedParent
                      ? `Ajouter une sous-catégorie à "${selectedParent.name}"`
                      : 'Nouvelle Catégorie'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <CategoryForm
                    editingCategory={editingCategory}
                    onSave={handleSaveCategory}
                    onCancel={handleCloseModal}
                    categories={categories}
                    selectedParent={selectedParent}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}