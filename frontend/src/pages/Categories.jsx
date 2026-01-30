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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2 text-dark">Gestion des Catégories</h1>
          <p className="text-muted mb-0">
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

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-primary">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Total</h6>
              <h2 className="card-title text-primary">{categories.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Actives</h6>
              <h2 className="card-title text-success">
                {categories.filter(c => c.isActive).length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-info">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Niveau 1</h6>
              <h2 className="card-title text-info">
                {categories.filter(c => c.level === 1).length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Sous-catégories</h6>
              <h2 className="card-title text-warning">
                {categories.filter(c => c.level > 1).length}
              </h2>
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