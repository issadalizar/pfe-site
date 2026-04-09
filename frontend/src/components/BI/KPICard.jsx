import React from 'react';

export default function KPICard({ title, value, evolution, icon, color }) {
    const isPositive = evolution > 0;
    const evolutionColor = isPositive ? '#16a34a' : '#dc2626';
    const evolutionIcon = isPositive ? '↑' : '↓';

    return (
        <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{title}</p>
                        <h3 className="fw-bold mb-0" style={{ color: color || '#4361ee' }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </h3>
                    </div>
                    <div style={{
                        width: '45px', height: '45px', borderRadius: '12px',
                        background: `${color || '#4361ee'}15`, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: color || '#4361ee', fontSize: '1.2rem'
                    }}>
                        {icon}
                    </div>
                </div>
                {evolution !== undefined && evolution !== null && (
                    <div className="d-flex align-items-center gap-2">
                        <span style={{
                            color: evolutionColor,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                        }}>
                            {evolutionIcon} {Math.abs(evolution).toFixed(1)}%
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            vs mois précédent
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}