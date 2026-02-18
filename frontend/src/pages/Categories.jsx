// src/pages/Categories.jsx
import React, { useState, useEffect } from "react";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";
import { categoryAPI } from "../services/api";
import { FaPlus } from "react-icons/fa";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);

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
    setFormDataForSubcategory(parentCategory);
    setShowModal(true);
  };

  const setFormDataForSubcategory = (parentCategory) => {
    const nextLevel = Math.min(parentCategory.level + 1, 3);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      parent: parentCategory._id,
      level: nextLevel,
      icon: "📁",
      isActive: true,
    });
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

  return (
    <div>
              <div className="d-none d-md-flex align-items-center gap-3">
                <span className="badge bg-light text-dark p-3 shadow-sm">
                  <i className="bi bi-calendar me-2"></i>
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
      {/* Header */}
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
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={handleAddNewCategory}
        >
          <FaPlus className="me-2" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Stats - Modern Design */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-gradient-primary rounded-4">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-folder fs-2 text-primary"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Total</h6>
                <h2 className="fw-bold mb-0 text-primary">{categories.length}</h2>
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
                <h6 className="text-muted mb-1">Actives</h6>
                <h2 className="fw-bold text-success mb-0">{categories.filter(c => c.isActive).length}</h2>
                {categories.length > 0 && (
                  <small className="text-muted">
                    {((categories.filter(c => c.isActive).length / categories.length) * 100).toFixed(1)}% du total
                  </small>
                )}
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
                <h2 className="fw-bold text-info mb-0">{categories.filter(c => c.level === 1).length}</h2>
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
                <h2 className="fw-bold text-warning mb-0">{categories.filter(c => c.level > 1).length}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <CategoryList
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onAddSubcategory={handleAddSubcategory}
            loading={loading}
          />
        </div>
      </div>

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
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}