// CategorySalesChart.jsx - Version avec graphique agrandi et donut chart interactif
// Palette de couleurs féminine (tons pastel, roses, lavande, corail)
import React, { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement
);

// Palette de couleurs féminine harmonisée
const COLOR_PALETTE = [
    '#FFB5C2', // Rose pastel
    '#D4A5D9', // Lavande
    '#FF9F9F', // Corail tendre
    '#B8E4F0', // Bleu ciel pastel
    '#C5E99B', // Vert menthe doux
    '#FFD6A5', // Pêche
    '#E8C3E5', // Mauve clair
    '#A7D0CD', // Menthe bleutée
    '#FBC8B5', // Abricot
    '#E2B1B1', // Rose poudré
    '#C9B1E8', // Lavande claire
    '#FFC8C8', // Rose blush
    '#B5D8E8', // Bleu glacier
    '#FFD9B0', // Crème pêche
    '#D5B9DF'  // Violet clair
];

// Couleurs pour les barres et lignes
const CHART_COLORS = {
    revenue: {
        background: 'rgba(255, 181, 194, 0.7)',   // Rose pastel transparent
        border: '#FFB5C2',
        hover: 'rgba(255, 181, 194, 0.9)'
    },
    quantity: {
        background: 'rgba(212, 165, 217, 0.7)',   // Lavande transparent
        border: '#D4A5D9',
        hover: 'rgba(212, 165, 217, 0.9)'
    },
    percentage: {
        line: '#FF9F9F',      // Corail
        point: '#FF9F9F',
        pointBorder: '#FFFFFF'
    }
};

// Structure hiérarchique des catégories (basée sur pfe_db.categories.json)
const CATEGORY_HIERARCHY = {
    'CNC for Education': {
        displayName: 'CNC for Education',
        parent: null,
        children: ['CNC Turning Machine', 'CNC Milling Machine'],
        order: 1
    },
    'CNC Turning Machine': {
        displayName: 'CNC Turning Machine',
        parent: 'CNC for Education',
        order: 1
    },
    'CNC Milling Machine': {
        displayName: 'CNC Milling Machine',
        parent: 'CNC for Education',
        order: 2
    },
    'Voiture': {
        displayName: 'Voiture',
        parent: null,
        children: ['CAPTEURS ET ACTIONNEURS', 'ÉLECTRICITÉ', 'RÉSEAUX MULTIPLEXÉS'],
        order: 2
    },
    'CAPTEURS ET ACTIONNEURS': {
        displayName: 'CAPTEURS ET ACTIONNEURS',
        parent: 'Voiture',
        order: 1
    },
    'ÉLECTRICITÉ': {
        displayName: 'ÉLECTRICITÉ',
        parent: 'Voiture',
        order: 2
    },
    'RÉSEAUX MULTIPLEXÉS': {
        displayName: 'RÉSEAUX MULTIPLEXÉS',
        parent: 'Voiture',
        order: 3
    },
    'MCP lab electronics': {
        displayName: 'MCP lab electronics',
        parent: null,
        children: ['Accessoires', 'EDUCATION EQUIPMENT'],
        order: 3
    },
    'Accessoires': {
        displayName: 'Accessoires',
        parent: 'MCP lab electronics',
        order: 1
    },
    'EDUCATION EQUIPMENT': {
        displayName: 'EDUCATION EQUIPMENT',
        parent: 'MCP lab electronics',
        order: 2
    },
    'Autres Produits': {
        displayName: 'Autres Produits',
        parent: null,
        order: 4
    }
};

// Liste plate de TOUTES les sous-catégories pour l'affichage
const ALL_SUB_CATEGORIES = [
    { name: 'CNC Turning Machine', parent: 'CNC for Education', order: 1 },
    { name: 'CNC Milling Machine', parent: 'CNC for Education', order: 2 },
    { name: 'CAPTEURS ET ACTIONNEURS', parent: 'Voiture', order: 3 },
    { name: 'ÉLECTRICITÉ', parent: 'Voiture', order: 4 },
    { name: 'RÉSEAUX MULTIPLEXÉS', parent: 'Voiture', order: 5 },
    { name: 'Accessoires', parent: 'MCP lab electronics', order: 6 },
    { name: 'EDUCATION EQUIPMENT', parent: 'MCP lab electronics', order: 7 },
    { name: 'Autres Produits', parent: null, order: 8 }
];

