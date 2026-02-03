// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import { productAPI, categoryAPI } from "../services/api";
import { FaPlus, FaSearch, FaFilter, FaTrash } from "react-icons/fa";

export default function Products() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: "",
    category: categoryId || "",
    status: "all",
    minPrice: "",
    maxPrice: "",
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

  useEffect(() => {
    fetchData();
    fetchAlertCount();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await categoryAPI.getAll();
      setCategories(categoriesResponse.data.data);
      
      // Load products
      let productsResponse;
      if (categoryId) {
        productsResponse = await productAPI.getByCategory(categoryId);
      } else {
        productsResponse = await productAPI.getAll();
      }
      setProducts(productsResponse.data.data);
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
      
      const response = await productAPI.getStockStats();
      console.log("📊 Réponse API:", response.data);
      
      if (response.data && response.data.data) {
        const { outOfStockCount, lowStockCount } = response.data.data;
        setAlertCounts({
          outOfStock: outOfStockCount || 0,
          lowStock: lowStockCount || 0
        });
      }
    } catch (error) {
      console.error("⚠️ API échouée, utilisation des valeurs par défaut:", error.message);
      
      // Valeurs par défaut quand l'API échoue
      setAlertCounts({
        outOfStock: 0,
        lowStock: 0
      });
      
      // Optionnel: Afficher un message à l'utilisateur
      // alert("Les alertes stock sont temporairement indisponibles");
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

  const filteredProducts = sortedProducts.filter(product => {
    // Search filter
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.model?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Category filter
    const matchesCategory = !filters.category || 
      product.category?._id === filters.category;
    
    // Status filter
    const matchesStatus = filters.status === "all" || 
      (filters.status === "active" && product.isActive) ||
      (filters.status === "inactive" && !product.isActive);
    
    // Price filters
    const price = product.price || 0;
    const matchesMinPrice = !filters.minPrice || price >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || price <= parseFloat(filters.maxPrice);
    
    return matchesSearch && matchesCategory && matchesStatus && 
           matchesMinPrice && matchesMaxPrice;
  });

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
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL if category filter changes
    if (key === 'category' && value) {
      navigate(`/products/category/${value}`);
    } else if (key === 'category' && !value) {
      navigate('/products');
    }
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
          <h1 className="h3 mb-2 text-dark">Gestion des Produits</h1>
          <p className="text-muted mb-0">
            Gérez votre catalogue de produits
          </p>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {/* Icône de notification - Version corrigée */}
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
              {/* Icône de notification - plusieurs options */}
              <div className="position-relative">
                {/* Option 1: Image PNG */}
                <img 
                  src="/notification.png" 
                  alt="Alertes Stock" 
                  style={{ 
                    width: '24px', 
                    height: '24px'
                  }}
                  onError={(e) => {
                    // Si l'image n'est pas trouvée, utiliser une icône SVG
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

      {/* Statistiques */}
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
                    {products.length}
                  </div>
                </div>
                <div className="text-primary opacity-25">
                  <FaPlus size={24} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {activeProductsCount} actifs • {products.length - activeProductsCount} inactifs
                </small>
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
                    {totalValue.toFixed(2)}€
                  </div>
                </div>
                <div className="text-success opacity-25">
                  <FaFilter size={24} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {products.length > 0 ? ((totalValue / products.length) || 0).toFixed(2) : '0'}€/produit
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
                    {alertCount}
                  </div>
                </div>
                <div className="position-relative">
                  {/* Icône dans la carte stats */}
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
                  {alertCounts.outOfStock} rupture • {alertCounts.lowStock} faible
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
                    {activeProductsCount}
                  </div>
                </div>
                <div className="text-info opacity-25">
                  <FaPlus size={24} />
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {products.length > 0 ? ((activeProductsCount / products.length) * 100).toFixed(1) : '0'}% actifs
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
            
            <div className="col-md-3">
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
            
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                onClick={() => setFilters({
                  search: "",
                  category: "",
                  status: "all",
                  minPrice: "",
                  maxPrice: "",
                })}
              >
                <FaFilter className="me-2" />
                Réinitialiser
              </button>
            </div>
          </div>
          
          {/* Filtres avancés - Prix */}
          <div className="row g-3 mt-3">
            <div className="col-md-3">
              <label className="form-label small text-muted mb-1">
                Prix minimum
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
                <span className="input-group-text">€</span>
              </div>
            </div>
            
            <div className="col-md-3">
              <label className="form-label small text-muted mb-1">
                Prix maximum
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
                <span className="input-group-text">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="card shadow-sm border">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-0 text-dark">Liste des Produits</h6>
              <small className="text-muted">
                {filteredProducts.length} produit(s) trouvé(s)
              </small>
            </div>
            
            <div>
              <small className="text-muted me-3">
                {selectedProducts.length} sélectionné(s)
              </small>
            </div>
          </div>
          
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
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}