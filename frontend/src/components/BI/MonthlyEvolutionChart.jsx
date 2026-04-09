import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function MonthlyEvolutionChart({ data, title, yAxisLabel = "Montant (DT)" }) {
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
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('fr-TN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(context.parsed.y) + ' DT';
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
                    text: yAxisLabel,
                    font: { size: 11 }
                },
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString() + ' DT';
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
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    const chartData = {
        labels: data.map(item => item.month),
        datasets: [
            {
                label: 'Chiffre d\'affaires',
                data: data.map(item => item.revenue),
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.05)',
                borderWidth: 2,
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            },
            {
                label: 'Nombre de commandes',
                data: data.map(item => item.orderCount),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                borderWidth: 2,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3,
                yAxisID: 'y'
            }
        ]
    };

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    {title}
                </h6>
                <div style={{ height: '350px' }}>
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
}