// Mapping des noms de produits vers catégories
const getProductCategory = (productName) => {
    if (!productName) return 'Autres Produits';
    
    const productLower = productName.toLowerCase();
    
    const categoryMapping = [
        { category: 'CNC Turning Machine', keywords: ['pc1 baby', 'de2-ultra', 'de4-eco', 'de4-pro', 'de6', 'de8', 'baby cnc', 'mini cnc turning', 'turning center'] },
        { category: 'CNC Milling Machine', keywords: ['fa2-ultra', 'px1 baby', 'fa4-eco', 'xk7136', 'desktop cnc mill', '5-axis', 'fraiseuse', 'milling'] },
        { category: 'CAPTEURS ET ACTIONNEURS', keywords: ['dt-m002', 'mesure des positions', 'dt-m001', 'angle de volant', 'capteur', 'actionneur'] },
        { category: 'ÉLECTRICITÉ', keywords: ['dtm7020', 'essuie-glaces', 'dtm7000', 'éclairage', 'signalisation', 'mt-4002v', 'charge démarrage', 'electricite'] },
        { category: 'RÉSEAUX MULTIPLEXÉS', keywords: ['dt-m005', 'courants', 'tensions', 'multiplexe', 'can bus', 'lin bus'] },
        { category: 'Accessoires', keywords: ['accessoire', 'sonde', 'cordon', 'test', 'diagnostic'] },
        { category: 'EDUCATION EQUIPMENT', keywords: ['ptl', 'acl-7000', 'm21-7100', 'f1-3', 'équipement pédagogique', 'banc didactique'] }
    ];
    
    for (const mapping of categoryMapping) {
        for (const keyword of mapping.keywords) {
            if (productLower.includes(keyword)) {
                return mapping.category;
            }
        }
    }
    
    return 'Autres Produits';
};

const getDisplayName = (categoryName) => {
    const category = CATEGORY_HIERARCHY[categoryName];
    if (!category) return categoryName;
    
    if (category.parent) {
        return `${category.displayName}`;
    }
    return category.displayName;
};

// Fonction pour agréger les produits par catégorie
const aggregateProductsByCategory = (orders, categoryName) => {
    const productMap = new Map();

    orders.forEach(order => {
        const isValidOrder = order.paymentStatus === 'paid' || 
                             order.orderStatus === 'livree' || 
                             order.orderStatus === 'confirmee';
        
        if (!isValidOrder) return;
        if (!order.items || !Array.isArray(order.items)) return;

        order.items.forEach(item => {
            const productName = item.productName || item.product?.name || '';
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const revenue = quantity * price;
            
            const category = getProductCategory(productName);
            
            if (category === categoryName) {
                if (productMap.has(productName)) {
                    const existing = productMap.get(productName);
                    existing.totalRevenue += revenue;
                    existing.totalQuantity += quantity;
                } else {
                    productMap.set(productName, {
                        productName: productName,
                        totalRevenue: revenue,
                        totalQuantity: quantity
                    });
                }
            }
        });
    });

    let result = Array.from(productMap.values());
    // Trier par chiffre d'affaires décroissant
    result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    // Garder seulement les top 10 produits pour le donut chart
    return result.slice(0, 10);
};

const aggregateOrdersByCategory = (orders, allCategories) => {
    const categoryMap = new Map();
    allCategories.forEach(cat => {
        categoryMap.set(cat.name, {
            categoryName: cat.name,
            displayName: getDisplayName(cat.name),
            parent: CATEGORY_HIERARCHY[cat.name]?.parent || null,
            totalRevenue: 0,
            totalQuantity: 0,
            order: cat.order
        });
    });

    orders.forEach(order => {
        const isValidOrder = order.paymentStatus === 'paid' || 
                             order.orderStatus === 'livree' || 
                             order.orderStatus === 'confirmee';
        
        if (!isValidOrder) return;
        if (!order.items || !Array.isArray(order.items)) return;

        order.items.forEach(item => {
            const productName = item.productName || item.product?.name || '';
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const revenue = quantity * price;
            
            const category = getProductCategory(productName);
            
            if (categoryMap.has(category)) {
                const existing = categoryMap.get(category);
                existing.totalRevenue += revenue;
                existing.totalQuantity += quantity;
            }
        });
    });

    let result = Array.from(categoryMap.values());
    result.sort((a, b) => a.order - b.order);
    
    return result;
};

