// /src/components/BI/ReturnExchangeDonut.jsx
import React, { useState } from 'react';

export default function ReturnExchangeDonut({ product }) {
    const {
        productName,
        totalSoldQuantity,
        returnQuantity,
        exchangeQuantity,
        returnRate,
        exchangeRate
    } = product;

    const [hoveredSection, setHoveredSection] = useState(null);

    // Dimensions du donut
    const radius = 56;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    
    const returnProgress = Math.min(Math.max(returnRate, 0), 100);
    const exchangeProgress = Math.min(Math.max(exchangeRate, 0), 100);
    
    const returnOffset = circumference - (returnProgress / 100) * circumference;
    const exchangeOffset = circumference - (exchangeProgress / 100) * circumference;

    const shortName = productName.length > 32
        ? `${productName.slice(0, 32)}...`
        : productName;

    const totalRate = returnRate + exchangeRate;

    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-between h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{shortName}</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
                            Ventes payées: {totalSoldQuantity} unité{totalSoldQuantity > 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                        <svg width="120" height="120">
                            {/* Fond */}
                            <circle
                                cx="60"
                                cy="60"
                                r={normalizedRadius}
                                fill="transparent"
                                stroke="#e2e8f0"
                                strokeWidth={stroke}
                            />
                            
                            {/* Anneau Retour */}
                            <circle
                                cx="60"
                                cy="60"
                                r={normalizedRadius}
                                fill="transparent"
                                stroke="#dc2626"
                                strokeWidth={stroke}
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={returnOffset}
                                strokeLinecap="round"
                                transform="rotate(-90 60 60)"
                                style={{
                                    transition: 'all 0.3s ease',
                                    opacity: hoveredSection === 'exchange' ? 0.3 : 1,
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={() => setHoveredSection('return')}
                                onMouseLeave={() => setHoveredSection(null)}
                            />
                            
                            {/* Anneau Échange */}
                            <circle
                                cx="60"
                                cy="60"
                                r={normalizedRadius - stroke + 4}
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth={stroke}
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={exchangeOffset}
                                strokeLinecap="round"
                                transform="rotate(-90 60 60)"
                                style={{
                                    transition: 'all 0.3s ease',
                                    opacity: hoveredSection === 'return' ? 0.3 : 1,
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={() => setHoveredSection('exchange')}
                                onMouseLeave={() => setHoveredSection(null)}
                            />
                        </svg>
                        
                        {/* Centre */}
                        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                            <div className="text-center">
                                <div className="fw-bold" style={{ fontSize: '1rem' }}>
                                    {hoveredSection === 'return' 
                                        ? returnProgress.toFixed(0)
                                        : hoveredSection === 'exchange'
                                        ? exchangeProgress.toFixed(0)
                                        : totalRate.toFixed(0)}%
                                </div>
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    {hoveredSection === 'return' 
                                        ? 'Retour'
                                        : hoveredSection === 'exchange'
                                        ? 'Échange'
                                        : 'Total'}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div className="d-flex gap-2 flex-wrap">
                        <span 
                            className="badge bg-danger"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredSection('return')}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Retour {returnRate.toFixed(1)}%
                        </span>
                        <span 
                            className="badge bg-info text-dark"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredSection('exchange')}
                            onMouseLeave={() => setHoveredSection(null)}
                        >
                            Échange {exchangeRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className="mt-3" style={{ fontSize: '0.83rem' }}>
                        <p className="mb-1 text-muted">Articles retournés: {returnQuantity}</p>
                        <p className="mb-0 text-muted">Articles échangés: {exchangeQuantity}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}