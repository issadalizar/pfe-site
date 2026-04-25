// /src/components/BI/NewClientsChart.jsx
import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { FaCalendarAlt, FaList, FaChartLine } from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

export default function NewClientsChart({ regionData = [], newClientsByMonthAndRegion = {}, availableMonths = [] }) {
    const [selectedMonthForChart, setSelectedMonthForChart] = useState(null);
    const [showAllMonths, setShowAllMonths] = useState(false);

    React.useEffect(() => {
        if (availableMonths.length > 0 && !selectedMonthForChart && !showAllMonths) {
            setSelectedMonthForChart(availableMonths[availableMonths.length - 1]);
        }
    }, [availableMonths, showAllMonths]);

    // Debug: Afficher la structure des données
    React.useEffect(() => {
        console.log('📊 newClientsByMonthAndRegion:', newClientsByMonthAndRegion);
        console.log('📅 availableMonths:', availableMonths);
        console.log('📍 regionData:', regionData);
    }, [newClientsByMonthAndRegion, availableMonths, regionData]);

    const formatMonthName = (monthKey) => {
        if (!monthKey) return '';
        const [year, month] = monthKey.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const getNewClientsChartData = () => {
        if (!selectedMonthForChart || !newClientsByMonthAndRegion) {
            return { labels: [], datasets: [] };
        }
        
        const regions = regionData.map(r => r.region);
        const newClientsCounts = regions.map(region => 
            newClientsByMonthAndRegion[region]?.[selectedMonthForChart] || 0
        );
        
        const filteredRegions = [];
        const filteredCounts = [];
        
        for (let i = 0; i < regions.length; i++) {
            if (newClientsCounts[i] > 0) {
                filteredRegions.push(regions[i]);
                filteredCounts.push(newClientsCounts[i]);
            }
        }
        
        return {
            labels: filteredRegions,
            datasets: [{
                label: `Nouveaux clients - ${formatMonthName(selectedMonthForChart)}`,
                data: filteredCounts,
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: '#4f46e5',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            }]
        };
    };

    const getAllMonthsChartData = () => {
        if (availableMonths.length === 0) {
            console.log('⚠️ Aucun mois disponible');
            return { labels: [], datasets: [] };
        }
        
        console.log('🔍 Calcul des totaux par mois...');
        
        const totalByMonth = availableMonths.map(month => {
            let total = 0;
            
            // Vérifier la structure de newClientsByMonthAndRegion
            if (regionData && regionData.length > 0) {
                regionData.forEach(region => {
                    const regionName = region.region;
                    const regionDataByMonth = newClientsByMonthAndRegion[regionName];
                    
                    if (regionDataByMonth) {
                        const value = regionDataByMonth[month] || 0;
                        total += value;
                        if (value > 0) {
                            console.log(`✅ ${regionName} - ${month}: ${value}`);
                        }
                    } else {
                        console.log(`⚠️ Pas de données pour la région: ${regionName}`);
                    }
                });
            } else {
                console.log('⚠️ Aucune région disponible');
            }
            
            return total;
        });
        
        console.log('📊 Totaux par mois:', totalByMonth);
        
        return {
            labels: availableMonths.map(month => formatMonthName(month)),
            datasets: [{
                label: 'Nouveaux clients',
                data: totalByMonth,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true
            }]
        };
    };

    // Version alternative pour debugger la structure des données
    const getAllMonthsChartDataAlternative = () => {
        // Si la structure est différente, essayons de la détecter
        console.log('🔍 Structure de newClientsByMonthAndRegion:', Object.keys(newClientsByMonthAndRegion));
        
        // Vérifier si la structure est inversée (mois -> région au lieu de région -> mois)
        const firstKey = Object.keys(newClientsByMonthAndRegion)[0];
        if (firstKey && firstKey.includes('-')) {
            // Structure semble être mois -> région
            console.log('🔄 Détection: Structure mois -> région');
            const totalByMonth = availableMonths.map(month => {
                let total = 0;
                const monthData = newClientsByMonthAndRegion[month];
                if (monthData && typeof monthData === 'object') {
                    Object.values(monthData).forEach(value => {
                        total += value || 0;
                    });
                }
                return total;
            });
            
            console.log('📊 Totaux (structure alternative):', totalByMonth);
            
            return {
                labels: availableMonths.map(month => formatMonthName(month)),
                datasets: [{
                    label: 'Nouveaux clients',
                    data: totalByMonth,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3,
                    fill: true
                }]
            };
        }
        
        return null;
    };

    const newClientsChartOptions = {
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
                        return `${context.dataset.label}: ${context.parsed.y} client${context.parsed.y > 1 ? 's' : ''}`;
                    }
                }
            },
            datalabels: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre de nouveaux clients",
                    font: { size: 11 }
                },
                ticks: {
                    stepSize: 1,
                    font: { size: 10 }
                },
                grid: { color: '#e2e8f0' }
            },
            x: {
                title: {
                    display: true,
                    text: 'Régions',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: { display: false }
            }
        }
    };

    const allMonthsChartOptions = {
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
                        return `${context.dataset.label}: ${context.parsed.y} client${context.parsed.y > 1 ? 's' : ''}`;
                    }
                }
            },
            datalabels: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre de nouveaux clients",
                    font: { size: 11 }
                },
                ticks: {
                    stepSize: 1,
                    font: { size: 10 }
                },
                grid: { color: '#e2e8f0' }
            },
            x: {
                title: {
                    display: true,
                    text: 'Mois',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: { display: false }
            }
        }
    };

    // Obtenir les données du graphique en essayant d'abord la structure standard, puis l'alternative
    let chartData = getAllMonthsChartData();
    let useAlternative = false;
    
    // Vérifier si toutes les données sont à 0
    const allZero = chartData.datasets[0]?.data.every(val => val === 0);
    if (allZero && availableMonths.length > 0) {
        const alternativeData = getAllMonthsChartDataAlternative();
        if (alternativeData && alternativeData.datasets[0]?.data.some(val => val > 0)) {
            chartData = alternativeData;
            useAlternative = true;
            console.log('✅ Utilisation de la structure alternative');
        }
    }

    return (
        <div>
            {availableMonths.length > 0 && (
                <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                        <label className="form-label fw-semibold mb-0">
                            <FaCalendarAlt className="me-2" /> 
                            Sélectionner un mois :
                        </label>
                        <button 
                            className={`btn btn-sm ${showAllMonths ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => {
                                setShowAllMonths(true);
                                setSelectedMonthForChart(null);
                            }}
                        >
                            <FaList className="me-1" /> Tous les mois
                        </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {availableMonths.map(month => (
                            <button
                                key={month}
                                className={`btn btn-sm ${!showAllMonths && selectedMonthForChart === month ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => {
                                    setShowAllMonths(false);
                                    setSelectedMonthForChart(month);
                                }}
                            >
                                {formatMonthName(month)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {showAllMonths ? (
                <>
                    <div style={{ height: '500px' }}>
                        {chartData.labels.length > 0 && chartData.datasets[0]?.data.some(val => val > 0) ? (
                            <Line data={chartData} options={allMonthsChartOptions} />
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted mb-2">Aucune donnée disponible pour la période</p>
                                <small className="text-muted">
                                    {useAlternative ? 
                                        "Structure alternative détectée mais aucune donnée trouvée" : 
                                        "Vérifiez que les données sont correctement formatées"}
                                </small>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <small className="text-muted">
                            Évolution mensuelle du nombre de nouveaux clients (toutes régions confondues)
                        </small>
                    </div>
                    {chartData.labels.length > 0 && chartData.datasets[0]?.data.some(val => val > 0) && (
                        <div className="mt-4">
                            <h6 className="fw-semibold mb-3">Récapitulatif mensuel</h6>
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mois</th>
                                            <th className="text-center">Nouveaux clients</th>
                                            <th className="text-center">% du total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartData.labels.map((label, index) => {
                                            const count = chartData.datasets[0].data[index];
                                            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                            return (
                                                <tr key={index}>
                                                    <td>{label}</td>
                                                    <td className="text-center fw-semibold">{count}</td>
                                                    <td className="text-center">
                                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                                            <div className="progress flex-grow-1" style={{ height: '5px', maxWidth: '80px' }}>
                                                                <div 
                                                                    className="progress-bar" 
                                                                    style={{ width: `${percentage}%`, backgroundColor: '#4f46e5' }}
                                                                ></div>
                                                            </div>
                                                            <span className="small">{percentage}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div style={{ height: '500px' }}>
                        {getNewClientsChartData().labels.length > 0 ? (
                            <Bar data={getNewClientsChartData()} options={newClientsChartOptions} />
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted">
                                    Aucun nouveau client pour {selectedMonthForChart ? formatMonthName(selectedMonthForChart) : 'cette période'}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <small className="text-muted">
                            Nombre de nouveaux clients inscrits par région pour le mois sélectionné
                            {selectedMonthForChart && ` (${formatMonthName(selectedMonthForChart)})`}
                        </small>
                    </div>
                </>
            )}
        </div>
    );
}