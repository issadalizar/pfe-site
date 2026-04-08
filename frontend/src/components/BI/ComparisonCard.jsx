import React from 'react';

export default function ComparisonCard({ 
    currentMonth, 
    previousMonth, 
    metricName,
    formatValue = (v) => v.toLocaleString()
}) {
    const evolution = ((currentMonth - previousMonth) / previousMonth * 100);
    const isPositive = evolution > 0;

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Comparaison {metricName}
                </h6>
                
                <div className="row g-3">
                    <div className="col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#f0f9ff' }}>
                            <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Mois actuel</p>
                            <h4 className="fw-bold mb-0" style={{ color: '#4361ee', fontSize: '1.3rem' }}>
                                {formatValue(currentMonth)}
                            </h4>
                            <small className="text-muted">(en cours)</small>
                        </div>
                    </div>
                    
                    <div className="col-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                            <p className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Mois précédent</p>
                            <h4 className="fw-bold mb-0" style={{ color: '#64748b', fontSize: '1.3rem' }}>
                                {formatValue(previousMonth)}
                            </h4>
                            <small className="text-muted">(complet)</small>
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-2 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Évolution</span>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: isPositive ? '#16a34a' : '#dc2626'
                        }}>
                            {isPositive ? '+' : ''}{evolution.toFixed(1)}%
                        </span>
                    </div>
                    <div className="progress mt-2" style={{ height: '6px' }}>
                        <div 
                            className="progress-bar" 
                            role="progressbar"
                            style={{
                                width: `${Math.min(Math.abs(evolution), 100)}%`,
                                backgroundColor: isPositive ? '#16a34a' : '#dc2626'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}