export default function CategorySalesChart({ data = [], orders = [], title }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [productsData, setProductsData] = useState([]);

    const aggregatedData = useMemo(() => {
        if (data && data.length > 0 && data[0]?.categoryName) {
            const dataMap = new Map(data.map(item => [item.categoryName, item]));
            const completeData = ALL_SUB_CATEGORIES.map(cat => {
                if (dataMap.has(cat.name)) {
                    return {
                        ...dataMap.get(cat.name),
                        displayName: getDisplayName(cat.name),
                        parent: CATEGORY_HIERARCHY[cat.name]?.parent || null,
                        order: cat.order
                    };
                }
                return {
                    categoryName: cat.name,
                    displayName: getDisplayName(cat.name),
                    parent: CATEGORY_HIERARCHY[cat.name]?.parent || null,
                    totalRevenue: 0,
                    totalQuantity: 0,
                    order: cat.order
                };
            });
            completeData.sort((a, b) => a.order - b.order);
            return completeData;
        }
        if (orders && orders.length > 0) {
            return aggregateOrdersByCategory(orders, ALL_SUB_CATEGORIES);
        }
        return ALL_SUB_CATEGORIES.map(cat => ({
            categoryName: cat.name,
            displayName: getDisplayName(cat.name),
            parent: CATEGORY_HIERARCHY[cat.name]?.parent || null,
            totalRevenue: 0,
            totalQuantity: 0,
            order: cat.order
        })).sort((a, b) => a.order - b.order);
    }, [data, orders]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const totalRevenue = aggregatedData.reduce((sum, item) => sum + (item.totalRevenue ?? 0), 0);
    const percentages = aggregatedData.map(item => 
        totalRevenue > 0 ? ((item.totalRevenue ?? 0) / totalRevenue * 100).toFixed(1) : 0
    );

    // Fonction pour gérer le clic sur une ligne du tableau
    const handleCategoryClick = (category) => {
        if (orders && orders.length > 0) {
            const products = aggregateProductsByCategory(orders, category.categoryName);
            setSelectedCategory(category);
            setProductsData(products);
        }
    };

    // Fonction pour fermer le modal du donut chart
    const closeModal = () => {
        setSelectedCategory(null);
        setProductsData([]);
    };

    // Configuration du donut chart avec la palette féminine
    const getDonutChartData = () => {
        if (!productsData.length) return null;

        return {
            labels: productsData.map(p => p.productName.length > 30 ? p.productName.substring(0, 27) + '...' : p.productName),
            datasets: [
                {
                    data: productsData.map(p => p.totalRevenue),
                    backgroundColor: COLOR_PALETTE.slice(0, productsData.length),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 10,
                }
            ]
        };
    };

    const donutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: { size: 11 },
                    boxWidth: 10,
                    padding: 8,
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatPrice(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Configuration du graphique avec tailles agrandies et couleurs féminines
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            datalabels: { display: false },
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 12,
                    font: { size: 12, weight: 'bold' },
                    padding: 15
                }
            },
            tooltip: {
                bodyFont: { size: 12 },
                titleFont: { size: 13, weight: 'bold' },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            if (context.dataset.label === "Chiffre d'affaires (DT)") {
                                label += formatPrice(context.parsed.y);
                            } else if (context.dataset.label === 'Quantité vendue') {
                                label += formatNumber(context.parsed.y) + ' unités';
                            } else if (context.dataset.label === 'Pourcentage du CA (%)') {
                                label += context.parsed.y.toFixed(1) + '%';
                            }
                        }
                        return label;
                    }
                }
            },
            title: {
                display: Boolean(title),
                text: title,
                font: { size: 16, weight: 'bold' },
                padding: { bottom: 20 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Chiffre d'affaires (DT) / Quantité",
                    font: { size: 12, weight: 'bold' },
                    padding: { bottom: 10 }
                },
                ticks: {
                    font: { size: 11 },
                    callback: function(value) {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                        return value;
                    }
                },
                grid: { color: '#F5E6E8' }  // Grille plus douce
            },
            y1: {
                position: 'right',
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Pourcentage (%)',
                    font: { size: 12, weight: 'bold' },
                    padding: { bottom: 10 }
                },
                ticks: {
                    font: { size: 11 },
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: { drawOnChartArea: false }
            },
            x: {
                title: {
                    display: true,
                    text: 'Catégories',
                    font: { size: 12, weight: 'bold' },
                    padding: { top: 10 }
                },
                ticks: {
                    font: { size: 11, weight: '500' },
                    maxRotation: 35,
                    minRotation: 35,
                    autoSkip: false,
                },
                grid: { display: false }
            }
        }
    };

    if (aggregatedData.length === 0) {
        return (
            <div className="card border-0">
                <div className="card-body text-center py-5">
                    <p className="text-muted mb-0">Aucune donnée de vente disponible</p>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: aggregatedData.map(item => item.displayName),
        datasets: [
            {
                label: "Chiffre d'affaires (DT)",
                data: aggregatedData.map(item => item.totalRevenue ?? 0),
                backgroundColor: CHART_COLORS.revenue.background,
                borderColor: CHART_COLORS.revenue.border,
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                yAxisID: 'y',
                type: 'bar',
            },
            {
                label: 'Quantité vendue',
                data: aggregatedData.map(item => item.totalQuantity ?? 0),
                backgroundColor: CHART_COLORS.quantity.background,
                borderColor: CHART_COLORS.quantity.border,
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.65,
                categoryPercentage: 0.8,
                yAxisID: 'y',
                type: 'bar',
            },
            {
                label: 'Pourcentage du CA (%)',
                data: percentages.map(p => parseFloat(p)),
                borderColor: CHART_COLORS.percentage.line,
                backgroundColor: CHART_COLORS.percentage.line,
                borderWidth: 3,
                pointRadius: 7,
                pointHoverRadius: 10,
                pointBackgroundColor: CHART_COLORS.percentage.point,
                pointBorderColor: CHART_COLORS.percentage.pointBorder,
                pointBorderWidth: 2,
                tension: 0.3,
                fill: false,
                yAxisID: 'y1',
                type: 'line',
            }
        ]
    };

    return (
        <>
            <div className="row g-4">
                {/* Colonne du graphique - plus large (col-md-9) */}
                <div className="col-md-9">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4">
                            <div style={{ height: '550px', width: '100%', position: 'relative' }}>
                                <Bar data={chartData} options={options} />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Colonne du tableau - plus petite (col-md-3) */}
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-3">
                            <div className="table-responsive" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover" style={{ fontSize: '0.75rem' }}>
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th style={{ fontSize: '0.7rem' }}>Catégorie</th>
                                            <th className="text-end" style={{ fontSize: '0.7rem' }}>CA (DT)</th>
                                            <th className="text-end" style={{ fontSize: '0.7rem' }}>Qté</th>
                                            <th className="text-end" style={{ fontSize: '0.7rem' }}>%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {aggregatedData.map((item, index) => {
                                            const revenue = item.totalRevenue ?? 0;
                                            const quantity = item.totalQuantity ?? 0;
                                            const percentage = percentages[index];
                                            
                                            return (
                                                <tr 
                                                    key={index} 
                                                    onClick={() => handleCategoryClick(item)}
                                                    style={{ cursor: 'pointer' }}
                                                    className="category-row"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF0F2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                                >
                                                    <td style={{ fontSize: '0.7rem' }}>
                                                        {item.displayName}
                                                        {revenue === 0 && quantity === 0 && (
                                                            <span className="badge bg-secondary ms-1" style={{ fontSize: '0.55rem' }}>0</span>
                                                        )}
                                                    </td>
                                                    <td className="text-end" style={{ 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: revenue > 0 ? 600 : 400,
                                                        color: revenue > 0 ? '#FF9F9F' : '#D4A5D9' 
                                                    }}>
                                                        {formatPrice(revenue)}
                                                    </td>
                                                    <td className="text-end" style={{ 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: quantity > 0 ? 600 : 400,
                                                        color: quantity > 0 ? '#C5E99B' : '#D4A5D9' 
                                                    }}>
                                                        {formatNumber(quantity)}
                                                    </td>
                                                    <td className="text-end" style={{ 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: parseFloat(percentage) > 0 ? 600 : 400,
                                                        color: parseFloat(percentage) > 0 ? '#FFB5C2' : '#D4A5D9' 
                                                    }}>
                                                        {percentage}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <td className="fw-bold" style={{ fontSize: '0.7rem' }}>Total</td>
                                            <td className="text-end fw-bold" style={{ fontSize: '0.7rem', color: '#FF9F9F' }}>
                                                {formatPrice(totalRevenue)}
                                            </td>
                                            <td className="text-end fw-bold" style={{ fontSize: '0.7rem', color: '#C5E99B' }}>
                                                {formatNumber(aggregatedData.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0))}
                                            </td>
                                            <td className="text-end fw-bold" style={{ fontSize: '0.7rem' }}>100%</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal pour le Donut Chart avec couleurs féminines */}
            {selectedCategory && productsData.length > 0 && (
                <div 
                    className="modal show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
                    onClick={closeModal}
                >
                    <div 
                        className="modal-dialog modal-lg modal-dialog-centered" 
                        style={{ maxWidth: '800px', margin: '1.75rem auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content shadow-lg">
                            <div className="modal-header" style={{ backgroundColor: '#FFF5F6' }}>
                                <h5 className="modal-title fw-bold">
                                    <i className="fas fa-chart-pie me-2" style={{ color: '#FFB5C2' }}></i>
                                    Détail des produits - {selectedCategory.displayName}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={closeModal}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row">
                                    <div className="col-md-12 text-center mb-3">
                                        <div className="alert py-2" style={{ backgroundColor: '#FFF0F2', border: 'none', borderRadius: '12px' }}>
                                            <small>
                                                <strong>Chiffre d'affaires total de la catégorie :</strong> {formatPrice(selectedCategory.totalRevenue)} DT
                                                <br />
                                                <strong>Nombre de produits dans cette catégorie :</strong> {productsData.length}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div style={{ height: '350px' }}>
                                            {getDonutChartData() && (
                                                <Doughnut data={getDonutChartData()} options={donutOptions} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-hover">
                                                <thead className="sticky-top" style={{ backgroundColor: '#FFF5F6' }}>
                                                    <tr>
                                                        <th>Produit</th>
                                                        <th className="text-end">CA (DT)</th>
                                                        <th className="text-end">%</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productsData.map((product, idx) => {
                                                        const productPercentage = (product.totalRevenue / selectedCategory.totalRevenue * 100).toFixed(1);
                                                        // Utilisation de la même palette de couleurs que le donut chart
                                                        const productColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                                                        
                                                        return (
                                                            <tr key={idx}>
                                                                <td style={{ fontSize: '0.8rem' }}>
                                                                    <span 
                                                                        className="d-inline-block me-2" 
                                                                        style={{ 
                                                                            width: '12px', 
                                                                            height: '12px', 
                                                                            borderRadius: '50%', 
                                                                            backgroundColor: productColor,
                                                                            display: 'inline-block',
                                                                            verticalAlign: 'middle'
                                                                        }} 
                                                                    ></span>
                                                                    {product.productName.length > 35 ? product.productName.substring(0, 32) + '...' : product.productName}
                                                                </td>
                                                                <td className="text-end" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#FF9F9F' }}>
                                                                    {formatPrice(product.totalRevenue)}
                                                                </td>
                                                                <td className="text-end" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#D4A5D9' }}>
                                                                    {productPercentage}%
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ backgroundColor: '#FFF5F6' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-sm" 
                                    onClick={closeModal}
                                    style={{ backgroundColor: '#FFB5C2', border: 'none', color: '#fff' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF9F9F'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFB5C2'}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Style CSS supplémentaire */}
            <style jsx>{`
                .category-row {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .category-row:active {
                    transform: scale(0.98);
                }
                .table-hover tbody tr:hover {
                    background-color: #FFF0F2 !important;
                }
            `}</style>
        </>
    );
}