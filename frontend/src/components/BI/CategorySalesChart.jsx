// CategorySalesChart.jsx - Version avec suppression garantie des data labels
import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Désactiver globalement les data labels si le plugin est installé
// Décommentez ces lignes si vous utilisez chartjs-plugin-datalabels
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// ChartJS.unregister(ChartDataLabels);

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
);

export default function CategorySalesChart({ data = [], orders = [], title }) {
    const aggregatedData = useMemo(() => {
        if (data && data.length > 0 && data[0]?.categoryName) {
            return data;
        }
        if (orders && orders.length > 0) {
            return aggregateOrdersByCategory(orders);
        }
        return [];
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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            // Désactiver explicitement les data labels
            datalabels: {
                display: false
            },
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
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
                font: { size: 14 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Chiffre d\'affaires (DT) / Quantité',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    callback: function(value) {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                        return value;
                    }
                },
                grid: {
                    color: '#e2e8f0'
                }
            },
            y1: {
                position: 'right',
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Pourcentage (%)',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    drawOnChartArea: false,
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Catégories',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 35,
                    minRotation: 35
                },
                grid: {
                    display: false
                }
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
        labels: aggregatedData.map(item =>
            item.categoryName && item.categoryName.length > 25
                ? item.categoryName.substring(0, 25) + '...'
                : item.categoryName || ''
        ),
        datasets: [
            {
                label: "Chiffre d'affaires (DT)",
                data: aggregatedData.map(item => item.totalRevenue ?? 0),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                yAxisID: 'y',
                type: 'bar',
                // Désactiver les data labels pour ce dataset
                datalabels: {
                    display: false
                }
            },
            {
                label: 'Quantité vendue',
                data: aggregatedData.map(item => item.totalQuantity ?? 0),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                yAxisID: 'y',
                type: 'bar',
                // Désactiver les data labels pour ce dataset
                datalabels: {
                    display: false
                }
            },
            {
                label: 'Pourcentage du CA (%)',
                data: percentages.map(p => parseFloat(p)),
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.3,
                fill: false,
                yAxisID: 'y1',
                type: 'line',
                // Désactiver les data labels pour ce dataset
                datalabels: {
                    display: false
                }
            }
        ]
    };

    return (
        <div className="row g-3">
            <div className="col-md-8">
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                            {title || "Catégories les plus vendues"}
                        </h6>
                        <div style={{ height: '450px' }}>
                            <Bar data={chartData} options={options} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="col-md-4">
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                            Comparatif des catégories
                        </h6>
                        <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                            <table className="table table-sm table-hover">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Catégorie</th>
                                        <th className="text-end">CA (DT)</th>
                                        <th className="text-end">Qté</th>
                                        <th className="text-end">% CA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aggregatedData.map((item, index) => {
                                        const revenue = item.totalRevenue ?? 0;
                                        const quantity = item.totalQuantity ?? 0;
                                        const percentage = percentages[index];
                                        
                                        return (
                                            <tr key={index}>
                                                <td style={{ fontSize: '0.85rem' }}>
                                                    {item.categoryName || '-'}
                                                </td>
                                                <td className="text-end" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3b82f6' }}>
                                                    {formatPrice(revenue)}
                                                </td>
                                                <td className="text-end" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10b981' }}>
                                                    {formatNumber(quantity)}
                                                </td>
                                                <td className="text-end" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f59e0b' }}>
                                                    {percentage}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td className="fw-bold">Total</td>
                                        <td className="text-end fw-bold" style={{ color: '#3b82f6' }}>
                                            {formatPrice(totalRevenue)}
                                        </td>
                                        <td className="text-end fw-bold" style={{ color: '#10b981' }}>
                                            {formatNumber(aggregatedData.reduce((sum, item) => sum + (item.totalQuantity ?? 0), 0))}
                                        </td>
                                        <td className="text-end fw-bold">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Le reste des fonctions (aggregateOrdersByCategory, getProductCategory) reste identique
function aggregateOrdersByCategory(orders) {
    const categoryMap = new Map();

    orders.forEach(order => {
        const isValidOrder = order.paymentStatus === 'paid' || 
                             order.orderStatus === 'livree' || 
                             order.orderStatus === 'confirmee';
        
        if (!isValidOrder) return;

        order.items.forEach(item => {
            const productName = item.productName;
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const revenue = quantity * price;
            
            let category = getProductCategory(productName);
            
            if (item.category) {
                category = item.category;
            }

            if (categoryMap.has(category)) {
                const existing = categoryMap.get(category);
                existing.totalRevenue += revenue;
                existing.totalQuantity += quantity;
            } else {
                categoryMap.set(category, {
                    categoryName: category,
                    totalRevenue: revenue,
                    totalQuantity: quantity
                });
            }
        });
    });

    let result = Array.from(categoryMap.values());
    result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return result.slice(0, 10);
}

function getProductCategory(productName) {
    if (!productName) return 'Autres';
    
    if (productName.includes('PC1 Baby CNC')) return 'Tours CNC Éducation';
    if (productName.includes('De2-Ultra Mini CNC')) return 'Tours CNC Éducation';
    if (productName.includes('De4-Eco')) return 'Tours CNC Éducation';
    if (productName.includes('De4-Pro')) return 'Tours CNC Éducation';
    if (productName.includes('De6')) return 'Tours CNC Éducation';
    if (productName.includes('De8')) return 'Tours CNC Éducation';
    if (productName.includes('CK6140') || productName.includes('CK6180')) return 'Tours CNC Industriels';
    if (productName.includes('Mini CNC Lathe 3040')) return 'Mini Tours CNC';
    if (productName.includes('Fa2-Ultra')) return 'Fraiseuses CNC Éducation';
    if (productName.includes('PX1 Baby')) return 'Fraiseuses CNC Éducation';
    if (productName.includes('Fa4-Eco')) return 'Fraiseuses CNC Éducation';
    if (productName.includes('XK7136')) return 'Fraiseuses CNC Industrielles';
    if (productName.includes('Desktop CNC Mill 6040')) return 'Mini Fraiseuses';
    if (productName.includes('5-Axis')) return 'Fraiseuses 5 Axes';
    if (productName.includes('CO2 Laser')) return 'Découpeuses Laser';
    if (productName.includes('Fiber Laser Marking')) return 'Marqueuses Laser';
    if (productName.includes('Diode Laser Engraver')) return 'Graveuses Laser';
    if (productName.includes('Industrial SLA')) return 'Imprimantes 3D Industrielles';
    if (productName.includes('Creality Ender')) return 'Imprimantes 3D Grand Public';
    if (productName.includes('Resin 3D Printer')) return 'Imprimantes 3D Résine';
    if (productName.includes('Articulated Industrial Robot')) return 'Robots Industriels';
    if (productName.includes('SCARA Robot')) return 'Robots SCARA';
    if (productName.includes('Cobot Collaborative')) return 'Robots Collaboratifs';
    if (productName.includes('4th Axis Rotary Table')) return 'Accessoires CNC';
    if (productName.includes('CNC Dust Collector')) return 'Systèmes de Dépoussiérage';
    if (productName.includes('Hydraulic Vise')) return 'Étaux et Bridages';
    if (productName.includes('CNC Tooling Set')) return 'Outils de Coupe';
    if (productName.includes('PTL')) return 'Accessoires Labo';
    if (productName.includes('ACL-7000')) return 'Équipement Pédagogique';
    if (productName.includes('M21-7100')) return 'Équipement Pédagogique';
    if (productName.includes('F1-3')) return 'Équipement Pédagogique';
    
    return 'Autres Produits';
}