// src/components/BI/CategorySalesEvolution.jsx
import React, { useState, useEffect } from 'react';
import {
  FaChartBar,
  FaFilter,
  FaCalendarAlt,
  FaTrophy,
  FaMedal,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaEyeSlash,
  FaShoppingBag
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const COLORS = [
  '#4361ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export default function CategorySalesEvolution() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const months = [
    { value: 'all', label: '📅 Année complète' },
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer les commandes
      const ordersRes = await fetch(`${API_URL}/orders?limit=5000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      
      // Récupérer les catégories
      const categoriesRes = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const categoriesData = await categoriesRes.json();
      
      if (ordersData.success && categoriesData.success) {
        const paidOrders = ordersData.orders.filter(o => o.paymentStatus === 'paid');
        const allCategories = categoriesData.categories.filter(c => !c.parent); // Catégories racines seulement
        
        // Extraire les années disponibles
        const years = [...new Set(paidOrders.map(o => new Date(o.createdAt).getFullYear()))].sort();
        setAvailableYears(years);
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[years.length - 1]);
        }
        
        // Traiter les données par catégorie
        processCategoryData(paidOrders, allCategories, selectedYear, selectedMonth);
        
        // Calculer les totaux par catégorie pour le tableau
        const categoryTotals = calculateCategoryTotals(paidOrders, allCategories);
        setCategories(categoryTotals);
        
        // Sélectionner automatiquement toutes les catégories (max 10 pour lisibilité)
        const allCategoryIds = categoryTotals.slice(0, 10).map(c => c.categoryId);
        setSelectedCategories(allCategoryIds);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryTotals = (orders, allCategories) => {
    const categoryMap = new Map();
    
    allCategories.forEach(cat => {
      categoryMap.set(cat._id, {
        categoryId: cat._id,
        categoryName: cat.name,
        totalRevenue: 0,
        totalOrders: 0,
        color: COLORS[categoryMap.size % COLORS.length]
      });
    });
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const categoryId = item.categoryId || item.categorie?._id;
        if (categoryId && categoryMap.has(categoryId)) {
          const catData = categoryMap.get(categoryId);
          catData.totalRevenue += item.price * item.quantity;
          catData.totalOrders += item.quantity;
          categoryMap.set(categoryId, catData);
        }
      });
    });
    
    return Array.from(categoryMap.values())
      .filter(c => c.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const processCategoryData = (orders, allCategories, year, month) => {
    const categoryRevenue = new Map();
    
    // Initialiser toutes les catégories sélectionnées
    selectedCategories.forEach(catId => {
      const category = allCategories.find(c => c._id === catId);
      if (category) {
        categoryRevenue.set(catId, {
          name: category.name,
          revenue: 0,
          color: COLORS[Array.from(categoryRevenue.keys()).length % COLORS.length]
        });
      }
    });
    
    // Si aucune catégorie sélectionnée, utiliser toutes les catégories
    if (categoryRevenue.size === 0) {
      allCategories.forEach(cat => {
        categoryRevenue.set(cat._id, {
          name: cat.name,
          revenue: 0,
          color: COLORS[Array.from(categoryRevenue.keys()).length % COLORS.length]
        });
      });
    }
    
    // Agréger les revenus par catégorie
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth() + 1;
      
      if (orderYear === year && (month === 'all' || parseInt(month) === orderMonth)) {
        order.items?.forEach(item => {
          const categoryId = item.categoryId || item.categorie?._id;
          if (categoryId && categoryRevenue.has(categoryId)) {
            const catData = categoryRevenue.get(categoryId);
            catData.revenue += item.price * item.quantity;
            categoryRevenue.set(categoryId, catData);
          }
        });
      }
    });
    
    // Convertir en tableau pour le graphique et filtrer les catégories avec revenu > 0
    let chartDataArray = Array.from(categoryRevenue.values())
      .filter(item => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
    
    // Limiter à 10 catégories pour lisibilité
    if (chartDataArray.length > 10) {
      const top10 = chartDataArray.slice(0, 10);
      const otherRevenue = chartDataArray.slice(10).reduce((sum, item) => sum + item.revenue, 0);
      if (otherRevenue > 0) {
        top10.push({ name: 'Autres', revenue: otherRevenue, color: '#9ca3af' });
      }
      chartDataArray = top10;
    }
    
    setChartData(chartDataArray);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const updateData = async () => {
        const token = localStorage.getItem('token');
        const ordersRes = await fetch(`${API_URL}/orders?limit=5000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        const categoriesRes = await fetch(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const categoriesData = await categoriesRes.json();
        
        if (ordersData.success && categoriesData.success) {
          const paidOrders = ordersData.orders.filter(o => o.paymentStatus === 'paid');
          const allCategories = categoriesData.categories.filter(c => !c.parent);
          processCategoryData(paidOrders, allCategories, selectedYear, selectedMonth);
        }
      };
      updateData();
    }
  }, [selectedYear, selectedMonth, selectedCategories]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const selectAllCategories = () => {
    const allIds = categories.slice(0, 10).map(c => c.categoryId);
    setSelectedCategories(allIds);
  };

  const clearSelection = () => {
    setSelectedCategories([]);
  };

  // Calculer le total
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const percentage = (payload[0].value / totalRevenue) * 100;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border" style={{ minWidth: '200px' }}>
          <p className="fw-bold mb-2" style={{ color: payload[0].color }}>{label}</p>
          <p className="mb-1">💰 CA: <strong>{formatPrice(payload[0].value)} DT</strong></p>
          <p className="mb-0 text-muted">📊 Part: {percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body text-center py-5">
          <FaSpinner className="fa-spin text-primary" size={32} />
          <p className="text-muted mt-3">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 mt-4">
      {/* Header */}
      <div 
        className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="d-flex align-items-center gap-2">
          <FaChartBar size={20} style={{ color: '#f59e0b' }} />
          <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
            Évolution des Ventes par Catégorie
          </h5>
          <span className="badge bg-warning rounded-pill">Bar Chart</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <small className="text-muted">
            {selectedYear} - {selectedMonth === 'all' ? 'Année complète' : months.find(m => m.value === selectedMonth)?.label}
          </small>
          {expanded ? <FaChevronUp className="text-muted" /> : <FaChevronDown className="text-muted" />}
        </div>
      </div>

      {expanded && (
        <div className="card-body">
          {/* Filtres */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold small">
                <FaCalendarAlt className="me-1" /> Année
              </label>
              <select 
                className="form-select form-select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small">
                <FaFilter className="me-1" /> Période
              </label>
              <select 
                className="form-select form-select-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">
                <FaEye className="me-1" /> Actions
              </label>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={selectAllCategories}>
                  Toutes les catégories
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={clearSelection}>
                  Effacer la sélection
                </button>
                <button 
                  className="btn btn-sm btn-outline-info"
                  onClick={() => setShowCategorySelector(!showCategorySelector)}
                >
                  {showCategorySelector ? 'Masquer' : 'Choisir catégories'}
                </button>
              </div>
            </div>
          </div>

          {/* Sélecteur de catégories */}
          {showCategorySelector && (
            <div className="mb-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="small">📋 Sélectionnez les catégories à afficher :</strong>
                <small className="text-muted">{selectedCategories.length} sélectionnée(s)</small>
              </div>
              <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {categories.map(category => (
                  <button
                    key={category.categoryId}
                    className={`btn btn-sm rounded-pill ${selectedCategories.includes(category.categoryId) ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => toggleCategory(category.categoryId)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {category.categoryName}
                    <span className="ms-1 text-muted">
                      ({formatPrice(category.totalRevenue)} DT)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Carte récapitulative */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="bg-light rounded p-3 text-center">
                <small className="text-muted d-block">💰 CA Total</small>
                <h4 className="fw-bold text-primary mb-0">{formatPrice(totalRevenue)} DT</h4>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-light rounded p-3 text-center">
                <small className="text-muted d-block">🏆 Top Catégorie</small>
                <h6 className="fw-bold mb-0">{chartData[0]?.name || '-'}</h6>
                <small className="text-success">{chartData[0] ? formatPrice(chartData[0].revenue) + ' DT' : '-'}</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-light rounded p-3 text-center">
                <small className="text-muted d-block">📊 Catégories actives</small>
                <h4 className="fw-bold text-success mb-0">{chartData.length}</h4>
              </div>
            </div>
          </div>

          {/* Graphique en barres */}
          {chartData.length === 0 ? (
            <div className="text-center py-5 bg-light rounded">
              <FaEyeSlash size={48} className="text-muted mb-3" />
              <p className="text-muted">Aucune donnée de vente pour la période sélectionnée</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${formatPrice(value)} DT`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={120}
                    interval={0}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Chiffre d'affaires (DT)"
                    radius={[0, 4, 4, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 text-center text-muted small">
                <FaShoppingBag className="me-1" />
                Total des ventes : {formatPrice(totalRevenue)} DT pour la période
              </div>
            </>
          )}

          {/* Tableau des détails */}
          {chartData.length > 0 && (
            <div className="mt-4">
              <h6 className="fw-bold mb-3">
                <FaTrophy className="me-2 text-warning" />
                Détail par catégorie
              </h6>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Catégorie</th>
                      <th className="text-end">CA (DT)</th>
                      <th className="text-end">Part du CA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((item, idx) => {
                      const percentage = (item.revenue / totalRevenue) * 100;
                      return (
                        <tr key={idx}>
                          <td style={{ width: '50px' }}>
                            {idx === 0 && <FaMedal className="text-warning" />}
                            {idx === 1 && <FaMedal className="text-secondary" />}
                            {idx === 2 && <FaMedal style={{ color: '#cd7f32' }} />}
                            {idx > 2 && idx + 1}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span 
                                className="me-2 rounded-circle" 
                                style={{ 
                                  backgroundColor: item.color, 
                                  width: '12px', 
                                  height: '12px', 
                                  display: 'inline-block' 
                                }}
                              />
                              <span className="fw-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="text-end fw-semibold">{formatPrice(item.revenue)}</td>
                          <td className="text-end">
                            <div className="d-flex align-items-center justify-content-end gap-2">
                              <span className="small">{percentage.toFixed(1)}%</span>
                              <div className="progress" style={{ width: '100px', height: '6px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${percentage}%`, backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .fa-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}