import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    FaUser, FaShoppingCart, FaFileInvoice, FaSignOutAlt,
    FaStore, FaArrowLeft, FaEdit, FaSave, FaTimes,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdBadge,
    FaShieldAlt, FaHistory, FaHeart, FaCog, FaCheckCircle,
    FaBox, FaChevronRight, FaCalendarAlt, FaUserCircle,
    FaLock, FaKey, FaExclamationTriangle, FaSpinner,
    FaTruck, FaCreditCard
} from 'react-icons/fa';
import { getMyOrders } from '../services/orderService';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuth();
    const { cart, getCartCount, getCartTotal } = useCart();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [editData, setEditData] = useState({
        client_name: user?.client_name || '',
        telephone: user?.telephone || '',
        adresse: user?.adresse || ''
    });

    // Mot de passe
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Sync editData quand user change
    useEffect(() => {
        if (user) {
            setEditData({
                client_name: user.client_name || '',
                telephone: user.telephone || '',
                adresse: user.adresse || ''
            });
        }
    }, [user]);

    // Auto-clear messages
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (passwordSuccess) {
            const timer = setTimeout(() => setPasswordSuccess(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [passwordSuccess]);

    // Charger les commandes quand on ouvre l'onglet
    useEffect(() => {
        if (activeTab === 'orders') {
            setOrdersLoading(true);
            getMyOrders()
                .then(data => setOrders(data.orders || []))
                .catch(err => console.error('Erreur chargement commandes:', err))
                .finally(() => setOrdersLoading(false));
        }
    }, [activeTab]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setErrorMsg('');
        setEditData({
            client_name: user?.client_name || '',
            telephone: user?.telephone || '',
            adresse: user?.adresse || ''
        });
    };

    const handleSaveProfile = async () => {
        setErrorMsg('');
        setSaving(true);
        try {
            const result = await updateProfile({
                client_name: editData.client_name,
                telephone: editData.telephone,
                adresse: editData.adresse
            });
            if (result.success) {
                setSuccessMsg('Profil mis a jour avec succes !');
                setIsEditing(false);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Erreur lors de la mise a jour.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSavePassword = async () => {
        setPasswordError('');

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Tous les champs sont requis.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caracteres.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas.');
            return;
        }

        setPasswordSaving(true);
        try {
            const result = await updateProfile({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (result.success) {
                setPasswordSuccess('Mot de passe modifie avec succes !');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordForm(false);
            }
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Erreur lors du changement de mot de passe.');
        } finally {
            setPasswordSaving(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const tabs = [
        { id: 'profile', label: 'Mon Profil', icon: <FaUser /> },
        { id: 'cart', label: 'Mon Panier', icon: <FaShoppingCart /> },
        { id: 'orders', label: 'Mes Commandes', icon: <FaHistory /> },
        { id: 'settings', label: 'Parametres', icon: <FaCog /> },
    ];

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {/* Success toast */}
            {(successMsg || passwordSuccess) && (
                <div style={{
                    position: 'fixed', top: '90px', right: '30px', zIndex: 9999,
                    animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    <div className="alert mb-0" style={{
                        background: 'linear-gradient(145deg, #16a34a, #15803d)',
                        color: 'white', border: 'none', borderRadius: '16px',
                        padding: '14px 24px', boxShadow: '0 10px 40px rgba(22, 163, 74, 0.4)',
                        fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FaCheckCircle size={16} />
                        {successMsg || passwordSuccess}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="py-3 sticky-top" style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.03)',
                borderBottom: '1px solid rgba(67, 97, 238, 0.1)',
                zIndex: 1030
            }}>
                <div className="container">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <div
                                className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '48px', height: '48px',
                                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                    borderRadius: '14px', color: 'white', fontSize: '26px',
                                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    boxShadow: '0 8px 20px rgba(67, 97, 238, 0.3)'
                                }}
                                onClick={() => navigate("/home")}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1)'; }}
                            >
                                <FaStore />
                            </div>
                            <h1 className="fw-bold mb-0" style={{
                                fontSize: '1.6rem',
                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                cursor: 'pointer', letterSpacing: '-0.5px'
                            }} onClick={() => navigate("/home")}>
                                UniVer<span style={{ color: '#4361ee', WebkitTextFillColor: '#4361ee' }}>Techno</span>+
                            </h1>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <button
                                className="btn btn-outline-primary rounded-pill px-4"
                                onClick={() => navigate("/home")}
                            >
                                <FaArrowLeft className="me-2" />
                                Boutique
                            </button>
                            <button
                                className="btn rounded-pill px-4"
                                onClick={handleLogout}
                                style={{
                                    background: 'linear-gradient(145deg, #f72585, #b5179e)',
                                    border: 'none', color: 'white', fontWeight: '600'
                                }}
                            >
                                <FaSignOutAlt className="me-2" />
                                Deconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container py-4">
                {/* Welcome Banner */}
                <div className="card border-0 rounded-4 mb-4 overflow-hidden" style={{
                    background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 50%, #7209b7 100%)',
                    boxShadow: '0 10px 40px rgba(67, 97, 238, 0.3)'
                }}>
                    <div className="card-body p-4 p-lg-5">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div className="d-flex align-items-center mb-3">
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginRight: '16px', border: '1px solid rgba(255,255,255,0.2)'
                                    }}>
                                        <FaUserCircle size={32} color="white" />
                                    </div>
                                    <div>
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '1.8rem' }}>
                                            Bienvenue, {user?.client_name}
                                        </h2>
                                        <p className="text-white-50 mb-0" style={{ fontSize: '0.95rem' }}>
                                            Code client : {user?.client_code}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
                                    <FaCalendarAlt className="me-2" />
                                    Membre depuis le {formatDate(user?.createdAt)}
                                </p>
                            </div>
                            <div className="col-lg-4 mt-3 mt-lg-0">
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div style={{
                                            background: 'rgba(255,255,255,0.1)', borderRadius: '16px',
                                            padding: '16px', backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div className="text-white fw-bold" style={{ fontSize: '1.5rem' }}>{getCartCount()}</div>
                                            <div className="text-white-50" style={{ fontSize: '0.8rem' }}>Articles panier</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div style={{
                                            background: 'rgba(255,255,255,0.1)', borderRadius: '16px',
                                            padding: '16px', backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div className="text-white fw-bold" style={{ fontSize: '1.5rem' }}>0</div>
                                            <div className="text-white-50" style={{ fontSize: '0.8rem' }}>Commandes</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Sidebar Navigation */}
                    <div className="col-lg-3">
                        <div className="card border-0 rounded-4 shadow-sm">
                            <div className="card-body p-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="btn w-100 d-flex align-items-center gap-3 mb-2 px-3 py-3 rounded-3 text-start"
                                        style={{
                                            background: activeTab === tab.id
                                                ? 'linear-gradient(145deg, #4361ee, #3a0ca3)'
                                                : 'transparent',
                                            color: activeTab === tab.id ? 'white' : '#334155',
                                            border: activeTab === tab.id
                                                ? 'none'
                                                : '1px solid transparent',
                                            fontWeight: activeTab === tab.id ? '600' : '500',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.95rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                                        {tab.label}
                                        {tab.id === 'cart' && getCartCount() > 0 && (
                                            <span className="badge rounded-pill ms-auto" style={{
                                                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#4361ee',
                                                color: 'white', fontSize: '0.75rem'
                                            }}>
                                                {getCartCount()}
                                            </span>
                                        )}
                                        <FaChevronRight className="ms-auto" size={12} style={{
                                            opacity: activeTab === tab.id ? 1 : 0.3
                                        }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        {/* Tab: Mon Profil */}
                        {activeTab === 'profile' && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                                            <FaUser className="me-2" style={{ color: '#4361ee' }} />
                                            Informations Personnelles
                                        </h4>
                                        {!isEditing ? (
                                            <button
                                                className="btn btn-outline-primary rounded-pill px-4"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <FaEdit className="me-2" />
                                                Modifier
                                            </button>
                                        ) : (
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-secondary rounded-pill px-3"
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                >
                                                    <FaTimes className="me-2" />
                                                    Annuler
                                                </button>
                                                <button
                                                    className="btn rounded-pill px-4"
                                                    onClick={handleSaveProfile}
                                                    disabled={saving}
                                                    style={{
                                                        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                        border: 'none', color: 'white'
                                                    }}
                                                >
                                                    {saving ? (
                                                        <><FaSpinner className="me-2 fa-spin" style={{ animation: 'spin 1s linear infinite' }} />Enregistrement...</>
                                                    ) : (
                                                        <><FaSave className="me-2" />Sauvegarder</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Error message */}
                                    {errorMsg && (
                                        <div className="alert alert-danger d-flex align-items-center rounded-3 mb-4" role="alert">
                                            <FaExclamationTriangle className="me-2 flex-shrink-0" />
                                            <div>{errorMsg}</div>
                                            <button className="btn-close ms-auto" onClick={() => setErrorMsg('')} />
                                        </div>
                                    )}

                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaIdBadge className="me-2" style={{ color: '#4361ee' }} />
                                                Code Client
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control bg-light border-0 py-3 rounded-3"
                                                value={user?.client_code || ''}
                                                disabled
                                                style={{ fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaUser className="me-2" style={{ color: '#4361ee' }} />
                                                Nom complet
                                            </label>
                                            <input
                                                type="text"
                                                name="client_name"
                                                className={`form-control py-3 rounded-3 ${isEditing ? 'border-primary' : 'bg-light border-0'}`}
                                                value={isEditing ? editData.client_name : user?.client_name || ''}
                                                onChange={handleEditChange}
                                                disabled={!isEditing}
                                                style={{ fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaEnvelope className="me-2" style={{ color: '#4361ee' }} />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control bg-light border-0 py-3 rounded-3"
                                                value={user?.email || ''}
                                                disabled
                                                style={{ fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaPhone className="me-2" style={{ color: '#4361ee' }} />
                                                Telephone
                                            </label>
                                            <input
                                                type="tel"
                                                name="telephone"
                                                className={`form-control py-3 rounded-3 ${isEditing ? 'border-primary' : 'bg-light border-0'}`}
                                                value={isEditing ? editData.telephone : user?.telephone || 'Non renseigne'}
                                                onChange={handleEditChange}
                                                disabled={!isEditing}
                                                placeholder="Entrez votre numero"
                                                style={{ fontSize: '0.95rem' }}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaMapMarkerAlt className="me-2" style={{ color: '#4361ee' }} />
                                                Adresse
                                            </label>
                                            <input
                                                type="text"
                                                name="adresse"
                                                className={`form-control py-3 rounded-3 ${isEditing ? 'border-primary' : 'bg-light border-0'}`}
                                                value={isEditing ? editData.adresse : user?.adresse || 'Non renseignee'}
                                                onChange={handleEditChange}
                                                disabled={!isEditing}
                                                placeholder="Entrez votre adresse"
                                                style={{ fontSize: '0.95rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                        <div className="d-flex align-items-center">
                                            <FaShieldAlt className="me-3" style={{ color: '#16a34a', fontSize: '1.2rem' }} />
                                            <div>
                                                <strong style={{ color: '#166534' }}>Compte verifie</strong>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    Votre compte est actif et securise
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Mon Panier */}
                        {activeTab === 'cart' && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                                            <FaShoppingCart className="me-2" style={{ color: '#4361ee' }} />
                                            Mon Panier ({getCartCount()} articles)
                                        </h4>
                                        <button
                                            className="btn btn-outline-primary rounded-pill px-4"
                                            onClick={() => navigate('/cart')}
                                        >
                                            Voir le panier complet
                                            <FaChevronRight className="ms-2" size={12} />
                                        </button>
                                    </div>

                                    {cart.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div style={{
                                                width: '80px', height: '80px', borderRadius: '24px',
                                                background: 'linear-gradient(145deg, #4361ee15, #3a0ca315)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 16px'
                                            }}>
                                                <FaShoppingCart size={32} style={{ color: '#4361ee' }} />
                                            </div>
                                            <h5 className="fw-bold text-muted">Votre panier est vide</h5>
                                            <p className="text-muted mb-4">Parcourez notre catalogue pour ajouter des produits</p>
                                            <button
                                                className="btn rounded-pill px-4 py-2"
                                                onClick={() => navigate('/home#products')}
                                                style={{
                                                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                    border: 'none', color: 'white', fontWeight: '600'
                                                }}
                                            >
                                                Decouvrir les produits
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {cart.slice(0, 5).map((item, index) => (
                                                <div key={index} className="d-flex align-items-center gap-3 p-3 mb-2 rounded-3"
                                                    style={{ backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef2ff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                >
                                                    <div style={{
                                                        width: '50px', height: '50px', borderRadius: '12px',
                                                        background: '#e2e8f0', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                                                    }}>
                                                        {item.product.images?.[0] ? (
                                                            <img src={item.product.images[0]} alt="" style={{
                                                                width: '100%', height: '100%', objectFit: 'cover'
                                                            }} />
                                                        ) : (
                                                            <FaBox size={20} style={{ color: '#94a3b8' }} />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-medium" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                                                            {item.product.title?.length > 40
                                                                ? item.product.title.substring(0, 40) + '...'
                                                                : item.product.title}
                                                        </div>
                                                        <small className="text-muted">Qte: {item.quantity}</small>
                                                    </div>
                                                    <div className="fw-bold" style={{ color: '#4361ee' }}>
                                                        {formatPrice(item.product.price * item.quantity)} DT
                                                    </div>
                                                </div>
                                            ))}
                                            {cart.length > 5 && (
                                                <p className="text-center text-muted mt-3">
                                                    + {cart.length - 5} autres articles
                                                </p>
                                            )}
                                            <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold" style={{ color: '#0f172a' }}>Total estime</span>
                                                    <span className="fw-bold" style={{ color: '#4361ee', fontSize: '1.3rem' }}>
                                                        {formatPrice(getCartTotal())} DT
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Mes Commandes */}
                        {activeTab === 'orders' && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                        <FaHistory className="me-2" style={{ color: '#4361ee' }} />
                                        Historique des Commandes
                                    </h4>

                                    {ordersLoading ? (
                                        <div className="text-center py-5">
                                            <FaSpinner size={32} style={{ color: '#4361ee', animation: 'spin 1s linear infinite' }} />
                                            <p className="text-muted mt-3">Chargement des commandes...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div style={{
                                                width: '80px', height: '80px', borderRadius: '24px',
                                                background: 'linear-gradient(145deg, #4361ee15, #3a0ca315)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 16px'
                                            }}>
                                                <FaFileInvoice size={32} style={{ color: '#4361ee' }} />
                                            </div>
                                            <h5 className="fw-bold text-muted">Aucune commande pour le moment</h5>
                                            <p className="text-muted mb-4">
                                                Vos commandes apparaitront ici une fois passees
                                            </p>
                                            <button
                                                className="btn rounded-pill px-4 py-2"
                                                onClick={() => navigate('/home#products')}
                                                style={{
                                                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                    border: 'none', color: 'white', fontWeight: '600'
                                                }}
                                            >
                                                Decouvrir les produits
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            {orders.map((order) => {
                                                const statusColors = {
                                                    en_attente: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
                                                    confirmee: { bg: '#d1fae5', color: '#065f46', label: 'Confirmee' },
                                                    expediee: { bg: '#dbeafe', color: '#1e40af', label: 'Expediee' },
                                                    livree: { bg: '#d1fae5', color: '#065f46', label: 'Livree' },
                                                    annulee: { bg: '#fee2e2', color: '#991b1b', label: 'Annulee' },
                                                };
                                                const paymentColors = {
                                                    pending: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
                                                    paid: { bg: '#d1fae5', color: '#065f46', label: 'Paye' },
                                                    failed: { bg: '#fee2e2', color: '#991b1b', label: 'Echoue' },
                                                };
                                                const os = statusColors[order.orderStatus] || statusColors.en_attente;
                                                const ps = paymentColors[order.paymentStatus] || paymentColors.pending;

                                                return (
                                                    <div key={order._id} className="p-3 mb-3 rounded-3"
                                                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4361ee'}
                                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                                                                    #{order._id.slice(-8).toUpperCase()}
                                                                </span>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                                        day: '2-digit', month: 'long', year: 'numeric'
                                                                    })}
                                                                </small>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: ps.bg, color: ps.color, fontSize: '0.75rem' }}>
                                                                    <FaCreditCard className="me-1" size={10} />{ps.label}
                                                                </span>
                                                                <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: os.bg, color: os.color, fontSize: '0.75rem' }}>
                                                                    <FaTruck className="me-1" size={10} />{os.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                                {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                                            </span>
                                                            <span className="fw-bold" style={{ color: '#4361ee' }}>
                                                                {formatPrice(order.totalAmount)} DT
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Parametres */}
                        {activeTab === 'settings' && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                        <FaCog className="me-2" style={{ color: '#4361ee' }} />
                                        Parametres du Compte
                                    </h4>

                                    {/* Changer mot de passe */}
                                    <div className="p-4 rounded-3 mb-3" style={{ backgroundColor: '#f8fafc' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0">
                                                <FaLock className="me-2" style={{ color: '#4361ee' }} />
                                                Securite
                                            </h6>
                                        </div>

                                        {!showPasswordForm ? (
                                            <button
                                                className="btn btn-outline-primary rounded-pill px-4"
                                                onClick={() => setShowPasswordForm(true)}
                                            >
                                                <FaKey className="me-2" />
                                                Changer le mot de passe
                                            </button>
                                        ) : (
                                            <div className="mt-3">
                                                {passwordError && (
                                                    <div className="alert alert-danger d-flex align-items-center rounded-3 mb-3 py-2" role="alert">
                                                        <FaExclamationTriangle className="me-2 flex-shrink-0" />
                                                        <div style={{ fontSize: '0.9rem' }}>{passwordError}</div>
                                                        <button className="btn-close ms-auto btn-close-sm" onClick={() => setPasswordError('')} />
                                                    </div>
                                                )}

                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.85rem' }}>
                                                            Mot de passe actuel
                                                        </label>
                                                        <input
                                                            type="password"
                                                            name="currentPassword"
                                                            className="form-control py-2 rounded-3 border-primary"
                                                            value={passwordData.currentPassword}
                                                            onChange={handlePasswordChange}
                                                            placeholder="Entrez votre mot de passe actuel"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.85rem' }}>
                                                            Nouveau mot de passe
                                                        </label>
                                                        <input
                                                            type="password"
                                                            name="newPassword"
                                                            className="form-control py-2 rounded-3 border-primary"
                                                            value={passwordData.newPassword}
                                                            onChange={handlePasswordChange}
                                                            placeholder="Min. 6 caracteres"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.85rem' }}>
                                                            Confirmer le mot de passe
                                                        </label>
                                                        <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            className="form-control py-2 rounded-3 border-primary"
                                                            value={passwordData.confirmPassword}
                                                            onChange={handlePasswordChange}
                                                            placeholder="Confirmez le mot de passe"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 mt-3">
                                                    <button
                                                        className="btn btn-outline-secondary rounded-pill px-3"
                                                        onClick={() => {
                                                            setShowPasswordForm(false);
                                                            setPasswordError('');
                                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                        }}
                                                        disabled={passwordSaving}
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        className="btn rounded-pill px-4"
                                                        onClick={handleSavePassword}
                                                        disabled={passwordSaving}
                                                        style={{
                                                            background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                            border: 'none', color: 'white'
                                                        }}
                                                    >
                                                        {passwordSaving ? (
                                                            <><FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />Enregistrement...</>
                                                        ) : (
                                                            <><FaSave className="me-2" />Enregistrer</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notifications */}
                                    <div className="p-4 rounded-3 mb-3" style={{ backgroundColor: '#f8fafc' }}>
                                        <h6 className="fw-bold mb-3">Notifications</h6>
                                        <div className="form-check form-switch mb-2">
                                            <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
                                            <label className="form-check-label" htmlFor="emailNotif">
                                                Notifications par email
                                            </label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="promoNotif" defaultChecked />
                                            <label className="form-check-label" htmlFor="promoNotif">
                                                Offres et promotions
                                            </label>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="p-4 rounded-3" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                                        <h6 className="fw-bold mb-3" style={{ color: '#dc2626' }}>Zone de danger</h6>
                                        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                                            La suppression de votre compte est irreversible.
                                        </p>
                                        <button className="btn btn-outline-danger rounded-pill px-4">
                                            Supprimer mon compte
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Inline keyframe for spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ClientDashboard;
