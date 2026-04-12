import React, { useState, useEffect } from 'react';
import { MonthlyBarChart, MonthlyOrdersChart, MonthComparisonTable, CategorySalesChart, ReturnExchangeRateCircle } from '../../components/BI';
import { FaChartLine, FaChartBar, FaTable, FaTrophy, FaMedal } from 'react-icons/fa';
import { getReturnRequestAnalytics } from '../../services/returnRequestService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/orders';

export default function OrdersBI() {
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [returnAnalytics, setReturnAnalytics] = useState([]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const processMonthlyData = (orders) => {
        const monthlyMap = new Map();
        
        orders.forEach(order => {
            if (order.paymentStatus === 'paid') {
                const date = new Date(order.createdAt);
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const monthName = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
                
                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, {
                        month: monthName,
                        monthKey: monthKey,
                        revenue: 0,
                        orderCount: 0
                    });
                }
                
                const monthData = monthlyMap.get(monthKey);
                monthData.revenue += order.totalAmount;
                monthData.orderCount += 1;
            }
        });
        
        const monthlyArray = Array.from(monthlyMap.values());
        monthlyArray.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
        
        return monthlyArray;
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.orders) {
                const monthly = processMonthlyData(data.orders);
                setMonthlyData(monthly);
            }
        } catch (err) {
            console.error('Erreur chargement données BI:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/analytics/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.categories) {
                setCategoryData(data.categories);
            }
        } catch (err) {
            console.error('Erreur chargement données catégories:', err);
        }
    };

    const fetchReturnAnalytics = async () => {
        try {
            const data = await getReturnRequestAnalytics();
            if (data.success && data.products) {
                setReturnAnalytics(data.products);
            }
        } catch (err) {
            console.error('Erreur chargement données retour/échange:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchCategoryData();
        fetchReturnAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="text-muted mt-3">Chargement des données...</p>
            </div>
        );
    }

    // Calcul des statistiques globales
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const averageRevenue = monthlyData.length > 0 ? totalRevenue / monthlyData.length : 0;
    const bestMonth = monthlyData.reduce((best, month) => month.revenue > best.revenue ? month : best, monthlyData[0] || { revenue: 0 });
    const worstMonth = monthlyData.reduce((worst, month) => month.revenue < worst.revenue ? month : worst, monthlyData[0] || { revenue: 0 });

    // Calculer l'évolution moyenne
    let totalEvolution = 0;
    let evolutionCount = 0;
    for (let i = 1; i < monthlyData.length; i++) {
        if (monthlyData[i-1].revenue > 0) {
            totalEvolution += ((monthlyData[i].revenue - monthlyData[i-1].revenue) / monthlyData[i-1].revenue * 100);
            evolutionCount++;
        }
    }
    const averageEvolution = evolutionCount > 0 ? totalEvolution / evolutionCount : 0;

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
            <div className="container-fluid p-4">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="fw-bold" style={{ color: '#0f172a' }}>
                        <FaChartLine className="me-2" style={{ color: '#4361ee' }} />
                        Analyse de Croissance - Chiffre d'Affaires
                    </h1>
                    <p className="text-muted">Suivi de l'évolution mensuelle et comparaison mois par mois</p>
                </div>

                {/* Statistiques rapides */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 text-center p-3">
                            <small className="text-muted">CA Total</small>
                            <h4 className="fw-bold text-primary mb-0">{formatPrice(totalRevenue)} DT</h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 text-center p-3">
                            <small className="text-muted">Moyenne Mensuelle</small>
                            <h4 className="fw-bold text-success mb-0">{formatPrice(averageRevenue)} DT</h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 text-center p-3">
                            <small className="text-muted">Évolution Moyenne</small>
                            <h4 className={`fw-bold mb-0 ${averageEvolution >= 0 ? 'text-success' : 'text-danger'}`}>
                                {averageEvolution >= 0 ? '+' : ''}{averageEvolution.toFixed(1)}%
                            </h4>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 text-center p-3">
                            <small className="text-muted">Meilleure Croissance</small>
                            <h4 className="fw-bold text-info mb-0">
                                {(() => {
                                    let bestGrowth = 0;
                                    for (let i = 1; i < monthlyData.length; i++) {
                                        if (monthlyData[i-1].revenue > 0) {
                                            const growth = ((monthlyData[i].revenue - monthlyData[i-1].revenue) / monthlyData[i-1].revenue * 100);
                                            if (growth > bestGrowth) bestGrowth = growth;
                                        }
                                    }
                                    return `+${bestGrowth.toFixed(1)}%`;
                                })()}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Commandes payées par mois */}
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <MonthlyOrdersChart data={monthlyData} title="Commandes payées par mois" />
                    </div>
                </div>

                {/* Taux de retour / échange par produit */}
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-0 pt-3 pb-0">
                                <div className="d-flex align-items-center gap-2">
                                    <FaMedal size={20} style={{ color: '#9333ea' }} />
                                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Taux de retour / échange par produit</h5>
                                    <span className="badge rounded-pill" style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}>Statistiques produit</span>
                                </div>
                                <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                                    Visualisation rapide des produits dont le taux de retour / échange est le plus élevé.
                                </p>
                            </div>
                            <div className="card-body">
                                {returnAnalytics.length > 0 ? (
                                    <div className="row g-3">
                                        {returnAnalytics.slice(0, 3).map((product) => (
                                            <div key={product.productName} className="col-md-4">
                                                <ReturnExchangeRateCircle product={product} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted mb-0">Aucune donnée de retour/échange disponible pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout à 2 colonnes: Tableau à gauche, Graphique à droite */}
                <div className="row g-4">
                    {/* Colonne gauche: Tableau comparatif */}
                    <div className="col-lg-5">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-0 pt-3 pb-0">
                                <div className="d-flex align-items-center gap-2">
                                    <FaTable size={20} style={{ color: '#f59e0b' }} />
                                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Comparaison Mois par Mois</h5>
                                    <span className="badge bg-warning rounded-pill">Tableau comparatif</span>
                                </div>
                                <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                                    Comparaison détaillée du chiffre d'affaires de chaque mois par rapport au mois précédent
                                </p>
                            </div>
                            <div className="card-body">
                                {monthlyData.length > 0 ? (
                                    <MonthComparisonTable
                                        data={monthlyData}
                                        formatPrice={formatPrice}
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted">Aucune donnée disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite: Graphique de croissance (plus large) */}
                    <div className="col-lg-7">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-0 pt-3 pb-0">
                                <div className="d-flex align-items-center gap-2">
                                    <FaChartBar size={20} style={{ color: '#4361ee' }} />
                                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Croissance Mensuelle</h5>
                                    <span className="badge bg-primary rounded-pill">Bar Chart - Évolution en %</span>
                                </div>
                                <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                                    Évolution en pourcentage du chiffre d'affaires par rapport au mois précédent
                                </p>
                            </div>
                            <div className="card-body" style={{ minHeight: '500px' }}>
                                {monthlyData.length > 1 ? (
                                    <>
                                        <div style={{ width: '100%', height: '450px' }}>
                                            <MonthlyBarChart
                                                data={monthlyData}
                                                title=""
                                            />
                                        </div>
                                        <div className="mt-3 d-flex justify-content-center gap-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px' }}></div>
                                                <small className="text-muted">Croissance positive</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px' }}></div>
                                                <small className="text-muted">Baisse</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{ width: '20px', height: '20px', backgroundColor: '#6b7280', borderRadius: '4px' }}></div>
                                                <small className="text-muted">Stable</small>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted">Données insuffisantes pour afficher l'évolution (minimum 2 mois requis)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Catégories les plus vendues */}
                <div className="row g-4 mt-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-0 pt-3 pb-0">
                                <div className="d-flex align-items-center gap-2">
                                    <FaTrophy size={20} style={{ color: '#f59e0b' }} />
                                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Catégories les plus vendues</h5>
                                    <span className="badge bg-warning rounded-pill">Top 10 catégories</span>
                                </div>
                                <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                                    Analyse des performances par catégorie - Chiffre d'affaires et quantité vendue
                                </p>
                            </div>
                            <div className="card-body" style={{ minHeight: '500px' }}>
                                {categoryData.length > 0 ? (
                                    <div style={{ width: '100%', height: '450px' }}>
                                        <CategorySalesChart
                                            data={categoryData}
                                            title=""
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted">Aucune donnée de vente disponible pour les catégories</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}