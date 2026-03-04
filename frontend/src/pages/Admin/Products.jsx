// src/pages/Products.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProductForm from "../../components/Admin/ProductForm";
import ProductList from "../../components/Admin/ProductList";
import { productAPI, categoryAPI } from "../../services/CategorieProduct";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTrash,
  FaBook,
  FaArrowLeft,
  FaLayerGroup,
  FaEye,
  FaThLarge,
  FaList,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Products() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [viewDirectProductsOnly, setViewDirectProductsOnly] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" ou "card"

  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: "",
    niveau: "",
    category: categoryId || "",
    subCategory: "",
    status: "all",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [alertCounts, setAlertCounts] = useState({
    outOfStock: 0,
    lowStock: 0,
  });

  // Effet pour gérer la catégorie depuis l'URL
  useEffect(() => {
    if (categoryId) {
      console.log("CategoryId depuis URL:", categoryId);

      const fromCategoryList = location.state?.viewDirectProductsOnly || false;
      setViewDirectProductsOnly(fromCategoryList);
      console.log(
        "🔍 Mode vue:",
        fromCategoryList
          ? "Produits directs seulement"
          : "Tous les produits (avec sous-catégories)",
      );

      setFilters((prev) => ({
        ...prev,
        category: categoryId,
      }));

      const fetchCategoryInfo = async () => {
        try {
          const response = await categoryAPI.getById(categoryId);
          if (response.data.data) {
            setCurrentCategory(response.data.data);
            console.log("Catégorie trouvée:", response.data.data);
          }
        } catch (error) {
          console.error("Erreur récupération catégorie:", error);
        }
      };

      fetchCategoryInfo();
    } else {
      setFilters((prev) => ({
        ...prev,
        category: "",
      }));
      setCurrentCategory(null);
      setViewDirectProductsOnly(false);
    }
  }, [categoryId, location.state]);

  useEffect(() => {
    fetchData();
    fetchAlertCount();

    const interval = setInterval(fetchAlertCount, 60000);
    return () => clearInterval(interval);
  }, [categoryId, viewDirectProductsOnly]);

  useEffect(() => {
    if (filters.category) {
      loadAllSubCategories(filters.category);
    } else {
      setSubCategories([]);
      setAllSubCategories([]);
      setFilters((prev) => ({ ...prev, subCategory: "" }));
    }
  }, [filters.category]);

  const loadAllSubCategories = async (parentCategoryId) => {
    try {
      const response = await categoryAPI.getSubCategories(parentCategoryId);
      const directSubCategories = response.data.data || [];
      setSubCategories(directSubCategories);

      const getAllNestedSubCategories = async (categoryId) => {
        try {
          const res = await categoryAPI.getSubCategories(categoryId);
          const subs = res.data.data || [];
          let allSubs = [...subs];

          for (const sub of subs) {
            const nestedSubs = await getAllNestedSubCategories(sub._id);
            allSubs = [...allSubs, ...nestedSubs];
          }

          return allSubs;
        } catch (error) {
          console.error(
            "Erreur lors du chargement des sous-catégories:",
            error,
          );
          return [];
        }
      };

      const allNestedSubCategories =
        await getAllNestedSubCategories(parentCategoryId);
      setAllSubCategories([...directSubCategories, ...allNestedSubCategories]);
    } catch (error) {
      console.error("Erreur lors du chargement des sous-catégories:", error);
      setSubCategories([]);
      setAllSubCategories([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const categoriesResponse = await categoryAPI.getAll();
      setCategories(categoriesResponse.data.data);

      let productsResponse;

      if (categoryId) {
        console.log("🎯 Chargement produits POUR LA CATÉGORIE:", categoryId);
        console.log(
          "🔍 Mode:",
          viewDirectProductsOnly
            ? "Produits DIRECTS seulement"
            : "Tous (avec sous-catégories)",
        );

        if (viewDirectProductsOnly) {
          try {
            productsResponse = await productAPI.getByCategory(categoryId);
            console.log(
              "✅ Produits DIRECTS de la catégorie (API):",
              productsResponse.data.data.length,
            );
          } catch (apiError) {
            console.log("⚠️ API getByCategory échouée, fallback...");

            const allProducts = await productAPI.getAll();
            const filteredProducts = allProducts.data.data.filter((product) => {
              const productCategoryId =
                product.categorie?._id || product.category?._id || product.categoryId;
              const isDirectProduct = productCategoryId === categoryId;

              return isDirectProduct;
            });

            productsResponse = { data: { data: filteredProducts } };
            console.log(
              "🎯 Produits DIRECTS filtrés:",
              filteredProducts.length,
            );
          }
        } else {
          const allProducts = await productAPI.getAll();
          const allProductsData = allProducts.data.data || [];

          const getAllChildCategoryIds = (parentId) => {
            let ids = [parentId];
            const children = categoriesResponse.data.data.filter(
              (cat) =>
                cat.parent?._id === parentId || cat.parentId === parentId,
            );

            children.forEach((child) => {
              ids = [...ids, ...getAllChildCategoryIds(child._id)];
            });

            return ids;
          };

          const allCategoryIds = getAllChildCategoryIds(categoryId);
          console.log("📂 Catégories incluses:", allCategoryIds);

          const filteredProducts = allProductsData.filter((product) => {
            const productCategoryId =
              product.categorie?._id || product.category?._id || product.categoryId;
            return allCategoryIds.includes(productCategoryId);
          });

          productsResponse = { data: { data: filteredProducts } };
          console.log(
            "🌳 Produits avec sous-catégories:",
            filteredProducts.length,
          );
        }
      } else {
        console.log("🌍 Chargement de tous les produits...");
        productsResponse = await productAPI.getAll();
        console.log(
          "📦 Tous les produits chargés:",
          productsResponse.data.data?.length || 0,
        );
      }

      const productsData = productsResponse.data.data || [];
      console.log("🏁 Produits finaux à afficher:", productsData.length);
      setProducts(productsData);
      setAllProducts(productsData);

      if (productsData.length === 0 && categoryId) {
        console.log("ℹ️ Aucun produit trouvé pour la catégorie", categoryId);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      showAlert("Erreur lors du chargement des données", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertCount = async () => {
    try {
      console.log("🔍 Tentative de récupération des alertes stock...");

      try {
        const [outOfStockRes, lowStockRes] = await Promise.all([
          productAPI.getOutOfStock(),
          productAPI.getLowStock(),
        ]);

        const outOfStockCount = outOfStockRes.data.data?.length || 0;
        const lowStockCount = lowStockRes.data.data?.length || 0;

        console.log("📊 Résultats API directe:", {
          outOfStockCount,
          lowStockCount,
        });

        setAlertCounts({
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
        });
      } catch (apiError) {
        console.log("⚠️ API spécifique échouée, méthode alternative...");

        const allProductsRes = await productAPI.getAll();
        const products = allProductsRes.data.data || [];

        const outOfStockProducts = products.filter((p) => {
          const stock = Number(p.stock);
          return isNaN(stock) || stock === 0;
        });

        const lowStockProducts = products.filter((p) => {
          const stock = Number(p.stock);
          return stock > 0 && stock < 5;
        });

        console.log("📊 Calcul local:", {
          outOfStock: outOfStockProducts.length,
          lowStock: lowStockProducts.length,
        });

        setAlertCounts({
          outOfStock: outOfStockProducts.length,
          lowStock: lowStockProducts.length,
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des alertes:", error.message);
      setAlertCounts({
        outOfStock: 0,
        lowStock: 0,
      });
    }
  };

  const alertCount = alertCounts.outOfStock + alertCounts.lowStock;

  const handleNavigateToAlerts = () => {
    navigate("/stock-alerts");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    // Gérer les différents noms de champs possibles
    const getValue = (obj, key) => {
      if (key === 'nom' || key === 'name') return obj.nom || obj.name || '';
      if (key === 'prix' || key === 'price') return obj.prix || obj.price || 0;
      if (key === 'stock') return obj.stock || 0;
      return obj[key] || 0;
    };

    const aValue = getValue(a, sortConfig.key);
    const bValue = getValue(b, sortConfig.key);

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const getAllChildCategoryIds = useMemo(() => {
    if (!categoryId || categories.length === 0) return [];

    const getChildrenIds = (parentId) => {
      let ids = [parentId];
      const children = categories.filter(
        (cat) => cat.parent?._id === parentId || cat.parentId === parentId,
      );

      children.forEach((child) => {
        ids = [...ids, ...getChildrenIds(child._id)];
      });

      return ids;
    };

    return getChildrenIds(categoryId);
  }, [categoryId, categories]);

  // Fonction sécurisée pour obtenir le nom du produit
  const getProductName = (product) => {
    return product?.nom || product?.name || '';
  };

  // Fonction sécurisée pour obtenir la description
  const getProductDescription = (product) => {
    return product?.description || '';
  };

  // Fonction sécurisée pour obtenir le modèle
  const getProductModel = (product) => {
    return product?.modele || product?.model || '';
  };

  // Fonction sécurisée pour obtenir le prix
  const getProductPrice = (product) => {
    return product?.prix || product?.price || 0;
  };

  // Fonction sécurisée pour obtenir le statut actif
  const isProductActive = (product) => {
    return product?.estActif ?? product?.isActive ?? true;
  };

  // Fonction sécurisée pour obtenir l'ID de catégorie
  const getProductCategoryId = (product) => {
    return product?.categorie?._id || product?.category?._id || product?.categoryId;
  };

  const filteredProducts = sortedProducts.filter((product) => {
    // Vérifier que product existe
    if (!product) return false;

    const productName = getProductName(product).toLowerCase();
    const productDescription = getProductDescription(product).toLowerCase();
    const productModel = getProductModel(product).toLowerCase();
    const searchLower = (filters.search || '').toLowerCase();

    const matchesSearch =
      !filters.search ||
      productName.includes(searchLower) ||
      productDescription.includes(searchLower) ||
      productModel.includes(searchLower);

    let matchesCategory = true;
    if (filters.category) {
      const productCategoryId = getProductCategoryId(product);
      
      if (categoryId && !viewDirectProductsOnly) {
        matchesCategory = getAllChildCategoryIds.includes(productCategoryId);
      } else if (categoryId && viewDirectProductsOnly) {
        matchesCategory = productCategoryId === categoryId;
      } else {
        matchesCategory = productCategoryId === filters.category;
      }
    }

    const matchesSubCategory =
      !filters.subCategory || 
      product.subCategory?._id === filters.subCategory ||
      product.sousCategorie?._id === filters.subCategory;

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && isProductActive(product)) ||
      (filters.status === "inactive" && !isProductActive(product));

    return (
      matchesSearch && matchesCategory && matchesSubCategory && matchesStatus
    );
  });

  const categoryStats = useMemo(() => {
    if (!categoryId) return null;

    const productsInCategory = allProducts.filter((product) => {
      const productCategoryId = getProductCategoryId(product);
      if (viewDirectProductsOnly) {
        return productCategoryId === categoryId;
      } else {
        return getAllChildCategoryIds.includes(productCategoryId);
      }
    });

    return {
      total: productsInCategory.length,
      active: productsInCategory.filter((p) => isProductActive(p)).length,
      outOfStock: productsInCategory.filter((p) => (p.stock || 0) === 0).length,
      lowStock: productsInCategory.filter((p) => {
        const stock = p.stock || 0;
        return stock > 0 && stock < 5;
      }).length,
      totalValue: productsInCategory.reduce(
        (sum, p) => sum + (getProductPrice(p)) * (p.stock || 0),
        0,
      ),
    };
  }, [categoryId, allProducts, getAllChildCategoryIds, viewDirectProductsOnly]);

  const handleSaveProduct = async (formData) => {
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        showAlert("Produit modifié avec succès", "success");
      } else {
        await productAPI.create(formData);
        showAlert("Produit créé avec succès", "success");
      }
      fetchData();
      fetchAlertCount();
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showAlert("Erreur lors de la sauvegarde", "danger");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await productAPI.delete(id);
        fetchData();
        fetchAlertCount();
        showAlert("Produit supprimé avec succès", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showAlert("Erreur lors de la suppression", "danger");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      showAlert("Aucun produit sélectionné", "warning");
      return;
    }

    if (window.confirm(`Supprimer ${selectedProducts.length} produit(s) ?`)) {
      try {
        for (const productId of selectedProducts) {
          await productAPI.delete(productId);
        }
        fetchData();
        fetchAlertCount();
        setSelectedProducts([]);
        showAlert(
          `${selectedProducts.length} produit(s) supprimé(s)`,
          "success",
        );
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showAlert("Erreur lors de la suppression", "danger");
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id));
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === "category") {
      const newFilters = { ...filters, [key]: value, subCategory: "" };
      setFilters(newFilters);

      if (value) {
        loadAllSubCategories(value);
        navigate(`/products/category/${value}`);
        setViewDirectProductsOnly(false);
      } else {
        setSubCategories([]);
        setAllSubCategories([]);
        navigate("/products");
      }
    } else if (key === "niveau") {
      setFilters((prev) => ({
        ...prev,
        niveau: value,
        category: "",
        subCategory: "",
      }));
      setSubCategories([]);
      setAllSubCategories([]);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      niveau: "",
      category: "",
      subCategory: "",
      status: "all",
    });
    setSubCategories([]);
    setAllSubCategories([]);
    setCurrentCategory(null);
    setViewDirectProductsOnly(false);
    navigate("/products");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "card" : "table");
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

  // Calculs sécurisés pour les statistiques
  const totalValue = products.reduce(
    (sum, p) => sum + (getProductPrice(p)) * (p.stock || 0),
    0,
  );

  const activeProductsCount = products.filter((p) => isProductActive(p)).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
  const lowStockCount = products.filter(
    (p) => (p.stock || 0) > 0 && (p.stock || 0) < 5,
  ).length;

  // Formatage de la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-light min-vh-100">
      <main className="p-4">
        {/* Header avec date */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="fw-bold text-primary mb-1"
              style={{ fontSize: "2.5rem" }}
            >
              <i className="bi bi-box-seam me-2"></i>
              Gestion des Produits
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
              {categoryId
                ? viewDirectProductsOnly
                  ? "Uniquement les produits directs de cette catégorie"
                  : "Tous les produits de cette catégorie et ses sous-catégories"
                : "Gérez votre catalogue de produits"}
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Date comme dans UsersPage */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <span className="badge bg-light text-dark p-3 shadow-sm rounded-3">
                <i className="bi bi-calendar me-2"></i>
                {formatDate(new Date())}
              </span>
            </div>

            {/* Boutons de changement de vue avec texte comme dans l'image */}
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

            {/* Icône de notification */}
            <div className="position-relative">
              <button
                className="btn btn-light position-relative"
                onClick={handleNavigateToAlerts}
                style={{
                  borderRadius: "8px",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #dee2e6",
                  backgroundColor: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                title="Voir les alertes stock"
              >
                <div className="position-relative">
                  <img
                    src="/notification.png"
                    alt="Alertes Stock"
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#dc3545"/>
                        </svg>
                      `;
                    }}
                  />
                </div>

                {alertCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {alertCount}
                    <span className="visually-hidden">Alertes stock</span>
                  </span>
                )}
              </button>
            </div>

            {/* Boutons d'action */}
            <div className="d-flex gap-2">
              {selectedProducts.length > 0 && (
                <button
                  className="btn btn-danger d-flex align-items-center"
                  onClick={handleDeleteSelected}
                >
                  <FaTrash className="me-2" />
                  Supprimer ({selectedProducts.length})
                </button>
              )}
              <button
                className="btn btn-primary d-flex align-items-center"
                onClick={handleAddNewProduct}
              >
                <FaPlus className="me-2" />
                Nouveau Produit
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques avec le même design que UsersPage */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <i className="bi bi-box-seam fs-2 text-primary"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Produits</h6>
                  <h2 className="fw-bold mb-0 text-primary">
                    {categoryStats?.total || products.length}
                  </h2>
                  <small className="text-muted">
                    {categoryStats
                      ? `${categoryStats.active} actifs • ${categoryStats.total - categoryStats.active} inactifs`
                      : `${activeProductsCount} actifs • ${products.length - activeProductsCount} inactifs`}
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <i className="bi bi-cash-stack fs-2 text-success"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Valeur du stock</h6>
                  <h2 className="fw-bold text-success mb-0">
                    {totalValue.toFixed(2)}€
                  </h2>
                  <small className="text-muted">
                    {products.length > 0
                      ? (totalValue / products.length).toFixed(2)
                      : 0}
                    €/produit
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <i className="bi bi-exclamation-triangle fs-2 text-warning"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Alertes Stock</h6>
                  <h2 className="fw-bold text-warning mb-0">{alertCount}</h2>
                  <small className="text-muted">
                    {outOfStockCount} rupture • {lowStockCount} faible
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <i className="bi bi-check-circle fs-2 text-info"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Produits Actifs</h6>
                  <h2 className="fw-bold text-info mb-0">
                    {activeProductsCount}
                  </h2>
                  <small className="text-muted">
                    {products.length > 0
                      ? ((activeProductsCount / products.length) * 100).toFixed(
                          1,
                        )
                      : 0}
                    % actifs
                  </small>
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
                    placeholder="Rechercher produit..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filters.niveau}
                  onChange={(e) => handleFilterChange("niveau", e.target.value)}
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
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">Toutes les catégories</option>
                  {categories
                    .filter(
                      (category) =>
                        !filters.niveau ||
                        category.level === parseInt(filters.niveau),
                    )
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
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

            <div className="row g-3 mt-3">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs seulement</option>
                  <option value="inactive">Inactifs seulement</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* En-tête de la liste */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="mb-0 text-dark">
              {categoryId ? (
                <div className="d-flex align-items-center">
                  <FaLayerGroup className="me-2 text-primary" />
                  <span>
                    {viewDirectProductsOnly
                      ? "Produits de la catégorie"
                      : "Produits de la catégorie et sous-catégories"}
                    {!viewDirectProductsOnly && allSubCategories.length > 0 && (
                      <span className="badge bg-info ms-2">
                        {allSubCategories.length} sous-catégorie(s)
                      </span>
                    )}
                    {viewDirectProductsOnly && (
                      <span className="badge bg-primary ms-2">
                        Produits directs
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                "Liste des Produits"
              )}
            </h6>
            <small className="text-muted">
              {filteredProducts.length} produit(s) trouvé(s)
              {categoryId &&
                ` (${viewDirectProductsOnly ? "catégorie parent seulement" : "catégorie parent et sous-catégories"})`}
            </small>
          </div>

          <div>
            <small className="text-muted me-3">
              {selectedProducts.length} sélectionné(s)
            </small>
          </div>
        </div>

        {/* Liste des produits */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">
              {categoryId
                ? viewDirectProductsOnly
                  ? "Chargement des produits directs de la catégorie..."
                  : "Chargement des produits de la catégorie et sous-catégories..."
                : "Chargement des produits..."}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <FaLayerGroup className="text-muted mb-3" size={48} />
            <h5 className="text-muted">
              {categoryId
                ? viewDirectProductsOnly
                  ? "Aucun produit direct dans cette catégorie"
                  : "Aucun produit dans cette catégorie et ses sous-catégories"
                : "Aucun produit trouvé"}
            </h5>
            <p className="text-muted">
              {categoryId
                ? viewDirectProductsOnly
                  ? "Commencez par ajouter un produit à cette catégorie"
                  : "Commencez par ajouter un produit à cette catégorie ou ses sous-catégories"
                : "Commencez par créer votre premier produit"}
            </p>
            <button className="btn btn-primary" onClick={handleAddNewProduct}>
              <FaPlus className="me-2" />
              {categoryId ? "Ajouter un produit" : "Créer un produit"}
            </button>
            {categoryId && (
              <button
                className="btn btn-outline-secondary ms-2"
                onClick={() => navigate("/products")}
              >
                Voir tous les produits
              </button>
            )}
          </div>
        ) : viewMode === "table" ? (
          <ProductList
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            loading={loading}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card h-100 border-0 shadow-sm hover-shadow transition rounded-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </div>
                      <div>
                        <span
                          className={`badge ${isProductActive(product) ? "bg-success" : "bg-secondary"} rounded-pill px-3 py-2`}
                        >
                          {isProductActive(product) ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </div>

                    <h5 className="card-title fw-bold mb-2">{getProductName(product)}</h5>
                    <p className="card-text text-muted small mb-3">
                      {getProductDescription(product) || "Aucune description"}
                    </p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Prix</span>
                        <span className="fw-bold text-success">
                          {getProductPrice(product)}€
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Stock</span>
                        <span
                          className={`fw-bold ${
                            (product.stock || 0) === 0
                              ? "text-danger"
                              : (product.stock || 0) < 5
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {product.stock || 0} unités
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill"
                        onClick={() => handleEditProduct(product)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <FaTrash size={14} />
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
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingProduct ? "Modifier le Produit" : "Nouveau Produit"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <ProductForm
                    editingProduct={editingProduct}
                    onSave={handleSaveProduct}
                    onCancel={handleCloseModal}
                    categories={categories}
                    initialCategoryId={categoryId}
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