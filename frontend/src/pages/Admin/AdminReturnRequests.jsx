import React, { useState, useEffect } from 'react';
import {
    FaExchangeAlt, FaSearch, FaCheckCircle, FaTimesCircle,
    FaSpinner, FaBox, FaUser, FaEnvelope,
    FaChevronDown, FaChevronUp, FaCalendarAlt,
    FaClipboardList, FaUndoAlt, FaSyncAlt, FaClock
} from 'react-icons/fa';
import { getAllReturnRequests, updateReturnRequestStatus } from '../../services/returnRequestService';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminReturnRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [updatingRequest, setUpdatingRequest] = useState(null);
    const [adminNotes, setAdminNotes] = useState({});

    const statusOptions = [
        { value: 'en_attente', label: 'En attente', bg: '#fef3c7', color: '#92400e', icon: <FaClock /> },
        { value: 'acceptee', label: 'Acceptée', bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle /> },
        { value: 'refusee', label: 'Refusée', bg: '#fee2e2', color: '#991b1b', icon: <FaTimesCircle /> },
    ];

    const typeOptions = [
        { value: 'retour', label: 'Retour', bg: '#fee2e2', color: '#991b1b', icon: <FaUndoAlt /> },
        { value: 'echange', label: 'Échange', bg: '#dbeafe', color: '#1e40af', icon: <FaSyncAlt /> },
    ];

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getAllReturnRequests();
            if (data.success) setRequests(data.returnRequests || []);
        } catch (err) {
            console.error('Erreur chargement demandes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleStatusUpdate = async (requestId, newStatus) => {
        setUpdatingRequest(requestId);
        try {
            const data = await updateReturnRequestStatus(requestId, newStatus, adminNotes[requestId] || '');
            if (data.success) {
                setRequests(prev => prev.map(r =>
                    r._id === requestId ? { ...r, status: newStatus, adminNote: adminNotes[requestId] || r.adminNote } : r
                ));
            }
        } catch (err) {
            console.error('Erreur mise à jour:', err);
        } finally {
            setUpdatingRequest(null);
        }
    };

    // Filtres
    const filtered = requests.filter(req => {
        const matchSearch = searchTerm === '' ||
            req._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || req.status === statusFilter;
        const matchType = typeFilter === 'all' || req.type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    // Stats
    const pendingCount = requests.filter(r => r.status === 'en_attente').length;
    const acceptedCount = requests.filter(r => r.status === 'acceptee').length;
    const refusedCount = requests.filter(r => r.status === 'refusee').length;
    const returnCount = requests.filter(r => r.type === 'retour').length;
    const exchangeCount = requests.filter(r => r.type === 'echange').length;

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between flex-wrap mb-4 gap-3">
                <div>
                    <h1 className="fw-bold">
                        <FaExchangeAlt className="me-2" style={{ color: '#dc2626' }} />
                        Demandes de Retour / Échange
                    </h1>
                    <p className="text-muted">Gérez les demandes de retour et d'échange des clients</p>
                </div>
                <button className="btn btn-primary" onClick={fetchRequests} disabled={loading}>
                    {loading ? <FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} /> : <FaExchangeAlt className="me-2" />}
                    Actualiser
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                {[
                    { title: 'Total Demandes', value: requests.length, icon: <FaClipboardList />, color: '#4361ee' },
                    { title: 'En attente', value: pendingCount, icon: <FaClock />, color: '#f59e0b' },
                    { title: 'Acceptées', value: acceptedCount, icon: <FaCheckCircle />, color: '#16a34a' },
                    { title: 'Refusées', value: refusedCount, icon: <FaTimesCircle />, color: '#dc2626' },
                ].map((stat, i) => (
                    <div key={i} className="col-md-6 col-xl-3">
                        <div className="card shadow-sm h-100 border-0">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{stat.title}</p>
                                        <h3 className="fw-bold mb-0" style={{ color: stat.color }}>{stat.value}</h3>
                                    </div>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '14px',
                                        background: `${stat.color}15`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: stat.color, fontSize: '1.3rem'
                                    }}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted" /></span>
                                <input type="text" className="form-control border-start-0"
                                    placeholder="Rechercher par ID, client, motif..."
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="all">Tous les statuts</option>
                                {statusOptions.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                <option value="all">Tous les types</option>
                                <option value="retour">Retour ({returnCount})</option>
                                <option value="echange">Échange ({exchangeCount})</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-muted" style={{ fontSize: '0.85rem' }}>
                            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="text-center py-5">
                    <FaSpinner size={32} style={{ color: '#4361ee', animation: 'spin 1s linear infinite' }} />
                    <p className="text-muted mt-3">Chargement des demandes...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                    <FaExchangeAlt size={48} style={{ color: '#cbd5e1' }} />
                    <h5 className="text-muted mt-3">Aucune demande trouvée</h5>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>REF</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CLIENT</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>COMMANDE</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TYPE</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DATE</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>STATUT</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(req => {
                                        const ss = statusOptions.find(s => s.value === req.status) || statusOptions[0];
                                        const ts = typeOptions.find(t => t.value === req.type) || typeOptions[0];
                                        const isExpanded = expandedRequest === req._id;

                                        return (
                                            <React.Fragment key={req._id}>
                                                <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedRequest(isExpanded ? null : req._id)}>
                                                    <td>
                                                        <span className="fw-bold" style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                                                            #{req._id.slice(-8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <span className="fw-medium" style={{ fontSize: '0.9rem' }}>{req.user?.client_name}</span>
                                                            <br />
                                                            <small className="text-muted">{req.user?.email}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold" style={{ color: '#4361ee', fontSize: '0.85rem' }}>
                                                            #{req.order?._id?.slice(-8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge rounded-pill px-3" style={{ backgroundColor: ts.bg, color: ts.color, fontSize: '0.75rem' }}>
                                                            {ts.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {new Date(req.createdAt).toLocaleDateString('fr-FR', {
                                                                day: '2-digit', month: 'short', year: 'numeric'
                                                            })}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className="badge rounded-pill px-3" style={{ backgroundColor: ss.bg, color: ss.color, fontSize: '0.75rem' }}>
                                                            {ss.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary"
                                                            onClick={e => { e.stopPropagation(); setExpandedRequest(isExpanded ? null : req._id); }}>
                                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan="7" style={{ backgroundColor: '#f8fafc' }}>
                                                            <div className="p-3">
                                                                <div className="row g-3">
                                                                    {/* Motif */}
                                                                    <div className="col-md-6">
                                                                        <h6 className="fw-bold mb-2"><FaClipboardList className="me-2 text-primary" />Motif</h6>
                                                                        <p className="mb-0 p-3 rounded-3" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' }}>
                                                                            {req.reason}
                                                                        </p>
                                                                    </div>

                                                                    {/* Articles */}
                                                                    <div className="col-md-6">
                                                                        <h6 className="fw-bold mb-2"><FaBox className="me-2 text-primary" />Articles concernés ({req.items?.length})</h6>
                                                                        {req.items?.map((item, idx) => (
                                                                            <div key={idx} className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                                                                                <span className="text-muted">{item.productName}</span>
                                                                                <span className="fw-medium">x{item.quantity}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Note admin */}
                                                                    <div className="col-12">
                                                                        <h6 className="fw-bold mb-2"><FaEnvelope className="me-2 text-primary" />Note admin</h6>
                                                                        <textarea
                                                                            className="form-control mb-3"
                                                                            rows="2"
                                                                            placeholder="Ajouter une note (optionnel)..."
                                                                            value={adminNotes[req._id] !== undefined ? adminNotes[req._id] : (req.adminNote || '')}
                                                                            onClick={e => e.stopPropagation()}
                                                                            onChange={e => {
                                                                                e.stopPropagation();
                                                                                setAdminNotes(prev => ({ ...prev, [req._id]: e.target.value }));
                                                                            }}
                                                                            disabled={req.status !== 'en_attente'}
                                                                            style={{ fontSize: '0.9rem' }}
                                                                        />
                                                                    </div>

                                                                    {/* Actions */}
                                                                    {req.status === 'en_attente' && (
                                                                        <div className="col-12">
                                                                            <div className="d-flex gap-2">
                                                                                <button
                                                                                    className="btn btn-success rounded-pill px-4"
                                                                                    onClick={e => { e.stopPropagation(); handleStatusUpdate(req._id, 'acceptee'); }}
                                                                                    disabled={updatingRequest === req._id}
                                                                                >
                                                                                    {updatingRequest === req._id ? (
                                                                                        <FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />
                                                                                    ) : (
                                                                                        <FaCheckCircle className="me-2" />
                                                                                    )}
                                                                                    Accepter
                                                                                </button>
                                                                                <button
                                                                                    className="btn btn-danger rounded-pill px-4"
                                                                                    onClick={e => { e.stopPropagation(); handleStatusUpdate(req._id, 'refusee'); }}
                                                                                    disabled={updatingRequest === req._id}
                                                                                >
                                                                                    {updatingRequest === req._id ? (
                                                                                        <FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />
                                                                                    ) : (
                                                                                        <FaTimesCircle className="me-2" />
                                                                                    )}
                                                                                    Refuser
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Statut final */}
                                                                    {req.status !== 'en_attente' && req.adminNote && (
                                                                        <div className="col-12">
                                                                            <div className="p-3 rounded-3" style={{
                                                                                backgroundColor: req.status === 'acceptee' ? '#f0fdf4' : '#fef2f2',
                                                                                border: `1px solid ${req.status === 'acceptee' ? '#bbf7d0' : '#fecaca'}`
                                                                            }}>
                                                                                <strong style={{ color: req.status === 'acceptee' ? '#166534' : '#991b1b' }}>
                                                                                    {req.status === 'acceptee' ? '✓ Acceptée' : '✗ Refusée'}
                                                                                </strong>
                                                                                <p className="mb-0 mt-1 text-muted" style={{ fontSize: '0.85rem' }}>{req.adminNote}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
