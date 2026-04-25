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

export default function MonthlyBarChart({ data, title }) {
    // Calculer l'évolution en pourcentage pour chaque mois
    const percentages = data.map((item, index) => {
        if (index === 0) return 0;
        const previousRevenue = data[index - 1].revenue;
        const currentRevenue = item.revenue;
        if (previousRevenue === 0) return 0;
        return ((currentRevenue - previousRevenue) / previousRevenue * 100);
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
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
                            if (context.dataset.label === 'Évolution (%)') {
                                label += context.parsed.y.toFixed(2) + '%';
                                if (context.parsed.y > 0) {
                                    label += ' 📈';
                                } else if (context.parsed.y < 0) {
                                    label += ' 📉';
                                }
                            } else {
                                label += new Intl.NumberFormat('fr-TN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(context.parsed.y) + ' DT';
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Évolution (%)',
                    font: { size: 11 }
                },
                ticks: {
                    callback: function(value) {
                        return value.toFixed(0) + '%';
                    },
                    font: { size: 10 }
                },
                grid: {
                    color: '#e2e8f0'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Mois',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 }
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const chartData = {
        labels: data.map(item => item.month),
        datasets: [
            {
                label: 'Évolution (%)',
                data: percentages,
                backgroundColor: percentages.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                borderColor: percentages.map(p => p >= 0 ? '#16a34a' : '#dc2626'),
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                datalabels: {
                    display: false
                }
            }
        ]
    };

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    {title || "Évolution mensuelle du chiffre d'affaires (%)"}
                </h6>
                <div style={{ height: '400px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
}