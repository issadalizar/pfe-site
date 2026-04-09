import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

export default function MonthComparisonTable({ data, formatPrice }) {
    // Calculer l'évolution pour chaque mois par rapport au mois précédent
    const monthlyComparisons = data.map((item, index) => {
        if (index === 0) {
            return {
                month: item.month,
                revenue: item.revenue,
                evolution: null,
                trend: null
            };
        }
        const previousRevenue = data[index - 1].revenue;
        const currentRevenue = item.revenue;
        const evolution = previousRevenue === 0 ? 0 : ((currentRevenue - previousRevenue) / previousRevenue * 100);
        const trend = evolution > 0 ? 'up' : evolution < 0 ? 'down' : 'stable';
        
        return {
            month: item.month,
            revenue: item.revenue,
            evolution: evolution,
            trend: trend
        };
    });

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    Comparaison Mois par Mois
                </h6>
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ fontSize: '0.75rem', color: '#64748b' }}>Mois</th>
                                <th style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Chiffre d'affaires</th>
                                <th style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>Évolution vs mois précédent</th>
                                <th style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>Tendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyComparisons.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                        {item.month}
                                    </td>
                                    <td style={{ fontSize: '0.85rem', textAlign: 'right', fontWeight: 600, color: '#4361ee' }}>
                                        {formatPrice(item.revenue)} DT
                                    </td>
                                    <td style={{ 
                                        fontSize: '0.85rem', 
                                        textAlign: 'right', 
                                        fontWeight: 600,
                                        color: item.evolution > 0 ? '#16a34a' : item.evolution < 0 ? '#dc2626' : '#64748b'
                                    }}>
                                        {item.evolution !== null ? (
                                            <>
                                                {item.evolution > 0 ? '+' : ''}{item.evolution.toFixed(2)}%
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item.trend === 'up' && (
                                            <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
                                                <FaArrowUp className="me-1" size={10} />
                                                Croissance
                                            </span>
                                        )}
                                        {item.trend === 'down' && (
                                            <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1">
                                                <FaArrowDown className="me-1" size={10} />
                                                Baisse
                                            </span>
                                        )}
                                        {item.trend === 'stable' && item.evolution !== null && (
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">
                                                <FaMinus className="me-1" size={10} />
                                                Stable
                                            </span>
                                        )}
                                        {item.evolution === null && (
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">
                                                Premier mois
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}