// src/components/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaPlus } from "react-icons/fa";

export default function CategoryForm({ 
  editingCategory, 
  onSave, 
  onCancel,
  categories 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    level: 1,
    icon: "📁",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        parent: editingCategory.parent?._id || "",
        level: editingCategory.level || 1,
        icon: editingCategory.icon || "📁",
        isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true,
      });
    }
  }, [editingCategory]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    
    if (formData.level < 1 || formData.level > 3) {
      newErrors.level = "Le niveau doit être entre 1 et 3";
    }
    
    // Si c'est un niveau 2 ou 3, un parent est requis
    if (formData.level > 1 && !formData.parent) {
      newErrors.parent = "Une catégorie parente est requise pour ce niveau";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const availableParents = categories.filter(cat => 
    cat.level < 3 && 
    cat._id !== (editingCategory?._id) // Ne pas s'inclure soi-même
  );

  const iconOptions = [
    { value: "📁", label: "Dossier" },
    { value: "📚", label: "Livres" },
    { value: "🧮", label: "Mathématiques" },
    { value: "🔬", label: "Science" },
    { value: "💻", label: "Informatique" },
    { value: "🎨", label: "Art" },
    { value: "🎵", label: "Musique" },
    { value: "🏀", label: "Sport" },
    { value: "🌍", label: "Géographie" },
    { value: "📖", label: "Lecture" },
  ];

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Nom de la catégorie *
        </label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Ex: Mathématiques"
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="2"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description de la catégorie..."
        />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="level" className="form-label">
            Niveau *
          </label>
          <select
            className={`form-select ${errors.level ? 'is-invalid' : ''}`}
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="1">Niveau 1 - Catégorie principale</option>
            <option value="2">Niveau 2 - Sous-catégorie</option>
            <option value="3">Niveau 3 - Sous-sous-catégorie</option>
          </select>
          {errors.level && (
            <div className="invalid-feedback">{errors.level}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="parent" className="form-label">
            Catégorie parente
          </label>
          <select
            className={`form-select ${errors.parent ? 'is-invalid' : ''}`}
            id="parent"
            name="parent"
            value={formData.parent}
            onChange={handleChange}
            disabled={formData.level === 1}
          >
            <option value="">Aucun parent</option>
            {availableParents.map((category) => (
              <option key={category._id} value={category._id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          {errors.parent && (
            <div className="invalid-feedback">{errors.parent}</div>
          )}
          {formData.level === 1 && (
            <small className="text-muted">Les catégories de niveau 1 n'ont pas de parent</small>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Icone</label>
        <div className="d-flex align-items-center gap-2 mb-2">
          <div 
            className="border rounded d-flex align-items-center justify-content-center"
            style={{ 
              width: "40px", 
              height: "40px", 
              fontSize: "24px",
              backgroundColor: "#f8f9fa"
            }}
          >
            {formData.icon}
          </div>
          <select
            className="form-select"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
          >
            {iconOptions.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.value} {icon.label}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          className="form-control"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          placeholder="Entrez un emoji personnalisé"
        />
        <small className="text-muted">
          Utilisez un emoji pour représenter votre catégorie
        </small>
      </div>

      <div className="mb-4">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isActive">
            Catégorie active
          </label>
        </div>
        <small className="text-muted d-block">
          Les catégories inactives ne seront pas visibles dans le catalogue
        </small>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary d-flex align-items-center gap-2"
          onClick={onCancel}
        >
          <FaTimes />
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          {editingCategory ? (
            <>
              <FaSave />
              Modifier
            </>
          ) : (
            <>
              <FaPlus />
              Créer
            </>
          )}
        </button>
      </div>
    </form>
  );
}