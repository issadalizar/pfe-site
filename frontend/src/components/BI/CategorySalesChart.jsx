import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function CategorySalesChart({ data = [], title }) {
    const formattedData = Array.isArray(data) ? data : [];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
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
                                label += context.parsed.y.toLocaleString('fr-FR') + ' unités';
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
                    text: 'Valeur',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 }
                },
                grid: {
                    color: '#e2e8f0'
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
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const chartData = {
        labels: formattedData.map(item =>
            item.categoryName && item.categoryName.length > 15
                ? item.categoryName.substring(0, 15) + '...'
                : item.categoryName || ''
        ),
        datasets: [
            {
                label: "Chiffre d'affaires (DT)",
                data: formattedData.map(item => item.totalRevenue ?? 0),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                yAxisID: 'y'
            },
            {
                label: 'Quantité vendue',
                data: formattedData.map(item => item.totalQuantity ?? 0),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                yAxisID: 'y'
            }
        ]
    };

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    {title || "Catégories les plus vendues"}
                </h6>
                <div style={{ height: '400px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
}
