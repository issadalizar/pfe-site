// src/components/CategoryProductsView.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCube,
  FaList,
  FaThLarge,
  FaEye,
  FaHome,
  FaSearch,
  FaTimes,
  FaTag,
  FaBox,
  FaImage,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";
import { getAllCncProducts } from "../../services/productDataService";
import { categoryAPI } from "../../services/CategorieProduct";

const ProductImage = ({ product, className, style }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      console.log("📸 Image trouvée dans productData:", product.images[0]);
      setImageSrc(product.images[0]);
      setError(false);
    } else {
      console.log("❌ Aucune image définie pour:", product.title);
      setError(true);
    }
  }, [product]);

  if (error || !imageSrc) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-light text-muted"
        style={{
          width: style?.width || "100%",
          height: style?.height || "150px",
          borderRadius: "4px",
          border: "1px solid #dee2e6",
        }}
      >
        <FaBox size={32} className="opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={product.title}
      className={className}
      style={style}
      onError={(e) => {
        console.log("❌ Erreur chargement image:", imageSrc);
        setError(true);
      }}
      loading="lazy"
    />
  );
};

export default function CategoryProductsView() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // ========== NOUVELLE FONCTION: Navigation vers la vue 3D ==========
  const handleView3D = (e, product) => {
    e.stopPropagation();
    navigate(`/product3d/${encodeURIComponent(product.title)}`);
  };
  // ==================================================================

  // Liste des produits à exclure
  const excludedProducts = ["MI2505 – Contrôleur Charge-Démarrage 12V/500A"];

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId]);

  const buildParentHierarchy = (categoryId, categories) => {
    const hierarchy = [];
    let currentId = categoryId;

    while (currentId) {
      const currentCat = categories.find((c) => c._id === currentId);
      if (!currentCat) break;

      hierarchy.unshift(currentCat);
      currentId = currentCat.parent?._id;
    }

    return hierarchy;
  };

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      const response = await categoryAPI.getAll();
      const allCategoriesData = response.data.data;
      setAllCategories(allCategoriesData);

      const currentCategory = allCategoriesData.find(
        (c) => c._id === categoryId,
      );

      if (currentCategory) {
        setCategory(currentCategory);

        const hierarchy = buildParentHierarchy(categoryId, allCategoriesData);
        setParentCategories(hierarchy);

        const getAllSubcategories = (cat) => {
          let subs = [];
          const directSubs = allCategoriesData.filter(
            (c) => c.parent?._id === cat._id,
          );

          directSubs.forEach((subCat) => {
            subs.push(subCat);
            subs = [...subs, ...getAllSubcategories(subCat)];
          });

          return subs;
        };

        const subcategories = getAllSubcategories(currentCategory);
        setAllSubcategories(subcategories);

        const categoryNamesToSearch = [
          currentCategory.name,
          ...subcategories.map((sub) => sub.name),
        ].map((name) => name.toLowerCase());

        console.log("Recherche de produits pour:", categoryNamesToSearch);

        const foundProducts = [];

        // Charger les données des produits depuis le backend
        const cncProducts = await getAllCncProducts();

        Object.entries(cncProducts).forEach(([key, productData]) => {
          if (typeof productData !== "object" || !productData.title) return;

          if (excludedProducts.includes(productData.title)) {
            console.log("🚫 Produit exclu:", productData.title);
            return;
          }

          const productCategory = productData.category?.toLowerCase() || "";
          const productMainCategory =
            productData.mainCategory?.toLowerCase() || "";

          const matchesCategory = categoryNamesToSearch.some(
            (catName) =>
              productCategory.includes(catName) ||
              catName.includes(productCategory) ||
              productMainCategory.includes(catName) ||
              catName.includes(productMainCategory),
          );

          if (matchesCategory) {
            foundProducts.push({
              ...productData,
              id: key,
              productKey: key,
            });
          }
        });

        const uniqueProducts = foundProducts.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p.title === product.title),
        );

        setProducts(uniqueProducts);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleNavigateToCategory = (catId) => {
    navigate(`/categories/${catId}/products`);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.fullDescription
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.features?.some((f) =>
        f.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid p-4">
        {/* Fil d'Ariane */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/categories" className="text-decoration-none">
                <FaHome className="me-1" />
                Catégories
              </Link>
            </li>
            {parentCategories.map((cat, index) => (
              <li
                key={cat._id}
                className={`breadcrumb-item ${index === parentCategories.length - 1 ? "active" : ""}`}
              >
                {index === parentCategories.length - 1 ? (
                  <span>
                    {cat.level === 1 && (
                      <FaFolder className="me-1 text-primary" />
                    )}
                    {cat.level === 2 && (
                      <FaFolderOpen className="me-1 text-success" />
                    )}
                    {cat.level === 3 && <FaCube className="me-1 text-info" />}
                    {cat.name}
                  </span>
                ) : (
                  <button
                    onClick={() => handleNavigateToCategory(cat._id)}
                    className="btn btn-link p-0 text-decoration-none"
                    style={{ verticalAlign: "baseline" }}
                  >
                    {cat.level === 1 && (
                      <FaFolder className="me-1 text-primary" />
                    )}
                    {cat.level === 2 && (
                      <FaFolderOpen className="me-1 text-success" />
                    )}
                    {cat.level === 3 && <FaCube className="me-1 text-info" />}
                    {cat.name}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <Link to="/categories" className="btn btn-outline-secondary me-3">
              <FaArrowLeft className="me-2" />
              Retour
            </Link>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                {category?.level === 1 && (
                  <FaFolder className="text-primary" size={28} />
                )}
                {category?.level === 2 && (
                  <FaFolderOpen className="text-success" size={28} />
                )}
                {category?.level === 3 && (
                  <FaCube className="text-info" size={28} />
                )}
                <h1 className="fw-bold text-primary mb-0">
                  {category?.name || "Produits"}
                </h1>
              </div>

              <div className="d-flex align-items-center gap-3">
                <p className="text-muted mb-0">
                  <FaBox className="me-1" />
                  {products.length} produit(s)
                </p>

                {category && (
                  <span
                    className={`badge ${
                      category.level === 1
                        ? "bg-primary"
                        : category.level === 2
                          ? "bg-success"
                          : "bg-info"
                    }`}
                  >
                    Niveau {category.level}
                  </span>
                )}

                {allSubcategories.length > 0 && (
                  <span className="badge bg-secondary">
                    {allSubcategories.length} sous-catégorie(s)
                  </span>
                )}
              </div>

              {allSubcategories.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted me-2">Sous-catégories:</small>
                  {allSubcategories.map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => handleNavigateToCategory(sub._id)}
                      className="btn btn-sm btn-outline-primary me-2 mb-1 rounded-pill"
                    >
                      {sub.level === 2 && (
                        <FaFolderOpen className="me-1" size={12} />
                      )}
                      {sub.level === 3 && <FaCube className="me-1" size={12} />}
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className={`btn d-flex align-items-center gap-2 ${viewMode === "grid" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("grid")}
            >
              <FaThLarge />
              <span>Grille</span>
            </button>
            <button
              className={`btn d-flex align-items-center gap-2 ${viewMode === "list" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("list")}
            >
              <FaList />
              <span>Liste</span>
            </button>
          </div>
        </div>

        {/* Recherche */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm("")}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <div className="badge bg-light text-dark p-3 rounded-3 float-end">
                  <FaTag className="me-2 text-primary" />
                  {filteredProducts.length} produits trouvés
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <FaCube className="text-muted mb-3" size={48} />
            <h5 className="text-muted">Aucun produit trouvé</h5>
            <p className="text-muted">
              {searchTerm
                ? "Aucun produit ne correspond à votre recherche"
                : "Aucun produit n'est associé à cette catégorie"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="row g-4">
            {filteredProducts.map((product, index) => (
              <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card h-100 border-0 shadow-sm hover-shadow transition rounded-4 position-relative">
                  {/* ========== NOUVEAU: Bouton 3D flottant ========== */}
                  <button
                    onClick={(e) => handleView3D(e, product)}
                    className="btn-3d-float"
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease',
                      zIndex: 10,
                      opacity: 0,
                      transform: 'translateY(-5px)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) translateY(0)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    }}
                    title="Voir en 3D"
                  >
                    <FaCube size={18} />
                  </button>

                  <div
                    className="card-img-top p-3 text-center border-bottom"
                    style={{
                      height: "180px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ProductImage
                      product={product}
                      style={{
                        maxHeight: "150px",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-2">{product.title}</h5>
                    <small className="text-muted d-block mb-2">
                      {product.category}
                    </small>

                    <p className="card-text text-muted small mb-3">
                      {product.fullDescription?.substring(0, 80)}...
                    </p>

                    {product.price && (
                      <div className="mb-3">
                        <span className="badge bg-success rounded-pill px-3 py-2">
                          {product.price.toLocaleString()} DT
                        </span>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary flex-grow-1 rounded-pill"
                        onClick={() => handleViewProduct(product)}
                      >
                        <FaEye className="me-2" />
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {filteredProducts.map((product, index) => (
                  <div key={index} className="list-group-item p-3">
                    <div className="row align-items-center">
                      <div className="col-md-1">
                        <ProductImage
                          product={product}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <h6 className="fw-bold mb-1">{product.title}</h6>
                        <small className="text-muted">{product.category}</small>
                      </div>

                      <div className="col-md-5">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          {product.price && (
                            <span className="fw-bold text-success me-3">
                              {product.price.toLocaleString()} DT
                            </span>
                          )}
                          {/* ========== NOUVEAU: Bouton 3D en mode liste ========== */}
                          <button
                            className="btn btn-sm"
                            onClick={(e) => handleView3D(e, product)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              color: 'white',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px',
                            }}
                            title="Voir en 3D"
                          >
                            <FaCube size={14} />
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            <FaEye className="me-2" />
                            Détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal des détails */}
        {showProductModal && selectedProduct && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowProductModal(false)}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">{selectedProduct.title}</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowProductModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Images */}
                  {selectedProduct.images &&
                    selectedProduct.images.length > 0 && (
                      <div className="row g-2 mb-4">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className="col-4">
                            <div
                              className="border rounded p-2 text-center bg-light"
                              style={{
                                height: "120px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ProductImage
                                product={{ ...selectedProduct, images: [img] }}
                                style={{
                                  maxHeight: "100px",
                                  maxWidth: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Description */}
                  <div className="mb-4">
                    <h6 className="fw-bold">Description</h6>
                    <p className="text-muted">
                      {selectedProduct.fullDescription}
                    </p>
                  </div>

                  {/* Caractéristiques */}
                  {selectedProduct.features && (
                    <div className="mb-4">
                      <h6 className="fw-bold">Caractéristiques</h6>
                      <ul className="list-unstyled">
                        {selectedProduct.features.map((feature, idx) => (
                          <li key={idx} className="mb-2">
                            <span className="text-success me-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Spécifications */}
                  {selectedProduct.specifications && (
                    <div className="mb-4">
                      <h6 className="fw-bold">Spécifications</h6>
                      <table className="table table-sm">
                        <tbody>
                          {Object.entries(selectedProduct.specifications).map(
                            ([key, value]) => (
                              <tr key={key}>
                                <th className="bg-light">{key}</th>
                                <td>{value}</td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Prix */}
                  {selectedProduct.price && (
                    <div className="alert alert-info">
                      <strong>Prix: </strong>
                      {selectedProduct.price.toLocaleString()} DT
                    </div>
                  )}

                  {/* ========== NOUVEAU: Bouton 3D dans le modal ========== */}
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      onClick={(e) => {
                        setShowProductModal(false);
                        navigate(`/product3d/${encodeURIComponent(selectedProduct.title)}`);
                      }}
                      className="btn btn-lg"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '12px 30px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <FaCube size={20} />
                      Voir ce produit en 3D
                    </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowProductModal(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style pour les boutons 3D */}
        <style jsx>{`
          .card:hover .btn-3d-float {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        `}</style>
      </div>
    </div>
  );
}