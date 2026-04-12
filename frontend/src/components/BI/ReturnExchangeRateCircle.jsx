import React from 'react';

export default function ReturnExchangeRateCircle({ product }) {
    const {
        productName,
        totalSoldQuantity,
        returnQuantity,
        exchangeQuantity,
        totalRate,
        returnRate,
        exchangeRate
    } = product;

    const radius = 56;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = Math.min(Math.max(totalRate, 0), 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const shortName = productName.length > 32
        ? `${productName.slice(0, 32)}...`
        : productName;

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
                            <circle
                                cx="60"
                                cy="60"
                                r={normalizedRadius}
                                fill="transparent"
                                stroke="#e2e8f0"
                                strokeWidth={stroke}
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r={normalizedRadius}
                                fill="transparent"
                                stroke="#2563eb"
                                strokeWidth={stroke}
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 60 60)"
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                            <div className="text-center">
                                <div className="fw-bold" style={{ fontSize: '1rem' }}>{progress.toFixed(0)}%</div>
                                <small className="text-muted">Retour+Échange</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-danger">
                            Retour {returnRate.toFixed(1)}%
                        </span>
                        <span className="badge bg-info text-dark">
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
