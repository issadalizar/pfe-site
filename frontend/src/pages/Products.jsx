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

  useEffect(() => {
    fetchData();
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

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2 text-dark">Gestion des Produits</h1>
          <p className="text-muted mb-0">
            Gérez votre catalogue de produits
          </p>
        </div>
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

      {/* Filter Bar */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher..."
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
                className="btn btn-outline-secondary w-100"
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
          
          {/* Advanced filters */}
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
                />
                <span className="input-group-text">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-primary">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Total Produits</h6>
              <h2 className="card-title text-primary">{products.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Produits actifs</h6>
              <h2 className="card-title text-success">
                {products.filter(p => p.isActive).length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-info">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Valeur du stock</h6>
              <h2 className="card-title text-info">
                {totalValue.toFixed(2)}€
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">En vedette</h6>
              <h2 className="card-title text-warning">
                {products.filter(p => p.isFeatured).length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="text-muted">
                {filteredProducts.length} produit(s) trouvé(s)
              </span>
            </div>
            <div>
              <span className="text-muted me-3">
                {selectedProducts.length} sélectionné(s)
              </span>
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