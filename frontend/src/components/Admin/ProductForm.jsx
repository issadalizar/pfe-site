// src/components/Admin/ProductForm.jsx
import React, { useEffect, useState } from "react";
import {
  FaSave,
  FaTimes,
  FaPlus,
  FaImage,
  FaCog,
  FaWrench,
  FaTrash,
  FaEdit,
  FaInfoCircle,
} from "react-icons/fa";
import { specificationAPI } from "../../services/specificationAPI";
import { getProductDetails } from "../../pages/productData";

export default function ProductForm({
  editingProduct,
  onSave,
  onCancel,
  categories,
  initialCategoryId,
}) {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: initialCategoryId || "",
    modele: "",
    caracteristiques: [],
    images: [],
    estActif: true,
    stock: "",
  });

  const [specifications, setSpecifications] = useState({
    general: [],
    advanced: [],
  });

  const [productDetails, setProductDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [specType, setSpecType] = useState("general");
  const [currentSpec, setCurrentSpec] = useState({
    key: "",
    value: "",
    id: null,
  });
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Charger les détails du produit depuis productData.js quand le nom change
  useEffect(() => {
    if (formData.nom && formData.nom.trim() !== "") {
      try {
        const details = getProductDetails(formData.nom);
        setProductDetails(details);

        // Ne pré-remplir que si c'est une création et que les champs sont vides
        if (details && !editingProduct) {
          setFormData((prev) => ({
            ...prev,
            description:
              prev.description ||
              details.fullDescription ||
              details.description ||
              "",
            prix: prev.prix || details.price?.toString() || "",
            modele: prev.modele || formData.nom.match(/[A-Z0-9-]+/)?.[0] || "",
            caracteristiques:
              prev.caracteristiques.length > 0
                ? prev.caracteristiques
                : details.features || [],
            images: prev.images.length > 0 ? prev.images : details.images || [],
          }));
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des détails du produit:",
          error,
        );
      }
    }
  }, [formData.nom, editingProduct]);

  // Charger les spécifications si on est en mode édition
  useEffect(() => {
    const loadSpecifications = async () => {
      if (editingProduct && editingProduct._id) {
        try {
          setLoading(true);
          // Essayer d'abord la méthode groupée
          const response = await specificationAPI.getGroupedByProductId(
            editingProduct._id,
          );
          if (response.data) {
            setSpecifications({
              general: Array.isArray(response.data.general)
                ? response.data.general
                : [],
              advanced: Array.isArray(response.data.advanced)
                ? response.data.advanced
                : [],
            });
          }
        } catch (error) {
          console.error("Erreur chargement spécifications (groupée):", error);
          // Fallback à l'ancienne méthode
          try {
            const response = await specificationAPI.getByProductId(
              editingProduct._id,
            );
            const specs = Array.isArray(response.data) ? response.data : [];
            setSpecifications({
              general: specs.filter((s) => s && s.type === "general"),
              advanced: specs.filter((s) => s && s.type === "advanced"),
            });
          } catch (fallbackError) {
            console.error("Fallback aussi échoué:", fallbackError);
            setSpecifications({ general: [], advanced: [] });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadSpecifications();
  }, [editingProduct]);

  // Pré-remplissage en mode edit
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        nom: editingProduct.nom ?? editingProduct.name ?? "",
        description: editingProduct.description ?? "",
        prix: (editingProduct.prix || editingProduct.price)?.toString() ?? "",
        categorie:
          (editingProduct.categorie?._id ??
            editingProduct.category?._id ??
            editingProduct.categorie ??
            editingProduct.category ??
            initialCategoryId) ||
          "",
        modele: editingProduct.modele ?? editingProduct.model ?? "",
        caracteristiques: Array.isArray(editingProduct.caracteristiques)
          ? editingProduct.caracteristiques
          : Array.isArray(editingProduct.features)
            ? editingProduct.features
            : [],
        images: Array.isArray(editingProduct.images)
          ? editingProduct.images
          : [],
        estActif: editingProduct.estActif ?? editingProduct.isActive ?? true,
        stock: editingProduct.stock?.toString() ?? "",
      });
    } else {
      setFormData({
        nom: "",
        description: "",
        prix: "",
        categorie: initialCategoryId || "",
        modele: "",
        caracteristiques: [],
        images: [],
        estActif: true,
        stock: "",
      });
      setProductDetails(null);
      setSpecifications({ general: [], advanced: [] });
      setErrors({});
    }
    setSaveError(null);
  }, [editingProduct, initialCategoryId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom?.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.categorie) newErrors.categorie = "La catégorie est requise";

    if (formData.prix === "") newErrors.prix = "Le prix est requis";
    else {
      const p = Number(formData.prix);
      if (isNaN(p) || p < 0) newErrors.prix = "Prix invalide";
    }

    if (formData.stock !== "") {
      const s = Number(formData.stock);
      if (isNaN(s) || s < 0) newErrors.stock = "Stock invalide";
      else if (!Number.isInteger(s))
        newErrors.stock = "Stock doit être un entier";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSaveError(null);

    try {
      const formattedData = {
        ...formData,
        prix: Number(formData.prix),
        stock: formData.stock === "" ? 0 : parseInt(formData.stock, 10),
        caracteristiques: Array.isArray(formData.caracteristiques)
          ? formData.caracteristiques
          : typeof formData.caracteristiques === "string"
            ? formData.caracteristiques.split("\n").filter((f) => f.trim())
            : [],
        images: Array.isArray(formData.images)
          ? formData.images
          : typeof formData.images === "string"
            ? formData.images
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            : [],
      };

      // Sauvegarder le produit d'abord
      const savedProduct = await onSave(formattedData);

      // Si c'est une création, le produit retourné contient l'ID
      const productId = savedProduct?._id || editingProduct?._id;

      if (productId) {
        // Préparer toutes les spécifications pour l'envoi en masse
        const allSpecs = [
          ...(specifications.general || []).map((s, index) => ({
            key: s.key || "",
            value: s.value || "",
            type: "general",
            order: s.order ?? index,
          })),
          ...(specifications.advanced || []).map((s, index) => ({
            key: s.key || "",
            value: s.value || "",
            type: "advanced",
            order: s.order ?? index,
          })),
        ].filter((spec) => spec.key && spec.value); // Ne garder que les spécifications valides

        if (allSpecs.length > 0) {
          try {
            await specificationAPI.createBulk(productId, allSpecs);
            console.log(`✅ ${allSpecs.length} spécifications sauvegardées`);
          } catch (specError) {
            console.error(
              "Erreur lors de la sauvegarde des spécifications:",
              specError,
            );
            // Ne pas bloquer la fermeture du modal même si les spécifications échouent
          }
        } else {
          try {
            await specificationAPI.deleteByProductId(productId);
          } catch (deleteError) {
            console.error(
              "Erreur lors de la suppression des spécifications:",
              deleteError,
            );
          }
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setSaveError("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...urls],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Gestion des spécifications
  const handleAddSpec = () => {
    setIsEditingSpec(false);
    setCurrentSpec({ key: "", value: "", id: null });
    setShowSpecModal(true);
  };

  const handleEditSpec = (type, spec) => {
    setIsEditingSpec(true);
    setSpecType(type);
    setCurrentSpec({
      key: spec.key || "",
      value: spec.value || "",
      id: spec._id || null,
    });
    setShowSpecModal(true);
  };

  const handleSaveSpec = () => {
    if (!currentSpec.key?.trim() || !currentSpec.value?.trim()) return;

    if (isEditingSpec) {
      // Mode édition
      setSpecifications((prev) => ({
        ...prev,
        [specType]: (prev[specType] || []).map((s) =>
          s._id === currentSpec.id
            ? {
                ...s,
                key: currentSpec.key.trim(),
                value: currentSpec.value.trim(),
              }
            : s,
        ),
      }));
    } else {
      // Mode ajout
      const newSpec = {
        key: currentSpec.key.trim(),
        value: currentSpec.value.trim(),
        _id: `temp-${Date.now()}-${Math.random()}`, // ID temporaire unique
        order: (specifications[specType] || []).length,
      };

      setSpecifications((prev) => ({
        ...prev,
        [specType]: [...(prev[specType] || []), newSpec],
      }));
    }

    setShowSpecModal(false);
    setCurrentSpec({ key: "", value: "", id: null });
  };

  const handleRemoveSpec = (type, index) => {
    if (window.confirm("Voulez-vous supprimer cette spécification ?")) {
      setSpecifications((prev) => ({
        ...prev,
        [type]: (prev[type] || []).filter((_, i) => i !== index),
      }));
    }
  };

  const handleReorderSpecs = (type, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setSpecifications((prev) => {
      const currentSpecs = [...(prev[type] || [])];
      const [movedSpec] = currentSpecs.splice(fromIndex, 1);
      currentSpecs.splice(toIndex, 0, movedSpec);

      // Mettre à jour les ordres
      const updatedSpecs = currentSpecs.map((spec, idx) => ({
        ...spec,
        order: idx,
      }));

      return {
        ...prev,
        [type]: updatedSpecs,
      };
    });
  };

  const SpecModal = () => (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
      onClick={() => setShowSpecModal(false)}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditingSpec ? "Modifier" : "Ajouter"} une spécification{" "}
              {specType === "general" ? "générale" : "avancée"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowSpecModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nom de la spécification</label>
              <input
                type="text"
                className="form-control"
                value={currentSpec.key || ""}
                onChange={(e) =>
                  setCurrentSpec({ ...currentSpec, key: e.target.value })
                }
                placeholder={
                  specType === "general"
                    ? "Ex: Marque, Matériau, Garantie..."
                    : "Ex: Tension, Puissance, Fréquence..."
                }
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Valeur</label>
              <input
                type="text"
                className="form-control"
                value={currentSpec.value || ""}
                onChange={(e) =>
                  setCurrentSpec({ ...currentSpec, value: e.target.value })
                }
                placeholder={
                  specType === "general"
                    ? "Ex: Bosch, Acier, 2 ans..."
                    : "Ex: 12V, 1.5kW, 100MHz..."
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSpecModal(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveSpec}
              disabled={!currentSpec.key?.trim() || !currentSpec.value?.trim()}
            >
              {isEditingSpec ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SpecificationsSection = ({ type, title, icon, bgColor }) => {
    const specs = specifications[type] || [];

    return (
      <div className="col-md-6">
        <div className="card h-100 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0 d-flex align-items-center">
              {icon} <span className="ms-2">{title}</span>
              <span className="badge bg-secondary ms-2">{specs.length}</span>
            </h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                setSpecType(type);
                handleAddSpec();
              }}
            >
              <FaPlus size={12} className="me-1" />
              Ajouter
            </button>
          </div>
          <div className="card-body p-0">
            {specs.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <small>Aucune spécification {title.toLowerCase()}</small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className={bgColor}>
                    <tr>
                      <th style={{ width: "5%" }}>#</th>
                      <th style={{ width: "40%" }}>Caractéristique</th>
                      <th style={{ width: "40%" }}>Valeur</th>
                      <th style={{ width: "15%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((spec, index) => (
                      <tr key={spec._id || `spec-${index}-${Date.now()}`}>
                        <td className="text-muted">{index + 1}</td>
                        <td className="fw-bold">{spec.key || ""}</td>
                        <td>{spec.value || ""}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              onClick={() => handleEditSpec(type, spec)}
                              title="Modifier"
                              disabled={loading}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleRemoveSpec(type, index)}
                              title="Supprimer"
                              disabled={loading}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary ms-1"
                              onClick={() =>
                                handleReorderSpecs(type, index, index - 1)
                              }
                              title="Monter"
                              disabled={loading}
                            >
                              ↑
                            </button>
                          )}
                          {index < specs.length - 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary ms-1"
                              onClick={() =>
                                handleReorderSpecs(type, index, index + 1)
                              }
                              title="Descendre"
                              disabled={loading}
                            >
                              ↓
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const imageList = Array.isArray(formData.images)
    ? formData.images
    : formData.images
      ? formData.images
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];

  const handleCloseModal = () => {
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      {showSpecModal && <SpecModal />}

      {saveError && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {saveError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSaveError(null)}
          ></button>
        </div>
      )}

      {/* Informations de base */}
      <div className="row">
        <div className="col-md-8 mb-3">
          <label htmlFor="nom" className="form-label">
            Nom du produit *
          </label>
          <input
            type="text"
            className={`form-control ${errors.nom ? "is-invalid" : ""}`}
            id="nom"
            name="nom"
            value={formData.nom || ""}
            onChange={handleChange}
            placeholder="Ex: De2-Ultra Mini CNC Turning Center"
            disabled={loading}
          />
          {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}

          {/* Afficher un badge si des données sont disponibles dans productData.js */}
          {productDetails && (
            <div className="mt-1">
              <small className="badge bg-success">
                <FaInfoCircle className="me-1" />
                Données disponibles dans la base de connaissances
              </small>
            </div>
          )}
        </div>

        <div className="col-md-4 mb-3">
          <label htmlFor="modele" className="form-label">
            Modèle/Référence
          </label>
          <input
            type="text"
            className="form-control"
            id="modele"
            name="modele"
            value={formData.modele || ""}
            onChange={handleChange}
            placeholder="Ex: DT-M002, PTL908-2H"
            disabled={loading}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="prix" className="form-label">
            Prix (€) *
          </label>
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${errors.prix ? "is-invalid" : ""}`}
              id="prix"
              name="prix"
              value={formData.prix || ""}
              onChange={handleChange}
              placeholder="0.00"
              disabled={loading}
            />
            <span className="input-group-text">€</span>
            {errors.prix && (
              <div className="invalid-feedback">{errors.prix}</div>
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
            step="1"
            className={`form-control ${errors.stock ? "is-invalid" : ""}`}
            id="stock"
            name="stock"
            value={formData.stock || ""}
            onChange={handleChange}
            placeholder="0"
            disabled={loading}
          />
          {errors.stock && (
            <div className="invalid-feedback">{errors.stock}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="categorie" className="form-label">
          Catégorie *
        </label>
        <select
          className={`form-select ${errors.categorie ? "is-invalid" : ""}`}
          id="categorie"
          name="categorie"
          value={formData.categorie || ""}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="">Sélectionnez une catégorie</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.icon} {c.nom || c.name}
            </option>
          ))}
        </select>
        {errors.categorie && (
          <div className="invalid-feedback">{errors.categorie}</div>
        )}
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
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Description détaillée du produit..."
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="caracteristiques" className="form-label">
          Caractéristiques
        </label>
        <textarea
          className="form-control"
          id="caracteristiques"
          name="caracteristiques"
          rows="3"
          value={
            Array.isArray(formData.caracteristiques)
              ? formData.caracteristiques.join("\n")
              : formData.caracteristiques || ""
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              caracteristiques: e.target.value
                .split("\n")
                .filter((f) => f.trim()),
            })
          }
          placeholder="Une caractéristique par ligne"
          disabled={loading}
        />
        <small className="text-muted">
          Entrez une caractéristique par ligne
        </small>
      </div>

      {/* Section Spécifications */}
      <div className="mb-4">
        <h6 className="mb-3">Spécifications techniques</h6>
        <div className="row g-3">
          <SpecificationsSection
            type="general"
            title="Spécifications générales"
            icon={<FaCog className="text-primary" />}
            bgColor="bg-primary bg-opacity-10"
          />
          <SpecificationsSection
            type="advanced"
            title="Spécifications avancées"
            icon={<FaWrench className="text-info" />}
            bgColor="bg-info bg-opacity-10"
          />
        </div>
      </div>

      {/* Images */}
      <div className="mb-3">
        <label className="form-label">
          Images du produit ({imageList.length})
        </label>

        {imageList.length > 0 && (
          <div className="mb-3">
            <div className="row g-2">
              {imageList.map((imgUrl, index) => (
                <div key={`img-${index}-${Date.now()}`} className="col-3">
                  <div className="border rounded p-1 position-relative">
                    <img
                      src={imgUrl}
                      alt={`Preview ${index + 1}`}
                      className="img-fluid rounded"
                      style={{
                        height: "80px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      style={{ padding: "2px 6px" }}
                      onClick={() => removeImage(index)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="input-group mb-2">
          <span className="input-group-text">
            <FaImage />
          </span>
          <input
            type="text"
            className="form-control"
            name="images"
            value={imageList.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                images: e.target.value
                  .split(",")
                  .map((i) => i.trim())
                  .filter(Boolean),
              })
            }
            placeholder="URLs des images séparées par des virgules"
            disabled={loading}
          />
        </div>

        <div>
          <label className="btn btn-outline-secondary btn-sm">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              disabled={loading}
            />
            <FaImage className="me-1" />
            Télécharger des images
          </label>
          <small className="text-muted ms-2">
            Ou entrez les URLs des images séparées par des virgules
          </small>
        </div>
      </div>

      {/* Switch */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="estActif"
              name="estActif"
              checked={formData.estActif || false}
              onChange={handleChange}
              disabled={loading}
            />
            <label className="form-check-label" htmlFor="estActif">
              Produit actif
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={Number(formData.stock || 0) > 0}
              disabled
            />
            <label className="form-check-label" htmlFor="inStock">
              En stock
            </label>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary d-flex align-items-center gap-2"
          onClick={handleCloseModal}
          disabled={loading}
        >
          <FaTimes /> Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary d-flex align-items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              {editingProduct ? " Modification..." : " Création..."}
            </>
          ) : (
            <>
              {editingProduct ? <FaSave /> : <FaPlus />}
              {editingProduct ? " Modifier" : " Créer"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
