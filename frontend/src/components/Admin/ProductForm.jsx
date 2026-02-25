// src/components/ProductForm.jsx
import React, { useEffect, useState } from "react";
import { FaSave, FaTimes, FaPlus, FaImage, FaLink } from "react-icons/fa";

export default function ProductForm({ editingProduct, onSave, onCancel, categories }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",     // ✅ string
    category: "",
    model: "",
    features: "",
    images: "",
    link: "",
    isActive: true,
    isFeatured: false,
    stock: "",     // ✅ string
  });

  const [errors, setErrors] = useState({});

  // ✅ Pré-remplissage en mode edit (sans || 0)
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name ?? "",
        description: editingProduct.description ?? "",
        shortDescription: editingProduct.shortDescription ?? "",
        price:
          editingProduct.price !== undefined && editingProduct.price !== null
            ? String(editingProduct.price)
            : "",
        category: editingProduct.category?._id ?? "",
        model: editingProduct.model ?? "",
        features: Array.isArray(editingProduct.features) ? editingProduct.features.join(", ") : "",
        images: Array.isArray(editingProduct.images) ? editingProduct.images.join(", ") : "",
        link: editingProduct.link ?? "",
        isActive: editingProduct.isActive !== undefined ? editingProduct.isActive : true,
        isFeatured: !!editingProduct.isFeatured,
        stock:
          editingProduct.stock !== undefined && editingProduct.stock !== null
            ? String(editingProduct.stock)
            : "",
      });
    } else {
      // ✅ Reset si on n’édite pas
      setFormData({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        category: "",
        model: "",
        features: "",
        images: "",
        link: "",
        isActive: true,
        isFeatured: false,
        stock: "",
      });
      setErrors({});
    }
  }, [editingProduct]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.category) newErrors.category = "La catégorie est requise";

    // ✅ price requis + doit être >= 0
    if (formData.price === "") newErrors.price = "Le prix est requis";
    else {
      const p = Number(formData.price);
      if (Number.isNaN(p) || p < 0) newErrors.price = "Prix invalide";
    }

    // ✅ stock optionnel mais si rempli => entier >= 0
    if (formData.stock !== "") {
      const s = Number(formData.stock);
      if (Number.isNaN(s) || s < 0) newErrors.stock = "Stock invalide";
      // (optionnel) forcer entier:
      if (!Number.isInteger(s)) newErrors.stock = "Stock doit être un entier";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Ne parse pas dans handleChange : on garde la string
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formattedData = {
      ...formData,
      features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      images: formData.images.split(",").map((i) => i.trim()).filter(Boolean),

      // ✅ Conversion sûre ici فقط
      price: Number(formData.price), // price requis donc pas besoin de fallback
      stock: formData.stock === "" ? 0 : Number.parseInt(formData.stock, 10), // vide => 0 (rupture)
    };

    // Debug utile
    // console.log("SUBMIT:", formattedData);

    onSave(formattedData);
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    const existing = formData.images
      ? formData.images.split(",").map((i) => i.trim()).filter(Boolean)
      : [];

    setFormData((prev) => ({
      ...prev,
      images: [...existing, ...urls].join(", "),
    }));
  };

  const imageCount = formData.images
    ? formData.images.split(",").filter((i) => i.trim()).length
    : 0;

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-8 mb-3">
          <label htmlFor="name" className="form-label">Nom du produit *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Livre de Mathématiques"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="col-md-4 mb-3">
          <label htmlFor="model" className="form-label">Modèle/Référence</label>
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
          <label htmlFor="price" className="form-label">Prix (€) *</label>
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${errors.price ? "is-invalid" : ""}`}
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
            />
            <span className="input-group-text">€</span>
            {errors.price && <div className="invalid-feedback">{errors.price}</div>}
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="stock" className="form-label">Stock</label>
          <input
            type="number"
            min="0"
            step="1"
            className={`form-control ${errors.stock ? "is-invalid" : ""}`}
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
          />
          {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="category" className="form-label">Catégorie *</label>
        <select
          className={`form-select ${errors.category ? "is-invalid" : ""}`}
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Sélectionnez une catégorie</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        {errors.category && <div className="invalid-feedback">{errors.category}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="shortDescription" className="form-label">Description courte</label>
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
        <small className="text-muted">{formData.shortDescription.length}/150 caractères</small>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description complète</label>
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
        <label htmlFor="features" className="form-label">Caractéristiques</label>
        <textarea
          className="form-control"
          id="features"
          name="features"
          rows="2"
          value={formData.features}
          onChange={handleChange}
          placeholder="Séparez les caractéristiques par des virgules"
        />
        <small className="text-muted">Entrez les caractéristiques séparées par des virgules</small>
      </div>

      <div className="mb-3">
        <label className="form-label">Images du produit ({imageCount})</label>

        {formData.images.trim() && (
          <div className="mb-3">
            <div className="row g-2">
              {formData.images.split(",").map((imgUrl, index) => {
                const url = imgUrl.trim();
                if (!url) return null;
                return (
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
                );
              })}
            </div>
          </div>
        )}

        <div className="input-group">
          <span className="input-group-text"><FaImage /></span>
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
        <label htmlFor="link" className="form-label">Lien du produit</label>
        <div className="input-group">
          <span className="input-group-text"><FaLink /></span>
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
            <label className="form-check-label" htmlFor="isActive">Produit actif</label>
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
            <label className="form-check-label" htmlFor="isFeatured">En vedette</label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={Number(formData.stock || 0) > 0}
              disabled
            />
            <label className="form-check-label" htmlFor="inStock">En stock</label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary d-flex align-items-center gap-2" onClick={onCancel}>
          <FaTimes /> Annuler
        </button>
        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
          {editingProduct ? (
            <>
              <FaSave /> Modifier
            </>
          ) : (
            <>
              <FaPlus /> Créer
            </>
          )}
        </button>
      </div>
    </form>
  );
}
