// /src/components/BI/OrderStatusDonut.jsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
    en_attente: '#f8b4c0',  // Rose clair
    confirmee: '#c084fc',   // Lavande
    expediee: '#60a5fa',    // Bleu doux
    livree: '#f472b6',      // Rose vif
    annulee: '#fca5a5'      // Corail doux
};

const STATUS_NAMES = {
    en_attente: 'En attente',
    confirmee: 'Confirmée',
    expediee: 'Expédiée',
    livree: 'Livrée',
    annulee: 'Annulée'
};

export default function OrderStatusDonut({ orders = [] }) {
    const statusData = useMemo(() => {
        const stats = {
            en_attente: { count: 0, amount: 0 },
            confirmee: { count: 0, amount: 0 },
            expediee: { count: 0, amount: 0 },
            livree: { count: 0, amount: 0 },
            annulee: { count: 0, amount: 0 }
        };

        orders.forEach(order => {
            if (!order || !order._id) return;
            
            const status = order.orderStatus || 'en_attente';
            
            if (stats[status]) {
                stats[status].count += 1;
                stats[status].amount += order.totalAmount || 0;
            } else {
                stats.en_attente.count += 1;
                stats.en_attente.amount += order.totalAmount || 0;
            }
        });

        return stats;
    }, [orders]);

    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const activeStatuses = Object.entries(statusData)
        .filter(([_, data]) => data.count > 0);

    if (activeStatuses.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted mb-0">Aucune commande disponible</p>
            </div>
        );
    }

    const chartData = {
        labels: activeStatuses.map(([key]) => STATUS_NAMES[key] || key),
        datasets: [
            {
                data: activeStatuses.map(([_, data]) => data.count),
                backgroundColor: activeStatuses.map(([key]) => STATUS_COLORS[key] || '#e9d5ff'),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 11 },
                    boxWidth: 12,
                    padding: 10,
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
                        return `${label}: ${value} commandes (${percentage}%)`;
                    }
                }
            }
        }
    };

    const totalOrders = Object.values(statusData).reduce((sum, item) => sum + item.count, 0);
    const totalAmount = Object.values(statusData).reduce((sum, item) => sum + item.amount, 0);
    const confirmedOrders = (statusData.confirmee?.count || 0) + (statusData.livree?.count || 0);
    const pendingOrders = statusData.en_attente?.count || 0;
    const cancelledOrders = statusData.annulee?.count || 0;
    const shippedOrders = statusData.expediee?.count || 0;
    const confirmationRate = totalOrders > 0 ? (confirmedOrders / totalOrders * 100).toFixed(1) : 0;

    return (
        <div>
            <div className="row align-items-center">
                {/* Colonne du donut - gauche */}
                <div className="col-md-7">
                    <div style={{ height: '280px' }}>
                        <Doughnut data={chartData} options={options} />
                    </div>
                </div>
                
                {/* Colonne des statistiques - droite */}
                <div className="col-md-5">
                    <div className="ps-md-3">
                        {/* Statistiques principales */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#fce4ec' }}>
                                <span className="small" style={{ color: '#6b7280', fontWeight: '500' }}>Total commandes:</span>
                                <span className="fw-semibold">{totalOrders}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#fce4ec' }}>
                                <span className="small" style={{ color: '#6b7280', fontWeight: '500' }}>Montant total:</span>
                                <span className="fw-semibold" style={{ color: '#c084fc' }}>{formatPrice(totalAmount)} DT</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#fce4ec' }}>
                                <span className="small" style={{ color: '#6b7280', fontWeight: '500' }}>Taux de confirmation:</span>
                                <span className="fw-semibold" style={{ color: '#10b981' }}>{confirmationRate}%</span>
                            </div>
                        </div>
                        
                        {/* Légende des statuts */}
                        <div className="mt-2">
                            <small className="text-muted d-block mb-2">Répartition par statut:</small>
                            {activeStatuses.map(([key]) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <div 
                                            className="rounded-circle me-2" 
                                            style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                backgroundColor: STATUS_COLORS[key] || '#e9d5ff'
                                            }}
                                        ></div>
                                        <span className="small">{STATUS_NAMES[key]}</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="small fw-semibold">{statusData[key].count}</span>
                                        <span className="small text-muted ms-1">
                                            ({((statusData[key].count / totalOrders) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}