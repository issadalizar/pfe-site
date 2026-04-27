// PaymentMethodDonut.jsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Couleurs plus féminines (tons pastel, roses, lavande)
const COLOR_PALETTE = [
    '#f472b6',  // Rose vif
    '#c084fc',  // Lavande
    '#60a5fa',  // Bleu doux
    '#f8b4c0',  // Rose clair
    '#a78bfa',  // Violet doux
    '#fbcfe8',  // Rose pâle
    '#93c5fd',  // Bleu ciel
    '#d8b4fe',  // Lavande clair
];

export default function PaymentMethodDonut({ orders = [] }) {
    const paymentMethodData = useMemo(() => {
        const stats = {
            stripe: { count: 0, amount: 0 },
            livraison: { count: 0, amount: 0 },
            virement: { count: 0, amount: 0 }
        };

        orders.forEach(order => {
            if (order.paymentStatus === 'paid' || order.orderStatus === 'livree' || order.orderStatus === 'confirmee') {
                const method = order.paymentMethod || 'livraison';
                if (stats[method]) {
                    stats[method].count += 1;
                    stats[method].amount += order.totalAmount || 0;
                } else {
                    stats.livraison.count += 1;
                    stats.livraison.amount += order.totalAmount || 0;
                }
            }
        });

        return stats;
    }, [orders]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const methodNames = {
        stripe: 'Carte Bancaire',
        livraison: 'Paiement à la livraison',
        virement: 'Virement Bancaire'
    };

    const chartData = {
        labels: Object.entries(paymentMethodData).map(([key]) => methodNames[key] || key),
        datasets: [
            {
                data: Object.values(paymentMethodData).map(item => item.amount),
                backgroundColor: [COLOR_PALETTE[0], COLOR_PALETTE[1], COLOR_PALETTE[2]],
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
                        return `${label}: ${formatPrice(value)} DT (${percentage}%)`;
                    }
                }
            }
        }
    };

    const totalAmount = Object.values(paymentMethodData).reduce((sum, item) => sum + item.amount, 0);
    const totalOrders = Object.values(paymentMethodData).reduce((sum, item) => sum + item.count, 0);
    
    // Méthodes de paiement actives
    const activeMethods = Object.entries(paymentMethodData)
        .filter(([_, data]) => data.count > 0);

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
                                <span className="small" style={{ color: '#6b7280', fontWeight: '500' }}>
                                    Total commandes:
                                </span>
                                <span className="fw-semibold">
                                    {totalOrders}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#fce4ec' }}>
                                <span className="small" style={{ color: '#6b7280', fontWeight: '500' }}>
                                    Montant total:
                                </span>
                                <span className="fw-semibold" style={{ color: '#f472b6' }}>
                                    {formatPrice(totalAmount)} DT
                                </span>
                            </div>
                        </div>
                        
                        {/* Légende des méthodes de paiement */}
                        <div className="mt-2">
                            <small className="text-muted d-block mb-2">Répartition par méthode:</small>
                            {activeMethods.map(([key]) => (
                                <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <div 
                                            className="rounded-circle me-2" 
                                            style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                backgroundColor: COLOR_PALETTE[activeMethods.findIndex(([k]) => k === key)] || '#e9d5ff'
                                            }}
                                        ></div>
                                        <span className="small">{methodNames[key]}</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="small fw-semibold">{paymentMethodData[key].count}</span>
                                        <span className="small text-muted ms-1">
                                            ({((paymentMethodData[key].amount / totalAmount) * 100).toFixed(1)}%)
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