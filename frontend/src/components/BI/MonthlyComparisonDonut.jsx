import React, { useState, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { FaArrowUp, FaArrowDown, FaMinus, FaFilter } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ─── Un seul donut pour une paire current / previous avec filtrage ─── */
function DonutPair({ current, previous, formatPrice, onFilterChange, activeFilters }) {
    const currentRev  = current.revenue;
    const previousRev = previous.revenue;
    const total       = currentRev + previousRev;

    // Vérifier si chaque mois est actif dans les filtres
    const isCurrentActive = activeFilters?.includes(current.monthKey);
    const isPreviousActive = activeFilters?.includes(previous.monthKey);
    
    // Si un des deux mois est filtré, ajuster l'affichage
    const showCurrent = !activeFilters || activeFilters.length === 0 || isCurrentActive;
    const showPrevious = !activeFilters || activeFilters.length === 0 || isPreviousActive;
    
    // Calculer les revenus à afficher (0 si filtré)
    const displayCurrentRev = showCurrent ? currentRev : 0;
    const displayPreviousRev = showPrevious ? previousRev : 0;
    const displayTotal = displayCurrentRev + displayPreviousRev;

    // Évolution en % (basée sur les données réelles, pas filtrées)
    const evolution = previousRev > 0
        ? ((currentRev - previousRev) / previousRev * 100)
        : 0;

    const isPositive = evolution > 0;
    const isStable   = Math.abs(evolution) < 0.01;

    // Couleurs avec transparence pour les éléments filtrés
    const colorCurrent  = isStable ? '#94a3b8' : isPositive ? '#26c6b0' : '#f06292';
    const colorPrevious = '#c8d6e5';
    
    const colorCurrentDisplay = showCurrent ? colorCurrent : `${colorCurrent}40`;
    const colorPreviousDisplay = showPrevious ? colorPrevious : `${colorPrevious}40`;

    const pctCurrent  = displayTotal > 0 ? (displayCurrentRev  / displayTotal * 100).toFixed(1) : 0;
    const pctPrevious = displayTotal > 0 ? (displayPreviousRev / displayTotal * 100).toFixed(1) : 0;

    // Gestionnaire de clic sur le graphique
    const handleClick = useCallback((event, activeElements, chart) => {
        if (activeElements.length === 0) return;
        
        const dataIndex = activeElements[0].dataIndex;
        const monthToToggle = dataIndex === 0 ? current.monthKey : previous.monthKey;
        
        onFilterChange(monthToToggle);
    }, [current.monthKey, previous.monthKey, onFilterChange]);

    const chartData = {
        labels: [current.month, previous.month],
        datasets: [{
            data: displayTotal > 0 ? [displayCurrentRev, displayPreviousRev] : [1, 1],
            backgroundColor: [colorCurrentDisplay, colorPreviousDisplay],
            borderColor: ['#fff', '#fff'],
            borderWidth: 3,
            hoverOffset: 6,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        onClick: handleClick,
        plugins: {
             datalabels: { display: false }, 
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const originalRev = ctx.dataIndex === 0 ? currentRev : previousRev;
                        const isFiltered = (ctx.dataIndex === 0 && !showCurrent) || (ctx.dataIndex === 1 && !showPrevious);
                        const label = ` ${ctx.label} : ${formatPrice(originalRev)} DT (${ctx.dataIndex === 0 ? pctCurrent : pctPrevious}%)`;
                        return isFiltered ? `${label} ⚠️ (masqué)` : label;
                    }
                }
            }
        }
    };

    // Indicateur de filtre actif sur ce donut
    const hasActiveFilter = (activeFilters?.length || 0) > 0;
    const isPartiallyFiltered = (showCurrent !== showPrevious) && hasActiveFilter;
    const isBothFiltered = !showCurrent && !showPrevious && hasActiveFilter;

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            border: `2px solid ${colorCurrent}22`,
            transition: 'transform 0.15s, box-shadow 0.15s',
            opacity: isBothFiltered ? 0.5 : 1,
            position: 'relative'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
        >
            {/* Badge de filtre actif */}
            {isPartiallyFiltered && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#f59e0b',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FaFilter size={8} />
                    Filtré
                </div>
            )}

            {/* Titre de la paire */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {current.month} <span style={{ color: '#cbd5e1' }}>vs</span> {previous.month}
                {hasActiveFilter && (
                    <span 
                        onClick={(e) => {
                            e.stopPropagation();
                            onFilterChange(null, true); // Clear filters for this pair
                        }}
                        style={{ 
                            marginLeft: '8px', 
                            cursor: 'pointer', 
                            color: '#ef4444',
                            fontSize: '9px',
                            fontWeight: 600
                        }}
                    >
                        ✕
                    </span>
                )}
            </div>

            {/* Donut + badge central */}
            <div style={{ position: 'relative', width: '130px', height: '130px', cursor: 'pointer' }}>
                <Doughnut data={chartData} options={options} />
                {/* Badge central : évolution */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center', pointerEvents: 'none'
                }}>
                    <div style={{
                        fontSize: '16px', fontWeight: 800,
                        color: isStable ? '#94a3b8' : isPositive ? '#26c6b0' : '#f06292',
                        lineHeight: 1.1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'
                    }}>
                        {isStable ? <FaMinus size={12} /> : isPositive ? <FaArrowUp size={11} /> : <FaArrowDown size={11} />}
                        {Math.abs(evolution).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>évolution</div>
                </div>
            </div>

            {/* Légende des 2 mois avec indicateur de filtre */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* Mois actuel */}
                <div 
                    onClick={() => onFilterChange(current.monthKey)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '7px', 
                        fontSize: '11px',
                        cursor: 'pointer',
                        opacity: showCurrent ? 1 : 0.5,
                        transition: 'opacity 0.2s'
                    }}
                >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colorCurrent, flexShrink: 0 }} />
                    <span style={{ color: '#334155', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {current.month}
                        {!showCurrent && <span style={{ marginLeft: '4px', fontSize: '9px', color: '#ef4444' }}>(masqué)</span>}
                    </span>
                    <span style={{ color: colorCurrent, fontWeight: 800, whiteSpace: 'nowrap' }}>{pctCurrent}%</span>
                </div>
                {/* Mois précédent */}
                <div 
                    onClick={() => onFilterChange(previous.monthKey)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '7px', 
                        fontSize: '11px',
                        cursor: 'pointer',
                        opacity: showPrevious ? 1 : 0.5,
                        transition: 'opacity 0.2s'
                    }}
                >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colorPrevious, flexShrink: 0 }} />
                    <span style={{ color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {previous.month}
                        {!showPrevious && <span style={{ marginLeft: '4px', fontSize: '9px', color: '#ef4444' }}>(masqué)</span>}
                    </span>
                    <span style={{ color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>{pctPrevious}%</span>
                </div>
            </div>

            {/* Montants */}
            <div style={{
                width: '100%', borderTop: '1px solid #f1f5f9',
                paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: '#64748b' }}>Actuel :</span>
                    <span style={{ fontWeight: 700, color: colorCurrent }}>
                        {showCurrent ? `${formatPrice(currentRev)} DT` : 'masqué'}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: '#64748b' }}>Précédent :</span>
                    <span style={{ fontWeight: 600, color: '#94a3b8' }}>
                        {showPrevious ? `${formatPrice(previousRev)} DT` : 'masqué'}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Composant principal : grille de donuts avec gestion des filtres ─── */
export default function MonthComparisonDonut({ data, formatPrice }) {
    // Stocker les filtres actifs par donut (par paire de mois)
    const [filters, setFilters] = useState({});

    const handleFilterChange = useCallback((pairKey, monthKey, clearAll = false) => {
        if (clearAll) {
            setFilters(prev => ({ ...prev, [pairKey]: [] }));
            return;
        }
        
        setFilters(prev => {
            const currentFilters = prev[pairKey] || [];
            let newFilters;
            
            if (currentFilters.includes(monthKey)) {
                // Retirer le filtre
                newFilters = currentFilters.filter(m => m !== monthKey);
            } else {
                // Ajouter le filtre
                newFilters = [...currentFilters, monthKey];
            }
            
            return { ...prev, [pairKey]: newFilters };
        });
    }, []);

    // Construire les paires : index N vs N-1 (les 4 derniers mois = 4 paires max)
    const pairs = [];
    for (let i = data.length - 1; i >= 1; i--) {
        const pairKey = `${data[i].monthKey}-${data[i-1].monthKey}`;
        pairs.push({ 
            current: data[i], 
            previous: data[i-1],
            pairKey: pairKey
        });
        if (pairs.length === 4) break;
    }

    if (pairs.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                Données insuffisantes (minimum 2 mois requis)
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(pairs.length, 4)}, 1fr)`,
            gap: '14px',
        }}>
            {pairs.map(({ current, previous, pairKey }) => (
                <DonutPair
                    key={pairKey}
                    current={current}
                    previous={previous}
                    formatPrice={formatPrice}
                    activeFilters={filters[pairKey]}
                    onFilterChange={(monthKey, clearAll) => handleFilterChange(pairKey, monthKey, clearAll)}
                />
            ))}
        </div>
    );
}