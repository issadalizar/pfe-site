import React, { useState, useEffect } from 'react';
import {
    FaShoppingCart, FaSearch, FaEye, FaCheckCircle,
    FaTruck, FaTimesCircle, FaSpinner, FaFilter,
    FaCreditCard, FaBox, FaCalendarAlt, FaUser,
    FaChevronDown, FaChevronUp, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaFileInvoice
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/orders';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [deadlines, setDeadlines] = useState({});

    const statusOptions = [
        { value: 'en_attente', label: 'En attente', bg: '#fef3c7', color: '#92400e', icon: <FaBox /> },
        { value: 'confirmee', label: 'Confirmee', bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle /> },
        { value: 'expediee', label: 'Expediee', bg: '#dbeafe', color: '#1e40af', icon: <FaTruck /> },
        { value: 'livree', label: 'Livree', bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle /> },
        { value: 'annulee', label: 'Annulee', bg: '#fee2e2', color: '#991b1b', icon: <FaTimesCircle /> },
    ];

    const paymentStatusMap = {
        pending: { label: 'En attente', bg: '#fef3c7', color: '#92400e' },
        paid: { label: 'Paye', bg: '#d1fae5', color: '#065f46' },
        failed: { label: 'Echoue', bg: '#fee2e2', color: '#991b1b' },
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setOrders(data.orders || []);
        } catch (err) {
            console.error('Erreur chargement commandes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdatingOrder(orderId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orderStatus: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
            }
        } catch (err) {
            console.error('Erreur mise a jour:', err);
        } finally {
            setUpdatingOrder(null);
        }
    };

    const saveDeadline = async (orderId) => {
        const deadline = deadlines[orderId];
        if (!deadline) return;
        setUpdatingOrder(orderId);
        try {
            const token = localStorage.getItem('token');
            const order = orders.find(o => o._id === orderId);
            const res = await fetch(`${API_URL}/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderStatus: order?.orderStatus || 'livree',
                    returnDeadline: deadline
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o =>
                    o._id === orderId ? { ...o, returnDeadline: deadline } : o
                ));
            }
        } catch (err) {
            console.error('Erreur sauvegarde deadline:', err);
        } finally {
            setUpdatingOrder(null);
        }
    };

    // Filtres
    const filtered = orders.filter(order => {
        const matchSearch = searchTerm === '' ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
        const matchPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
        return matchSearch && matchStatus && matchPayment;
    });

    // Stats
    const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
    const pendingCount = orders.filter(o => o.orderStatus === 'en_attente').length;
    const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between flex-wrap mb-4 gap-3">
                <div>
                    <h1 className="fw-bold">
                        <FaShoppingCart className="me-2" style={{ color: '#4361ee' }} />
                        Gestion des Commandes
                    </h1>
                    <p className="text-muted">Suivez et gerez toutes les commandes</p>
                </div>
                <button className="btn btn-primary" onClick={fetchOrders} disabled={loading}>
                    {loading ? <FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} /> : <FaShoppingCart className="me-2" />}
                    Actualiser
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                {[
                    { title: 'Total Commandes', value: orders.length, icon: <FaFileInvoice />, color: '#4361ee' },
                    { title: 'En attente', value: pendingCount, icon: <FaBox />, color: '#f59e0b' },
                    { title: 'Payees', value: paidCount, icon: <FaCreditCard />, color: '#16a34a' },
                    { title: 'Chiffre d\'affaires', value: `${formatPrice(totalRevenue)} DT`, icon: <FaShoppingCart />, color: '#7c3aed' },
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
                                    placeholder="Rechercher par ID, nom, email..."
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
                            <select className="form-select" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                                <option value="all">Tous les paiements</option>
                                <option value="pending">En attente</option>
                                <option value="paid">Paye</option>
                                <option value="failed">Echoue</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-muted" style={{ fontSize: '0.85rem' }}>
                            {filtered.length} resultat{filtered.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="text-center py-5">
                    <FaSpinner size={32} style={{ color: '#4361ee', animation: 'spin 1s linear infinite' }} />
                    <p className="text-muted mt-3">Chargement des commandes...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                    <FaShoppingCart size={48} style={{ color: '#cbd5e1' }} />
                    <h5 className="text-muted mt-3">Aucune commande trouvee</h5>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>COMMANDE</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CLIENT</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DATE</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PAIEMENT</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>STATUT</th>
                                        <th style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(order => {
                                        const os = statusOptions.find(s => s.value === order.orderStatus) || statusOptions[0];
                                        const ps = paymentStatusMap[order.paymentStatus] || paymentStatusMap.pending;
                                        const isExpanded = expandedOrder === order._id;

                                        return (
                                            <React.Fragment key={order._id}>
                                                <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                                                    <td>
                                                        <span className="fw-bold" style={{ color: '#4361ee', fontSize: '0.9rem' }}>
                                                            #{order._id.slice(-8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <span className="fw-medium" style={{ fontSize: '0.9rem' }}>{order.shippingInfo?.fullName}</span>
                                                            <br />
                                                            <small className="text-muted">{order.shippingInfo?.email}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                                day: '2-digit', month: 'short', year: 'numeric'
                                                            })}
                                                        </small>
                                                    </td>
                                                    <td><span className="fw-bold">{formatPrice(order.totalAmount)} DT</span></td>
                                                    <td>
                                                        <span className="badge rounded-pill px-3" style={{ backgroundColor: ps.bg, color: ps.color, fontSize: '0.75rem' }}>
                                                            {ps.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select className="form-select form-select-sm" style={{
                                                            width: '140px', fontSize: '0.8rem',
                                                            backgroundColor: os.bg, color: os.color,
                                                            border: 'none', fontWeight: 600
                                                        }}
                                                            value={order.orderStatus}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => updateOrderStatus(order._id, e.target.value)}
                                                            disabled={updatingOrder === order._id}>
                                                            {statusOptions.map(s => (
                                                                <option key={s.value} value={s.value}>{s.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary"
                                                            onClick={e => { e.stopPropagation(); setExpandedOrder(isExpanded ? null : order._id); }}>
                                                            {isExpanded ? <FaChevronUp /> : <FaEye />}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan="7" style={{ backgroundColor: '#f8fafc' }}>
                                                            <div className="p-3">
                                                                <div className="row g-3">
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaUser className="me-2 text-primary" />Client</h6>
                                                                        <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong>{order.shippingInfo?.fullName}</strong></p>
                                                                        <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}><FaEnvelope className="me-1" />{order.shippingInfo?.email}</p>
                                                                        <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}><FaPhone className="me-1" />{order.shippingInfo?.phone}</p>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaMapMarkerAlt className="me-2 text-primary" />Livraison</h6>
                                                                        <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                                                                            {order.shippingInfo?.address}<br />
                                                                            {order.shippingInfo?.postalCode} {order.shippingInfo?.city}
                                                                        </p>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaBox className="me-2 text-primary" />Articles ({order.items?.length})</h6>
                                                                        {order.items?.map((item, idx) => (
                                                                            <div key={idx} className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                                                                                <span className="text-muted">{item.productName} x{item.quantity}</span>
                                                                                <span className="fw-medium">{formatPrice(item.price * item.quantity)} DT</span>
                                                                            </div>
                                                                        ))}
                                                                        <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                                                                            <strong>Total</strong>
                                                                            <strong style={{ color: '#4361ee' }}>{formatPrice(order.totalAmount)} DT</strong>
                                                                        </div>
                                                                    </div>

                                                                    {/* Date limite retour/échange */}
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaCalendarAlt className="me-2 text-danger" />Date limite retour</h6>
                                                                        <p className="text-muted mb-2" style={{ fontSize: '0.78rem' }}>
                                                                            Le client ne pourra plus demander un retour/échange après cette date.
                                                                        </p>
                                                                        <div className="d-flex gap-2 align-items-center">
                                                                            <input type="date"
                                                                                className="form-control form-control-sm"
                                                                                value={deadlines[order._id] || (order.returnDeadline ? new Date(order.returnDeadline).toISOString().split('T')[0] : '')}
                                                                                onClick={e => e.stopPropagation()}
                                                                                onChange={e => {
                                                                                    e.stopPropagation();
                                                                                    setDeadlines(prev => ({ ...prev, [order._id]: e.target.value }));
                                                                                }}
                                                                                min={new Date().toISOString().split('T')[0]}
                                                                                style={{ maxWidth: '160px', fontSize: '0.85rem' }}
                                                                            />
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                                                onClick={e => { e.stopPropagation(); saveDeadline(order._id); }}
                                                                                disabled={updatingOrder === order._id || (!deadlines[order._id] && !order.returnDeadline)}
                                                                                style={{ fontSize: '0.78rem', fontWeight: 600 }}
                                                                            >
                                                                                {updatingOrder === order._id ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheckCircle className="me-1" />}
                                                                                Enregistrer
                                                                            </button>
                                                                        </div>
                                                                        {order.returnDeadline && (
                                                                            <small className="mt-1 d-block" style={{
                                                                                color: new Date(order.returnDeadline) < new Date() ? '#dc2626' : '#16a34a',
                                                                                fontWeight: 600, fontSize: '0.78rem'
                                                                            }}>
                                                                                {new Date(order.returnDeadline) < new Date()
                                                                                    ? '⛔ Délai expiré'
                                                                                    : `✅ Jusqu'au ${new Date(order.returnDeadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                                                                            </small>
                                                                        )}
                                                                    </div>
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
