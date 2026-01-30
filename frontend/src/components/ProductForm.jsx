// src/components/ProductForm.jsx
import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaPlus, FaImage, FaLink } from "react-icons/fa";

export default function ProductForm({ 
  editingProduct, 
  onSave, 
  onCancel,
  categories 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: 0,
    category: "",
    model: "",
    features: "",
    images: "",
    link: "",
    isActive: true,
    isFeatured: false,
    stock: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        shortDescription: editingProduct.shortDescription || "",
        price: editingProduct.price || 0,
        category: editingProduct.category?._id || "",
        model: editingProduct.model || "",
        features: editingProduct.features?.join(', ') || "",
        images: editingProduct.images?.join(', ') || "",
        link: editingProduct.link || "",
        isActive: editingProduct.isActive !== undefined ? editingProduct.isActive : true,
        isFeatured: editingProduct.isFeatured || false,
        stock: editingProduct.stock || 0,
      });
    }
  }, [editingProduct]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    
    if (!formData.category) {
      newErrors.category = "La catégorie est requise";
    }
    
    if (formData.price < 0) {
      newErrors.price = "Le prix ne peut pas être négatif";
    }
    
    if (formData.stock < 0) {
      newErrors.stock = "Le stock ne peut pas être négatif";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert comma-separated strings to arrays
      const formattedData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        images: formData.images.split(',').map(i => i.trim()).filter(i => i),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };
      
      onSave(formattedData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseFloat(value) : value)
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    // This is a simplified version - in production you'd upload to a server
    const files = e.target.files;
    if (files.length > 0) {
      const urls = Array.from(files).map(file => 
        URL.createObjectURL(file)
      );
      const existingImages = formData.images ? formData.images.split(',').map(i => i.trim()) : [];
      setFormData(prev => ({
        ...prev,
        images: [...existingImages, ...urls].filter(i => i).join(', ')
      }));
    }
  };

  const imageCount = formData.images ? formData.images.split(',').filter(i => i.trim()).length : 0;

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-8 mb-3">
          <label htmlFor="name" className="form-label">
            Nom du produit *
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ex: Livre de Mathématiques"
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name}</div>
          )}
        </div>

        <div className="col-md-4 mb-3">
          <label htmlFor="model" className="form-label">
            Modèle/Référence
          </label>
          <input
            type="text"
            className="form-control"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Ex: MATH-001"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="price" className="form-label">
            Prix (€) *
          </label>
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${errors.price ? 'is-invalid' : ''}`}
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <span className="input-group-text">€</span>
            {errors.price && (
              <div className="invalid-feedback">{errors.price}</div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="stock" className="form-label">
            Stock
          </label>
          <input
            type="number"
            min="0"
            className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
          />
          {errors.stock && (
            <div className="invalid-feedback">{errors.stock}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="category" className="form-label">
          Catégorie *
        </label>
        <select
          className={`form-select ${errors.category ? 'is-invalid' : ''}`}
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Sélectionnez une catégorie</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <div className="invalid-feedback">{errors.category}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="shortDescription" className="form-label">
          Description courte
        </label>
        <textarea
          className="form-control"
          id="shortDescription"
          name="shortDescription"
          rows="2"
          maxLength="150"
          value={formData.shortDescription}
          onChange={handleChange}
          placeholder="Description concise pour les listes de produits..."
        />
        <small className="text-muted">
          {formData.shortDescription.length}/150 caractères
        </small>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description complète
        </label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description détaillée du produit..."
        />
      </div>

      <div className="mb-3">
        <label htmlFor="features" className="form-label">
          Caractéristiques
        </label>
        <textarea
          className="form-control"
          id="features"
          name="features"
          rows="2"
          value={formData.features}
          onChange={handleChange}
          placeholder="Séparez les caractéristiques par des virgules: 
          Couverture rigide, 300 pages, Illustrations couleur, Format A4"
        />
        <small className="text-muted">
          Entrez les caractéristiques séparées par des virgules
        </small>
      </div>

      <div className="mb-3">
        <label className="form-label">
          Images du produit ({imageCount})
        </label>
        
        {formData.images && formData.images.trim() && (
          <div className="mb-3">
            <div className="row g-2">
              {formData.images.split(',').map((imgUrl, index) => {
                const url = imgUrl.trim();
                return url ? (
                  <div key={index} className="col-3">
                    <div className="border rounded p-1">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: "80px", objectFit: "cover", width: "100%" }}
                      />
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="input-group">
          <span className="input-group-text">
            <FaImage />
          </span>
          <input
            type="text"
            className="form-control"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="URLs des images séparées par des virgules"
          />
        </div>
        
        <div className="mt-2">
          <label className="btn btn-outline-secondary btn-sm">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <FaImage className="me-1" />
            Télécharger des images
          </label>
          <small className="text-muted ms-2">
            Ou entrez les URLs des images séparées par des virgules
          </small>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="link" className="form-label">
          Lien du produit
        </label>
        <div className="input-group">
          <span className="input-group-text">
            <FaLink />
          </span>
          <input
            type="url"
            className="form-control"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://exemple.com/produit"
          />
        </div>
        <small className="text-muted">
          Lien vers la page détaillée du produit
        </small>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
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
              Produit actif
            </label>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="isFeatured">
              En vedette
            </label>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={formData.stock > 0}
              disabled
            />
            <label className="form-check-label" htmlFor="inStock">
              En stock
            </label>
          </div>
        </div>
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
          {editingProduct ? (
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