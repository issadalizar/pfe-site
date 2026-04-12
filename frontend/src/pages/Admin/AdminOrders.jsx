import React, { useState, useEffect } from 'react';
import {
    FaShoppingCart, FaSearch, FaEye, FaCheckCircle,
    FaTruck, FaTimesCircle, FaSpinner, FaFilter,
    FaCreditCard, FaBox, FaCalendarAlt, FaUser,
    FaChevronDown, FaChevronUp, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaFileInvoice, FaPrint
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
    const [receiptOrder, setReceiptOrder] = useState(null);

    const statusOptions = [
        { value: 'en_attente', label: 'En attente', bg: '#fef3c7', color: '#92400e', icon: <FaBox /> },
        { value: 'confirmee', label: 'Confirmée', bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle /> },
        { value: 'expediee', label: 'Expédiée', bg: '#dbeafe', color: '#1e40af', icon: <FaTruck /> },
        { value: 'livree', label: 'Livrée', bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle /> },
        { value: 'annulee', label: 'Annulée', bg: '#fee2e2', color: '#991b1b', icon: <FaTimesCircle /> },
    ];

    const paymentStatusMap = {
        pending: { label: 'En attente', bg: '#fef3c7', color: '#92400e' },
        paid: { label: 'Payé', bg: '#d1fae5', color: '#065f46' },
        failed: { label: 'Échoué', bg: '#fee2e2', color: '#991b1b' },
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price || 0);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setOrders((data.orders || []).filter(o => o && o._id));
        } catch (err) {
            console.error('Erreur chargement commandes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        if (!orderId) return;
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

    const updatePaymentStatus = async (orderId, newPaymentStatus) => {
        if (!orderId) return;
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
                    orderStatus: order?.orderStatus || 'en_attente',
                    paymentStatus: newPaymentStatus
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o =>
                    o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o
                ));
            }
        } catch (err) {
            console.error('Erreur mise a jour paiement:', err);
        } finally {
            setUpdatingOrder(null);
        }
    };

    const saveDeadline = async (orderId) => {
        if (!orderId) return;
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
                setDeadlines(prev => {
                    const newDeadlines = { ...prev };
                    delete newDeadlines[orderId];
                    return newDeadlines;
                });
            }
        } catch (err) {
            console.error('Erreur sauvegarde deadline:', err);
        } finally {
            setUpdatingOrder(null);
        }
    };

    const filtered = orders.filter(order => {
        if (!order || !order._id) return false;
        const matchSearch = searchTerm === '' ||
            (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingInfo?.fullName && order.shippingInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingInfo?.email && order.shippingInfo.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
        const matchPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
        return matchSearch && matchStatus && matchPayment;
    });

    // Stats
    const totalRevenue = orders.filter(o => o && o.paymentStatus === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pendingCount = orders.filter(o => o && o.orderStatus === 'en_attente').length;
    const paidCount = orders.filter(o => o && o.paymentStatus === 'paid').length;

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between flex-wrap mb-4 gap-3">
                <div>
                    <h1 className="fw-bold">
                        <FaShoppingCart className="me-2" style={{ color: '#4361ee' }} />
                        Gestion des Commandes
                    </h1>
                    <p className="text-muted">Suivez et gérez toutes les commandes</p>
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
                    { title: 'Payées', value: paidCount, icon: <FaCreditCard />, color: '#16a34a' },
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
                                <option value="paid">Payé</option>
                                <option value="failed">Échoué</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-muted" style={{ fontSize: '0.85rem' }}>
                            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
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
                    <h5 className="text-muted mt-3">Aucune commande trouvée</h5>
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
                                        if (!order || !order._id) return null;
                                        const os = statusOptions.find(s => s.value === order.orderStatus) || statusOptions[0];
                                        const ps = paymentStatusMap[order.paymentStatus] || paymentStatusMap.pending;
                                        const isExpanded = expandedOrder === order._id;

                                        return (
                                            <React.Fragment key={order._id}>
                                                <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                                                    <td>
                                                        <span className="fw-bold" style={{ color: '#4361ee', fontSize: '0.9rem' }}>
                                                            #{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <span className="fw-medium" style={{ fontSize: '0.9rem' }}>{order.shippingInfo?.fullName || 'N/A'}</span>
                                                            <br />
                                                            <small className="text-muted">{order.shippingInfo?.email || 'N/A'}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                                day: '2-digit', month: 'short', year: 'numeric'
                                                            }) : 'N/A'}
                                                        </small>
                                                    </td>
                                                    <td><span className="fw-bold">{formatPrice(order.totalAmount)} DT</span></td>
                                                    <td>
                                                        <select className="form-select form-select-sm" style={{
                                                            width: '130px', fontSize: '0.8rem',
                                                            backgroundColor: ps.bg, color: ps.color,
                                                            border: 'none', fontWeight: 600
                                                        }}
                                                            value={order.paymentStatus || 'pending'}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => updatePaymentStatus(order._id, e.target.value)}
                                                            disabled={updatingOrder === order._id}>
                                                            <option value="pending">En attente</option>
                                                            <option value="paid">Payé</option>
                                                            <option value="failed">Échoué</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select className="form-select form-select-sm" style={{
                                                            width: '140px', fontSize: '0.8rem',
                                                            backgroundColor: os.bg, color: os.color,
                                                            border: 'none', fontWeight: 600
                                                        }}
                                                            value={order.orderStatus || 'en_attente'}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => updateOrderStatus(order._id, e.target.value)}
                                                            disabled={updatingOrder === order._id}>
                                                            {statusOptions.map(s => (
                                                                <option key={s.value} value={s.value}>{s.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <button className="btn btn-sm btn-outline-success"
                                                                title="Voir le reçu"
                                                                onClick={e => { e.stopPropagation(); setReceiptOrder(order); }}>
                                                                <FaPrint />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-primary"
                                                                onClick={e => { e.stopPropagation(); setExpandedOrder(isExpanded ? null : order._id); }}>
                                                                {isExpanded ? <FaChevronUp /> : <FaEye />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan="7" style={{ backgroundColor: '#f8fafc' }}>
                                                            <div className="p-3">
                                                                <div className="row g-3">
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaUser className="me-2 text-primary" />Client</h6>
                                                                        <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong>{order.shippingInfo?.fullName || 'N/A'}</strong></p>
                                                                        <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}><FaEnvelope className="me-1" />{order.shippingInfo?.email || 'N/A'}</p>
                                                                        <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}><FaPhone className="me-1" />{order.shippingInfo?.phone || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaMapMarkerAlt className="me-2 text-primary" />Livraison</h6>
                                                                        <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                                                                            {order.shippingInfo?.address || 'N/A'}<br />
                                                                            {order.shippingInfo?.postalCode || ''} {order.shippingInfo?.city || ''}
                                                                        </p>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <h6 className="fw-bold mb-2"><FaBox className="me-2 text-primary" />Articles ({order.items?.length || 0})</h6>
                                                                        {order.items && order.items.map((item, idx) => (
                                                                            <div key={idx} className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                                                                                <span className="text-muted">{item.productName || 'Produit'} x{item.quantity || 1}</span>
                                                                                <span className="fw-medium">{formatPrice((item.price || 0) * (item.quantity || 1))} DT</span>
                                                                            </div>
                                                                        ))}
                                                                        <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                                                                            <strong>Total</strong>
                                                                            <strong style={{ color: '#4361ee' }}>{formatPrice(order.totalAmount)} DT</strong>
                                                                        </div>
                                                                    </div>

                                                                    {order.paymentMethod === 'virement' && (
                                                                        <div className="col-md-4">
                                                                            <h6 className="fw-bold mb-2" style={{ color: '#ea580c' }}>
                                                                                <FaCreditCard className="me-2" />Preuve de virement
                                                                            </h6>
                                                                            {order.virementProof?.fileUrl ? (
                                                                                <div>
                                                                                    <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${order.virementProof.fileUrl}`}
                                                                                        target="_blank" rel="noopener noreferrer"
                                                                                        className="btn btn-sm btn-outline-warning mb-2"
                                                                                        onClick={e => e.stopPropagation()}>
                                                                                        Voir la preuve
                                                                                    </a>
                                                                                    <br />
                                                                                    <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                                                                                        Envoyée le {order.virementProof.uploadedAt ? new Date(order.virementProof.uploadedAt).toLocaleDateString('fr-FR', {
                                                                                            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                                        }) : 'N/A'}
                                                                                        {' '}via {order.virementProof.method === 'platform' ? 'la plateforme' : order.virementProof.method === 'email' ? 'email' : 'WhatsApp'}
                                                                                    </small>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-muted mb-0" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                                                    Aucune preuve reçue
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}

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

            {receiptOrder && receiptOrder._id && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }} onClick={() => setReceiptOrder(null)}>
                    <div style={{
                        backgroundColor: '#f1f5f9', borderRadius: '20px', maxWidth: '680px',
                        width: '100%', maxHeight: '90vh', overflow: 'auto',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
                            <h5 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>
                                <FaFileInvoice className="me-2" style={{ color: '#4361ee' }} />
                                Reçu de Commande
                            </h5>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-primary rounded-pill px-3"
                                    onClick={() => {
                                        const printWindow = window.open('', '_blank');
                                        const o = receiptOrder;
                                        const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
                                        const orderNumber = o._id ? o._id.slice(-8).toUpperCase() : 'N/A';
                                        const statusMap = { en_attente: 'En attente', confirmee: 'Confirmée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' };
                                        const paymentMap = { pending: 'En attente', paid: 'Payé', failed: 'Échoué' };
                                        const itemsHTML = o.items && o.items.length ? o.items.map(item => `
                                            <tr>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${item.productName || 'Produit'}</td>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:14px;color:#64748b;">${item.quantity || 1}</td>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;color:#334155;">${formatPrice(item.price || 0)} DT</td>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:600;color:#0f172a;">${formatPrice((item.price || 0) * (item.quantity || 1))} DT</td>
                                            </tr>`).join('') : '<tr><td colspan="4" style="padding:12px;text-align:center;">Aucun article</td></tr>';
                                        printWindow.document.write(`
                                            <!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu #${orderNumber}</title></head>
                                            <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                                            <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
                                                <div style="background:linear-gradient(145deg,#4361ee,#3a0ca3);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;">
                                                    <h1 style="margin:0;color:white;font-size:26px;font-weight:700;">UniVerTechno+</h1>
                                                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Reçu de commande</p>
                                                </div>
                                                <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                                                    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
                                                        <table style="width:100%;border-collapse:collapse;">
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">N° de commande</td><td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">#${orderNumber}</td></tr>
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Date</td><td style="padding:4px 0;font-size:13px;color:#0f172a;text-align:right;">${orderDate}</td></tr>
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Statut</td><td style="padding:4px 0;font-size:13px;color:#065f46;font-weight:600;text-align:right;">${statusMap[o.orderStatus] || o.orderStatus || 'N/A'}</td></tr>
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Paiement</td><td style="padding:4px 0;font-size:13px;color:#065f46;font-weight:600;text-align:right;">${paymentMap[o.paymentStatus] || o.paymentStatus || 'N/A'}${o.paymentMethod === 'livraison' ? ' (à la livraison)' : o.paymentMethod === 'virement' ? ' (virement bancaire)' : ''}</td></tr>
                                                        </table>
                                                    </div>
                                                    <h3 style="margin:0 0 12px;font-size:15px;color:#0f172a;font-weight:600;">Adresse de livraison</h3>
                                                    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;margin-bottom:28px;font-size:13px;color:#334155;line-height:1.6;">
                                                        <strong>${o.shippingInfo?.fullName || 'N/A'}</strong><br>
                                                        ${o.shippingInfo?.address || 'N/A'}<br>
                                                        ${o.shippingInfo?.postalCode || ''} ${o.shippingInfo?.city || ''}<br>
                                                        Tél: ${o.shippingInfo?.phone || 'N/A'}<br>
                                                        Email: ${o.shippingInfo?.email || 'N/A'}
                                                    </div>
                                                    <h3 style="margin:0 0 12px;font-size:15px;color:#0f172a;font-weight:600;">Articles commandés</h3>
                                                    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                                                        <thead><tr style="background:#f8fafc;">
                                                            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Produit</th>
                                                            <th style="padding:12px 16px;text-align:center;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Qté</th>
                                                            <th style="padding:12px 16px;text-align:right;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Prix unit.</th>
                                                            <th style="padding:12px 16px;text-align:right;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Total</th>
                                                        </tr></thead>
                                                        <tbody>${itemsHTML}</tbody>
                                                    </table>
                                                    <div style="border-top:2px solid #e2e8f0;padding-top:16px;">
                                                        <table style="width:100%;border-collapse:collapse;">
                                                            <tr><td style="padding:6px 16px;font-size:14px;color:#64748b;">Sous-total</td><td style="padding:6px 16px;text-align:right;font-size:14px;color:#334155;">${formatPrice(o.totalAmount || 0)} DT</td></tr>
                                                            <tr><td style="padding:6px 16px;font-size:14px;color:#64748b;">Livraison</td><td style="padding:6px 16px;text-align:right;font-size:14px;color:#16a34a;font-weight:500;">Gratuite</td></tr>
                                                            <tr><td style="padding:14px 16px;font-size:18px;font-weight:700;color:#0f172a;">Total</td><td style="padding:14px 16px;text-align:right;font-size:20px;font-weight:700;color:#4361ee;">${formatPrice(o.totalAmount || 0)} DT</td></tr>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div style="text-align:center;padding:24px 16px;">
                                                    <p style="margin:0;font-size:12px;color:#94a3b8;">UniVerTechno+ - Équipements CNC & Éducation</p>
                                                </div>
                                            </div>
                                            </body></html>
                                        `);
                                        printWindow.document.close();
                                        printWindow.focus();
                                        setTimeout(() => printWindow.print(), 300);
                                    }}
                                >
                                    <FaPrint className="me-1" /> Imprimer
                                </button>
                                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                    onClick={() => setReceiptOrder(null)}>
                                    <FaTimesCircle className="me-1" /> Fermer
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '16px 24px 24px' }}>
                            <div style={{
                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                borderRadius: '16px 16px 0 0', padding: '32px 24px', textAlign: 'center'
                            }}>
                                <h2 style={{ margin: 0, color: 'white', fontSize: '22px', fontWeight: 700 }}>UniVerTechno+</h2>
                                <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>Reçu de commande</p>
                            </div>
                            <div style={{
                                backgroundColor: 'white', padding: '28px',
                                borderRadius: '0 0 16px 16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>N° de commande</span>
                                        <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>#{receiptOrder._id ? receiptOrder._id.slice(-8).toUpperCase() : 'N/A'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Date</span>
                                        <span style={{ fontSize: '0.82rem', color: '#0f172a' }}>{receiptOrder.createdAt ? new Date(receiptOrder.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Paiement</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: receiptOrder.paymentStatus === 'paid' ? '#065f46' : '#92400e' }}>
                                            {(paymentStatusMap[receiptOrder.paymentStatus] || paymentStatusMap.pending).label}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '16px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    UniVerTechno+ - Équipements CNC & Éducation
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
gi