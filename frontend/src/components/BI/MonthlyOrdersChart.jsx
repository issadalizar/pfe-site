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

export default function MonthlyOrdersChart({ data, title }) {
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
                            label += context.parsed.y.toLocaleString('fr-FR');
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
                    text: 'Nombre de commandes',
                    font: { size: 11 }
                },
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString('fr-FR');
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
                label: 'Commandes',
                data: data.map(item => item.orderCount),
                backgroundColor: 'rgba(67, 97, 238, 0.75)',
                borderColor: '#4361ee',
                borderWidth: 1,
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7
            }
        ]
    };

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    {title || 'Nombre de commandes par mois'}
                </h6>
                <div style={{ height: '420px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
}
