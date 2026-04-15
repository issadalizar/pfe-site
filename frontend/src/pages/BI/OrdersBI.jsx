import React, { useState, useEffect, useRef } from 'react';
import { MonthlyBarChart, MonthlyOrdersChart, MonthComparisonTable, CategorySalesChart, ReturnExchangeRateCircle, ClientsByRegionMap, ClientMapCluster } from '../../components/BI';
import { 
  FaChartLine, FaChartBar, FaTable, FaTrophy, FaMedal, 
  FaMapMarkerAlt, FaShoppingCart, FaWallet, FaPercentage, 
  FaRocket, FaUsers, FaArrowUp, FaArrowDown, FaRegCalendarAlt,
  FaDownload, FaFilter, FaEllipsisH, FaFilePdf, FaSpinner, FaPrint
} from 'react-icons/fa';
import { getReturnRequestAnalytics } from '../../services/returnRequestService';
import { getAllUsers } from '../../services/userService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/orders';

export default function OrdersBI() {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [returnAnalytics, setReturnAnalytics] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    const dashboardRef = useRef(null);
    const exportMenuRef = useRef(null);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatCompactPrice = (price) => {
        if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M';
        if (price >= 1000) return (price / 1000).toFixed(1) + 'k';
        return formatPrice(price);
    };

    const extractAvailableYears = (orders) => {
        const years = new Set();
        orders.forEach(order => {
            if (order.paymentStatus === 'paid') {
                const year = new Date(order.createdAt).getFullYear();
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    };

    const processMonthlyData = (orders, year = null) => {
        const monthlyMap = new Map();
        
        orders.forEach(order => {
            if (order.paymentStatus === 'paid') {
                const date = new Date(order.createdAt);
                const orderYear = date.getFullYear();
                
                if (year && orderYear !== year) return;
                
                const monthKey = `${orderYear}-${date.getMonth() + 1}`;
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

    // Exporter en PDF
    const exportToPDF = async () => {
        if (!dashboardRef.current) return;
        
        setExporting(true);
        setShowExportMenu(false);
        try {
            const element = dashboardRef.current;
            const canvas = await html2canvas(element, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`dashboard_bi_${selectedYear}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Une erreur est survenue lors de l\'export PDF');
        } finally {
            setExporting(false);
        }
    };

    // Fonction d'impression avec capture des graphiques
    const handlePrint = async () => {
        setShowExportMenu(false);
        setPrinting(true);
        
        try {
            // Afficher un indicateur de chargement
            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            z-index: 10000; text-align: center;">
                    <div class="spinner-border text-primary mb-2" role="status"></div>
                    <p>Préparation de l'impression...</p>
                </div>
            `;
            document.body.appendChild(loadingDiv);
            
            // Capturer le dashboard entier
            const element = dashboardRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false,
                onclone: (clonedDoc, element) => {
                    // S'assurer que tous les graphiques sont bien clonés
                    console.log('Clonage terminé');
                }
            });
            
            // Supprimer l'indicateur de chargement
            document.body.removeChild(loadingDiv);
            
            // Créer une nouvelle fenêtre pour l'impression
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Veuillez autoriser les popups pour cette application');
                setPrinting(false);
                return;
            }
            
            // Créer le HTML pour l'impression
            const imageData = canvas.toDataURL('image/png');
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Dashboard BI - ${selectedYear}</title>
                        <meta charset="UTF-8">
                        <style>
                            body {
                                margin: 0;
                                padding: 20px;
                                font-family: Arial, sans-serif;
                            }
                            .print-container {
                                text-align: center;
                            }
                            .dashboard-image {
                                max-width: 100%;
                                height: auto;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            }
                            .print-header {
                                margin-bottom: 20px;
                                text-align: center;
                            }
                            .print-header h1 {
                                margin: 0;
                                color: #1a1a2e;
                            }
                            .print-header p {
                                color: #666;
                                margin-top: 5px;
                            }
                            @media print {
                                body {
                                    padding: 0;
                                    margin: 0;
                                }
                                .no-print {
                                    display: none;
                                }
                                .dashboard-image {
                                    box-shadow: none;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            <div class="print-header">
                                <h1>Tableau de Bord Business Intelligence</h1>
                                <p>Année: ${selectedYear} - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                            </div>
                            <img src="${imageData}" class="dashboard-image" alt="Dashboard BI" />
                            <div class="print-footer" style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                                <p>Document généré automatiquement - Tous droits réservés</p>
                            </div>
                        </div>
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    window.onafterprint = function() {
                                        window.close();
                                    };
                                }, 500);
                            };
                        <\/script>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
        } catch (error) {
            console.error('Erreur lors de la préparation de l\'impression:', error);
            alert('Une erreur est survenue lors de la préparation de l\'impression');
        } finally {
            setPrinting(false);
        }
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
                const years = extractAvailableYears(data.orders);
                setAvailableYears(years);
                const monthly = processMonthlyData(data.orders, selectedYear);
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

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur chargement des utilisateurs:', err);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedYear]);

    useEffect(() => {
        fetchCategoryData();
        fetchReturnAnalytics();
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="text-center">
                    <div className="spinner-border text-white mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <h5 className="text-white">Chargement des données analytiques...</h5>
                </div>
            </div>
        );
    }

    // Calcul des statistiques globales
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const totalOrders = monthlyData.reduce((sum, month) => sum + month.orderCount, 0);
    const averageRevenue = monthlyData.length > 0 ? totalRevenue / monthlyData.length : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let totalEvolution = 0;
    let evolutionCount = 0;
    let bestGrowth = 0;
    let worstGrowth = 0;
    
    for (let i = 1; i < monthlyData.length; i++) {
        if (monthlyData[i-1].revenue > 0) {
            const growth = ((monthlyData[i].revenue - monthlyData[i-1].revenue) / monthlyData[i-1].revenue * 100);
            totalEvolution += growth;
            evolutionCount++;
            if (growth > bestGrowth) bestGrowth = growth;
            if (growth < worstGrowth) worstGrowth = growth;
        }
    }
    const averageEvolution = evolutionCount > 0 ? totalEvolution / evolutionCount : 0;

    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    const monthlyGrowth = previousMonth && previousMonth.revenue > 0 
        ? ((lastMonth?.revenue - previousMonth.revenue) / previousMonth.revenue * 100)
        : 0;

    return (
        <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
            <div className="container-fluid p-4">
                
                {/* Header - caché à l'impression */}
                <div className="mb-5 no-print">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="p-3 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <FaChartLine size={28} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="display-5 fw-bold mb-0" style={{ color: '#1a1a2e' }}>
                                        Data Analysis
                                    </h1>
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <div className="position-relative" ref={exportMenuRef}>
                                <button 
                                    className="btn btn-light shadow-sm px-4"
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={exporting || printing}
                                >
                                    {exporting || printing ? (
                                        <>
                                            <FaSpinner className="me-2 spin" />
                                            {exporting ? 'Export en cours...' : 'Préparation...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload className="me-2" />
                                            Télécharger
                                        </>
                                    )}
                                </button>
                                
                                {showExportMenu && !exporting && !printing && (
                                    <div className="position-absolute top-100 end-0 mt-2" style={{ zIndex: 1000 }}>
                                        <div className="card border-0 shadow-lg rounded-3" style={{ minWidth: '200px' }}>
                                            <div className="list-group list-group-flush">
                                                <button 
                                                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-top-3"
                                                    onClick={exportToPDF}
                                                >
                                                    <FaFilePdf className="text-danger" size={18} />
                                                    <div className="text-start">
                                                        <div className="fw-semibold small">Télécharger PDF</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Exporter le dashboard au format PDF</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-bottom-3"
                                                    onClick={handlePrint}
                                                >
                                                    <FaPrint className="text-primary" size={18} />
                                                    <div className="text-start">
                                                        <div className="fw-semibold small">Imprimer</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Imprimer le dashboard</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="dropdown">
                                <button className="btn btn-outline-secondary shadow-sm dropdown-toggle" data-bs-toggle="dropdown">
                                    <FaRegCalendarAlt className="me-2" />
                                    {selectedYear}
                                </button>
                                <ul className="dropdown-menu">
                                    {availableYears.map(year => (
                                        <li key={year}>
                                            <button 
                                                className={`dropdown-item ${selectedYear === year ? 'active' : ''}`}
                                                onClick={() => setSelectedYear(year)}
                                            >
                                                {year}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu à imprimer/exporter */}
                <div ref={dashboardRef}>
                    {/* Cartes KPI */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <p className="text-muted mb-1 small text-uppercase fw-semibold">Chiffre d'affaires</p>
                                            <h2 className="fw-bold mb-0" style={{ color: '#1a1a2e', fontSize: '1.8rem' }}>
                                                {formatCompactPrice(totalRevenue)} <span style={{ fontSize: '1rem' }}>DT</span>
                                            </h2>
                                        </div>
                                        <div className="rounded-3 p-2" style={{ backgroundColor: '#f0fdf4' }}>
                                            <FaWallet size={20} style={{ color: '#22c55e' }} />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-top">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">Moyenne mensuelle</span>
                                            <span className="fw-semibold" style={{ color: '#1a1a2e' }}>
                                                {formatCompactPrice(averageRevenue)} DT
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <span className="text-muted small">Total {selectedYear}</span>
                                            <span className="small text-success">{totalOrders} commandes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <p className="text-muted mb-1 small text-uppercase fw-semibold">Commandes</p>
                                            <h2 className="fw-bold mb-0" style={{ color: '#1a1a2e', fontSize: '1.8rem' }}>
                                                {totalOrders.toLocaleString()}
                                            </h2>
                                        </div>
                                        <div className="rounded-3 p-2" style={{ backgroundColor: '#eff6ff' }}>
                                            <FaShoppingCart size={20} style={{ color: '#3b82f6' }} />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-top">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">Panier moyen</span>
                                            <span className="fw-semibold" style={{ color: '#1a1a2e' }}>
                                                {formatCompactPrice(averageOrderValue)} DT
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <span className="text-muted small">Commandes payées</span>
                                            <span className="small text-success">+12% vs année préc.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <p className="text-muted mb-1 small text-uppercase fw-semibold">Croissance moyenne</p>
                                            <h2 className="fw-bold mb-0" style={{ color: averageEvolution >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.8rem' }}>
                                                {averageEvolution >= 0 ? '+' : ''}{averageEvolution.toFixed(1)}%
                                            </h2>
                                        </div>
                                        <div className="rounded-3 p-2" style={{ backgroundColor: '#fef3c7' }}>
                                            <FaPercentage size={20} style={{ color: '#f59e0b' }} />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-top">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">Meilleur mois</span>
                                            <span className="fw-semibold text-success">
                                                +{bestGrowth.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <span className="text-muted small">Pire mois</span>
                                            <span className="small text-danger">{worstGrowth.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <p className="text-muted mb-1 small text-uppercase fw-semibold">Performance Mois</p>
                                            <h2 className="fw-bold mb-0" style={{ color: monthlyGrowth >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.8rem' }}>
                                                {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                                            </h2>
                                        </div>
                                        <div className="rounded-3 p-2" style={{ backgroundColor: '#f3e8ff' }}>
                                            {monthlyGrowth >= 0 ? <FaArrowUp size={20} style={{ color: '#a855f7' }} /> : <FaArrowDown size={20} style={{ color: '#a855f7' }} />}
                                        </div>
                                    </div>
                                    <div className="pt-2 border-top">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">Dernier mois</span>
                                            <span className="fw-semibold" style={{ color: '#1a1a2e' }}>
                                                {formatCompactPrice(lastMonth?.revenue || 0)} DT
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <span className="text-muted small">vs mois précédent</span>
                                            <span className={`small ${monthlyGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(monthlyGrowth).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Principale: Comparaison + Croissance */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaTable className="me-2" style={{ color: '#f59e0b' }} />
                                                Analyse Mensuelle
                                            </h5>
                                            <p className="text-muted small mb-0">Comparaison détaillée mois par mois</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    {monthlyData.length > 0 ? (
                                        <MonthComparisonTable
                                            data={monthlyData}
                                            formatPrice={formatPrice}
                                            showDonut={true}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Aucune donnée disponible pour {selectedYear}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaRocket className="me-2" style={{ color: '#4361ee' }} />
                                                Croissance Mensuelle
                                            </h5>
                                            <p className="text-muted small mb-0">Évolution en pourcentage du CA</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    {monthlyData.length > 1 ? (
                                        <MonthlyBarChart data={monthlyData} title="" />
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Données insuffisantes pour {selectedYear}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Clients */}
                    <div className="row g-4 mb-5">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaUsers className="me-2" style={{ color: '#10b981' }} />
                                                Répartition Géographique des Clients
                                            </h5>
                                            <p className="text-muted small mb-0">Analyse par région - Actifs vs Inactifs</p>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#22c55e' }}></div>
                                                <small className="text-muted">Actifs</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#ef4444' }}></div>
                                                <small className="text-muted">Inactifs</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    <ClientsByRegionMap users={users} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Carte Interactive */}
                    <div className="row g-4 mb-5">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaMapMarkerAlt className="me-2" style={{ color: '#ef4444' }} />
                                                Visualisation Cartographique
                                            </h5>
                                            <p className="text-muted small mb-0">Localisation des clients sur le territoire tunisien</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    <ClientMapCluster users={users} centerLat={36.8065} centerLng={10.1815} zoom={7} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Produits */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaMedal className="me-2" style={{ color: '#8b5cf6' }} />
                                                Taux de Retour / Échange
                                            </h5>
                                            <p className="text-muted small mb-0">Top produits concernés</p>
                                        </div>
                                        <span className="badge bg-light text-dark px-3 py-2 rounded-pill border">
                                            Qualité
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    {returnAnalytics.length > 0 ? (
                                        <div className="row g-3">
                                            {returnAnalytics.slice(0, 3).map((product) => (
                                                <div key={product.productName} className="col-md-12">
                                                    <ReturnExchangeRateCircle product={product} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted mb-0">Aucune donnée de retour/échange disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaShoppingCart className="me-2" style={{ color: '#4361ee' }} />
                                                Évolution des Commandes
                                            </h5>
                                            <p className="text-muted small mb-0">Nombre de commandes payées par mois</p>
                                        </div>
                                        <span className="badge bg-light text-dark px-3 py-2 rounded-pill border">
                                            Tendance
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    <MonthlyOrdersChart data={monthlyData} title="" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Catégories */}
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-header bg-transparent border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                                                <FaTrophy className="me-2" style={{ color: '#f59e0b' }} />
                                                Top Catégories
                                            </h5>
                                            <p className="text-muted small mb-0">Performance par catégorie de produits</p>
                                        </div>
                                        <span className="badge bg-light text-dark px-3 py-2 rounded-pill border">
                                            Meilleures ventes
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-4 pt-0">
                                    {categoryData.length > 0 ? (
                                        <div style={{ width: '100%', height: '450px' }}>
                                            <CategorySalesChart data={categoryData} title="" />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Aucune donnée de vente disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}