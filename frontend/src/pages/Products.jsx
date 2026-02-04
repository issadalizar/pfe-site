// src/pages/Products.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import { productAPI, categoryAPI } from "../services/api";
import { FaPlus, FaSearch, FaFilter, FaTrash, FaBook, FaArrowLeft, FaLayerGroup, FaEye } from "react-icons/fa";

export default function Products() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Stocker tous les produits
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]); // Toutes les sous-catégories de la catégorie parent
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [viewDirectProductsOnly, setViewDirectProductsOnly] = useState(false);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: "",
    category: categoryId || "",
    subCategory: "", // Ajout du filtre par sous-catégorie
    status: "all",
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [alertCounts, setAlertCounts] = useState({
    outOfStock: 0,
    lowStock: 0
  });

  // Effet pour gérer la catégorie depuis l'URL
  useEffect(() => {
    // Si un categoryId est passé dans l'URL, l'utiliser comme filtre
    if (categoryId) {
      console.log("CategoryId depuis URL:", categoryId);
      
      // Lire l'état du location pour savoir si on veut seulement les produits directs
      const fromCategoryList = location.state?.viewDirectProductsOnly || false;
      setViewDirectProductsOnly(fromCategoryList);
      console.log("🔍 Mode vue:", fromCategoryList ? "Produits directs seulement" : "Tous les produits (avec sous-catégories)");
      
      // Mettre à jour le filtre catégorie avec l'ID de l'URL
      setFilters(prev => ({
        ...prev,
        category: categoryId
      }));
      
      // Récupérer les informations de la catégorie
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
      // Si pas de categoryId, réinitialiser le filtre
      setFilters(prev => ({
        ...prev,
        category: ""
      }));
      setCurrentCategory(null);
      setViewDirectProductsOnly(false);
    }
  }, [categoryId, location.state]);

  useEffect(() => {
    fetchData();
    fetchAlertCount();
    
    // Rafraîchir les alertes toutes les minutes
    const interval = setInterval(fetchAlertCount, 60000);
    return () => clearInterval(interval);
  }, [categoryId, viewDirectProductsOnly]);

  // Charger les sous-catégories quand une catégorie est sélectionnée
  useEffect(() => {
    if (filters.category) {
      loadAllSubCategories(filters.category);
    } else {
      setSubCategories([]);
      setAllSubCategories([]);
      setFilters(prev => ({ ...prev, subCategory: "" }));
    }
  }, [filters.category]);

  // NOUVELLE FONCTION : Charger toutes les sous-catégories (récursivement)
  const loadAllSubCategories = async (parentCategoryId) => {
    try {
      const response = await categoryAPI.getSubCategories(parentCategoryId);
      const directSubCategories = response.data.data || [];
      setSubCategories(directSubCategories);
      
      // Fonction récursive pour obtenir toutes les sous-catégories
      const getAllNestedSubCategories = async (categoryId) => {
        try {
          const res = await categoryAPI.getSubCategories(categoryId);
          const subs = res.data.data || [];
          let allSubs = [...subs];
          
          // Récursivement obtenir les sous-catégories de chaque sous-catégorie
          for (const sub of subs) {
            const nestedSubs = await getAllNestedSubCategories(sub._id);
            allSubs = [...allSubs, ...nestedSubs];
          }
          
          return allSubs;
        } catch (error) {
          console.error("Erreur lors du chargement des sous-catégories:", error);
          return [];
        }
      };
      
      const allNestedSubCategories = await getAllNestedSubCategories(parentCategoryId);
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
      
      // Load categories
      const categoriesResponse = await categoryAPI.getAll();
      setCategories(categoriesResponse.data.data);
      
      // Load products - PRIORITÉ À LA CATÉGORIE DE L'URL
      let productsResponse;
      
      if (categoryId) {
        console.log("🎯 Chargement produits POUR LA CATÉGORIE:", categoryId);
        console.log("🔍 Mode:", viewDirectProductsOnly ? "Produits DIRECTS seulement" : "Tous (avec sous-catégories)");
        
        if (viewDirectProductsOnly) {
          // MODE 1: Uniquement les produits DIRECTS de cette catégorie
          try {
            // Essayer l'API spécifique d'abord
            productsResponse = await productAPI.getByCategory(categoryId);
            console.log("✅ Produits DIRECTS de la catégorie (API):", productsResponse.data.data.length);
          } catch (apiError) {
            console.log("⚠️ API getByCategory échouée, fallback...");
            
            // Fallback: récupérer tous et filtrer côté client
            const allProducts = await productAPI.getAll();
            // Filtrer uniquement les produits DIRECTS de cette catégorie
            const filteredProducts = allProducts.data.data.filter(product => {
              const productCategoryId = product.category?._id || product.categoryId;
              const isDirectProduct = productCategoryId === categoryId;
              
              console.log(`  Produit "${product.name}": catégorie=${productCategoryId}, direct=${isDirectProduct}`);
              return isDirectProduct;
            });
            
            productsResponse = { data: { data: filteredProducts } };
            console.log("🎯 Produits DIRECTS filtrés:", filteredProducts.length);
          }
        } else {
          // MODE 2: Produits de la catégorie ET de ses sous-catégories (comportement actuel)
          // D'abord charger tous les produits
          const allProducts = await productAPI.getAll();
          const allProductsData = allProducts.data.data || [];
          
          // Obtenir tous les IDs de catégories enfants
          const getAllChildCategoryIds = (parentId) => {
            let ids = [parentId];
            const children = categoriesResponse.data.data.filter(cat => 
              cat.parent?._id === parentId || cat.parentId === parentId
            );
            
            children.forEach(child => {
              ids = [...ids, ...getAllChildCategoryIds(child._id)];
            });
            
            return ids;
          };
          
          const allCategoryIds = getAllChildCategoryIds(categoryId);
          console.log("📂 Catégories incluses:", allCategoryIds);
          
          // Filtrer les produits qui appartiennent à l'une de ces catégories
          const filteredProducts = allProductsData.filter(product => {
            const productCategoryId = product.category?._id || product.categoryId;
            return allCategoryIds.includes(productCategoryId);
          });
          
          productsResponse = { data: { data: filteredProducts } };
          console.log("🌳 Produits avec sous-catégories:", filteredProducts.length);
        }
      } else {
        console.log("🌍 Chargement de tous les produits...");
        productsResponse = await productAPI.getAll();
        console.log("📦 Tous les produits chargés:", productsResponse.data.data?.length || 0);
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
          productAPI.getLowStock()
        ]);
        
        const outOfStockCount = outOfStockRes.data.data?.length || 0;
        const lowStockCount = lowStockRes.data.data?.length || 0;
        
        console.log("📊 Résultats API directe:", { outOfStockCount, lowStockCount });
        
        setAlertCounts({
          outOfStock: outOfStockCount,
          lowStock: lowStockCount
        });
        
      } catch (apiError) {
        console.log("⚠️ API spécifique échouée, méthode alternative...");
        
        const allProductsRes = await productAPI.getAll();
        const products = allProductsRes.data.data || [];
        
        const outOfStockProducts = products.filter(p => {
          const stock = Number(p.stock);
          return isNaN(stock) || stock === 0;
        });
        
        const lowStockProducts = products.filter(p => {
          const stock = Number(p.stock);
          return stock > 0 && stock < 5;
        });
        
        console.log("📊 Calcul local:", {
          outOfStock: outOfStockProducts.length,
          lowStock: lowStockProducts.length
        });
        
        setAlertCounts({
          outOfStock: outOfStockProducts.length,
          lowStock: lowStockProducts.length
        });
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du chargement des alertes:", error.message);
      setAlertCounts({
        outOfStock: 0,
        lowStock: 0
      });
    }
  };

  // Calcul du total des alertes
  const alertCount = alertCounts.outOfStock + alertCounts.lowStock;

  const handleNavigateToAlerts = () => {
    navigate('/stock-alerts'); 
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortConfig.key] || 0;
    const bValue = b[sortConfig.key] || 0;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // NOUVEAU : Fonction pour obtenir tous les IDs de catégories enfants
  const getAllChildCategoryIds = useMemo(() => {
    if (!categoryId || categories.length === 0) return [];
    
    const getChildrenIds = (parentId) => {
      let ids = [parentId];
      const children = categories.filter(cat => cat.parent?._id === parentId || cat.parentId === parentId);
      
      children.forEach(child => {
        ids = [...ids, ...getChildrenIds(child._id)];
      });
      
      return ids;
    };
    
    return getChildrenIds(categoryId);
  }, [categoryId, categories]);

  const filteredProducts = sortedProducts.filter(product => {
    // Search filter
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.model?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Category filter - MODIFIÉ pour inclure les sous-catégories
    let matchesCategory = true;
    if (filters.category) {
      if (categoryId && !viewDirectProductsOnly) {
        // Si on a une catégorie parent et qu'on veut inclure les sous-catégories
        const productCategoryId = product.category?._id || product.categoryId;
        matchesCategory = getAllChildCategoryIds.includes(productCategoryId);
      } else if (categoryId && viewDirectProductsOnly) {
        // Mode direct: seulement la catégorie exacte
        const productCategoryId = product.category?._id || product.categoryId;
        matchesCategory = productCategoryId === categoryId;
      } else {
        // Filtre normal sans catégorie spécifique dans l'URL
        matchesCategory = product.category?._id === filters.category;
      }
    }
    
    // Sub-category filter
    const matchesSubCategory = !filters.subCategory || 
      product.subCategory?._id === filters.subCategory;
    
    // Status filter
    const matchesStatus = filters.status === "all" || 
      (filters.status === "active" && product.isActive) ||
      (filters.status === "inactive" && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesSubCategory && matchesStatus;
  });

  // NOUVEAU : Calcul des statistiques pour les produits filtrés
  const categoryStats = useMemo(() => {
    if (!categoryId) return null;
    
    const productsInCategory = allProducts.filter(product => {
      const productCategoryId = product.category?._id || product.categoryId;
      if (viewDirectProductsOnly) {
        return productCategoryId === categoryId;
      } else {
        return getAllChildCategoryIds.includes(productCategoryId);
      }
    });
    
    return {
      total: productsInCategory.length,
      active: productsInCategory.filter(p => p.isActive).length,
      outOfStock: productsInCategory.filter(p => p.stock === 0).length,
      lowStock: productsInCategory.filter(p => p.stock > 0 && p.stock < 5).length,
      totalValue: productsInCategory.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0)
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
        showAlert(`${selectedProducts.length} produit(s) supprimé(s)`, "success");
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
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      const newFilters = { ...filters, [key]: value, subCategory: "" };
      setFilters(newFilters);
      
      if (value) {
        loadAllSubCategories(value);
        navigate(`/products/category/${value}`);
        setViewDirectProductsOnly(false); // Réinitialiser le mode quand on change de catégorie via le filtre
      } else {
        setSubCategories([]);
        setAllSubCategories([]);
        navigate('/products');
      }
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "",
      subCategory: "",
      status: "all",
    });
    setSubCategories([]);
    setAllSubCategories([]);
    setCurrentCategory(null);
    setViewDirectProductsOnly(false);
    navigate('/products');
  };

  const toggleViewMode = () => {
    setViewDirectProductsOnly(!viewDirectProductsOnly);
    // Recharger les données avec le nouveau mode
    fetchData();
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

  const totalValue = products.reduce((sum, p) => 
    sum + (p.price || 0) * (p.stock || 0), 0
  );

  const activeProductsCount = products.filter(p => p.isActive).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length;

  return (
    <div>
      {/* Header avec icône de notification */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2 text-dark">
            {categoryId ? (
              <>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary btn-sm me-3"
                    onClick={() => {
                      navigate('/products');
                      handleResetFilters();
                    }}
                    title="Retour à tous les produits"
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <div className="d-flex align-items-center">
                      <FaLayerGroup className="text-primary me-2" />
                      <span>
                        {viewDirectProductsOnly ? "Produits de la catégorie" : "Produits de la catégorie et sous-catégories"}
                        <span className="text-primary ms-2">
                          {currentCategory?.name || categories.find(c => c._id === categoryId)?.name || ""}
                        </span>
                      </span>
                    </div>
                    {viewDirectProductsOnly && (
                      <div className="mt-1">
                        <small className="text-info">
                          <FaEye className="me-1" size={12} />
                          Mode: Produits directs seulement
                        </small>
                      </div>
                    )}
                    {!viewDirectProductsOnly && allSubCategories.length > 0 && (
                      <div className="mt-1">
                        <small className="text-muted">
                          <FaLayerGroup className="me-1" size={12} />
                          Inclut {allSubCategories.length} sous-catégorie(s) et leurs produits
                        </small>
                      </div>
                    )}
                    {/* Description de la catégorie masquée conformément à la demande */}
                  </div>
                </div>
              </>
            ) : (
              "Gestion des Produits"
            )}
          </h1>
          <p className="text-muted mb-0">
            {categoryId 
              ? viewDirectProductsOnly 
                ? "Uniquement les produits directs de cette catégorie" 
                : "Tous les produits de cette catégorie et ses sous-catégories"
              : "Gérez votre catalogue de produits"
            }
          </p>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {/* Bouton toggle pour basculer entre les modes (seulement en mode catégorie) */}
          {/* Bouton "Inclure sous-catégories" supprimé (gestion via la navigation) */}
          
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
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              title="Voir les alertes stock"
            >
              <div className="position-relative">
                <img 
                  src="/notification.png" 
                  alt="Alertes Stock" 
                  style={{ 
                    width: '24px', 
                    height: '24px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
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

      {/* Statistiques - MODIFIÉ pour afficher les stats de la catégorie */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-start-primary border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Total Produits
                  </div>
                  <div className="fw-bold text-primary fs-3">
                    {categoryStats?.total || products.length}
                  </div>
                </div>
                <div className="text-primary opacity-25">
                  <FaPlus size={24} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {categoryStats 
                    ? `${categoryStats.active} actifs • ${categoryStats.total - categoryStats.active} inactifs`
                    : `${activeProductsCount} actifs • ${products.length - activeProductsCount} inactifs`
                  }
                </small>
                {categoryId && !viewDirectProductsOnly && allSubCategories.length > 0 && (
                  <div className="mt-1">
                    <small className="text-success">
                      <FaLayerGroup className="me-1" size={10} />
                      Inclut {allSubCategories.length} sous-catégories
                    </small>
                  </div>
                )}
                {categoryId && viewDirectProductsOnly && (
                  <div className="mt-1">
                    <small className="text-info">
                      <FaEye className="me-1" size={10} />
                      Produits directs seulement
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card border-start-success border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Valeur du stock
                  </div>
                  <div className="fw-bold text-success fs-3">
                    {(categoryStats?.totalValue || totalValue).toFixed(2)}€
                  </div>
                </div>
                <div className="text-success opacity-25">
                  <FaFilter size={24} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {categoryStats?.total 
                    ? `${((categoryStats.totalValue || 0) / categoryStats.total).toFixed(2)}€/produit`
                    : `${products.length > 0 ? ((totalValue / products.length) || 0).toFixed(2) : '0'}€/produit`
                  }
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card border-start-warning border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Alertes Stock
                  </div>
                  <div className="fw-bold text-warning fs-3">
                    {categoryStats 
                      ? categoryStats.outOfStock + categoryStats.lowStock
                      : alertCount
                    }
                  </div>
                </div>
                <div className="position-relative">
                  <img 
                    src="/notification.png" 
                    alt="Alertes" 
                    style={{ 
                      width: '24px', 
                      height: '24px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#ffc107"/>
                        </svg>
                      `;
                    }}
                  />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {categoryStats
                    ? `${categoryStats.outOfStock} rupture • ${categoryStats.lowStock} faible`
                    : `${alertCounts.outOfStock} rupture • ${alertCounts.lowStock} faible`
                  }
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card border-start-info border-start-3 border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold">
                    Produits actifs
                  </div>
                  <div className="fw-bold text-info fs-3">
                    {categoryStats?.active || activeProductsCount}
                  </div>
                </div>
                <div className="text-info opacity-25">
                  <FaPlus size={24} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {categoryStats?.total 
                    ? `${((categoryStats.active / categoryStats.total) * 100).toFixed(1)}% actifs`
                    : `${products.length > 0 ? ((activeProductsCount / products.length) * 100).toFixed(1) : '0'}% actifs`
                  }
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="card shadow-sm mb-4 border">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher produit..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sélecteur de sous-catégories */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.subCategory}
                onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                disabled={!filters.category}
              >
                <option value="">Toutes les sous-catégories</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory._id} value={subCategory._id}>
                    {subCategory.icon} {subCategory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                onClick={handleResetFilters}
              >
                <FaFilter className="me-2" />
                Réinitialiser
              </button>
            </div>
          </div>
          
          <div className="row g-3 mt-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs seulement</option>
                <option value="inactive">Inactifs seulement</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="card shadow-sm border">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-0 text-dark">
                {categoryId ? (
                  <div className="d-flex align-items-center">
                    <FaLayerGroup className="me-2 text-primary" />
                    <span>
                      {viewDirectProductsOnly 
                        ? "Produits de la catégorie" 
                        : "Produits de la catégorie et sous-catégories"
                      }
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
                {categoryId && ` (${viewDirectProductsOnly ? 'catégorie parent seulement' : 'catégorie parent et sous-catégories'})`}
              </small>
            </div>
            
            <div>
              <small className="text-muted me-3">
                {selectedProducts.length} sélectionné(s)
              </small>
            </div>
          </div>
          
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
                  : "Chargement des produits..."
                }
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
                  : "Aucun produit trouvé"
                }
              </h5>
              <p className="text-muted">
                {categoryId 
                  ? viewDirectProductsOnly
                    ? "Commencez par ajouter un produit à cette catégorie"
                    : "Commencez par ajouter un produit à cette catégorie ou ses sous-catégories"
                  : "Commencez par créer votre premier produit"
                }
              </p>
              <button
                className="btn btn-primary"
                onClick={handleAddNewProduct}
              >
                <FaPlus className="me-2" />
                {categoryId ? "Ajouter un produit" : "Créer un produit"}
              </button>
              {categoryId && (
                <button
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => navigate('/products')}
                >
                  Voir tous les produits
                </button>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
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
    </div>
  );
}