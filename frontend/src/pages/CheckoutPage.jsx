import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createCheckoutSession } from '../services/orderService';
import {
    FaStore, FaArrowLeft, FaUser, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaCity, FaMailBulk, FaShoppingCart,
    FaCreditCard, FaLock, FaSpinner, FaCheckCircle,
    FaChevronRight, FaBox, FaShieldAlt, FaTruck
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth(); 
    const { cart, getCartTotal, getCartCount, clearCart } = useCart();
     // Rediriger si non connecté
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
        }
    }, [isAuthenticated, navigate]);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.client_name || '',
        email: user?.email || '',
        phone: user?.telephone || '',
        address: user?.adresse || '',
        city: '',
        postalCode: ''
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const handleChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const validateStep1 = () => {
        if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone ||
            !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
            setError('Veuillez remplir tous les champs.');
            return false;
        }
        setError('');
        return true;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
        // ✅ AJOUTER productId à chaque item
        const items = cart.map(item => ({
            productId: item.product._id, // AJOUT CRUCIAL
            // ✅ CORRECTION : supporter nom (français), name, et title
            productName: item.product.nom || item.product.name || item.product.title || 'Produit',
            productImage: item.product.images?.[0] || '',
            quantity: item.quantity,
            // ✅ CORRECTION : supporter prix (français) et price
            price: parseFloat(item.product.prix || item.product.price) || 0
        }));

        console.log('📦 Items envoyés:', items); // Debug

        const result = await createCheckoutSession(items, shippingInfo);

        if (result.success && result.sessionUrl) {
            // Rediriger vers Stripe Checkout
            window.location.href = result.sessionUrl;
        } else {
            setError('Erreur lors de la création de la session de paiement.');
        }
    } catch (err) {
        console.error('Checkout error:', err);
        setError(err.response?.data?.error || 'Erreur lors du paiement. Veuillez réessayer.');
    } finally {
        setLoading(false);
    }
};

    const subtotal = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <div className="text-center">
                    <FaShoppingCart size={64} style={{ color: '#cbd5e1' }} className="mb-4" />
                    <h3 className="fw-bold" style={{ color: '#0f172a' }}>Votre panier est vide</h3>
                    <p className="text-muted mb-4">Ajoutez des produits avant de passer commande</p>
                    <button className="btn rounded-pill px-4 py-2"
                        onClick={() => navigate('/home')}
                        style={{
                            background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                            border: 'none', color: 'white', fontWeight: '600'
                        }}>
                        <FaArrowLeft className="me-2" />Retour a la boutique
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
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
                        <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
                            <div className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '48px', height: '48px',
                                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                    borderRadius: '14px', color: 'white', fontSize: '26px',
                                    boxShadow: '0 8px 20px rgba(67, 97, 238, 0.3)'
                                }}>
                                <FaStore />
                            </div>
                            <h1 className="fw-bold mb-0" style={{
                                fontSize: '1.6rem',
                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                                UniVer<span style={{ color: '#4361ee', WebkitTextFillColor: '#4361ee' }}>Techno</span>+
                            </h1>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <FaLock style={{ color: '#16a34a' }} />
                            <span className="fw-medium" style={{ color: '#16a34a' }}>Paiement securise</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container py-4">
                {/* Progress Steps */}
                <div className="d-flex align-items-center justify-content-center mb-5">
                    {[
                        { num: 1, label: 'Livraison', icon: <FaTruck /> },
                        { num: 2, label: 'Paiement', icon: <FaCreditCard /> }
                    ].map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className="d-flex align-items-center gap-2" style={{ cursor: step > s.num ? 'pointer' : 'default' }}
                                onClick={() => { if (step > s.num) setStep(s.num); }}>
                                <div className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: step >= s.num
                                            ? 'linear-gradient(145deg, #4361ee, #3a0ca3)'
                                            : '#e2e8f0',
                                        color: step >= s.num ? 'white' : '#94a3b8',
                                        fontWeight: '700', fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}>
                                    {step > s.num ? <FaCheckCircle /> : s.icon}
                                </div>
                                <span className="fw-medium d-none d-md-inline" style={{
                                    color: step >= s.num ? '#0f172a' : '#94a3b8'
                                }}>{s.label}</span>
                            </div>
                            {i < 1 && (
                                <div style={{
                                    width: '80px', height: '3px', margin: '0 16px',
                                    background: step > 1
                                        ? 'linear-gradient(90deg, #4361ee, #3a0ca3)'
                                        : '#e2e8f0',
                                    borderRadius: '2px', transition: 'all 0.3s ease'
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="row g-4">
                    {/* Left Column - Form */}
                    <div className="col-lg-7">
                        {step === 1 && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                        <FaTruck className="me-2" style={{ color: '#4361ee' }} />
                                        Informations de livraison
                                    </h4>

                                    {error && (
                                        <div className="alert alert-danger rounded-3 mb-4">{error}</div>
                                    )}

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaUser className="me-2" style={{ color: '#4361ee' }} />Nom complet
                                            </label>
                                            <input type="text" name="fullName" className="form-control py-3 rounded-3 border-0 bg-light"
                                                value={shippingInfo.fullName} onChange={handleChange}
                                                placeholder="Votre nom complet" style={{ fontSize: '0.95rem' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaEnvelope className="me-2" style={{ color: '#4361ee' }} />Email
                                            </label>
                                            <input type="email" name="email" className="form-control py-3 rounded-3 border-0 bg-light"
                                                value={shippingInfo.email} onChange={handleChange}
                                                placeholder="votre@email.com" style={{ fontSize: '0.95rem' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaPhone className="me-2" style={{ color: '#4361ee' }} />Telephone
                                            </label>
                                            <input type="tel" name="phone" className="form-control py-3 rounded-3 border-0 bg-light"
                                                value={shippingInfo.phone} onChange={handleChange}
                                                placeholder="Votre numero" style={{ fontSize: '0.95rem' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaMailBulk className="me-2" style={{ color: '#4361ee' }} />Code postal
                                            </label>
                                            <input type="text" name="postalCode" className="form-control py-3 rounded-3 border-0 bg-light"
                                                value={shippingInfo.postalCode} onChange={handleChange}
                                                placeholder="1000" style={{ fontSize: '0.95rem' }} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaMapMarkerAlt className="me-2" style={{ color: '#4361ee' }} />Adresse
                                            </label>
                                            <input type="text" name="address" className="form-control py-3 rounded-3 border-0 bg-light"
                                                value={shippingInfo.address} onChange={handleChange}
                                                placeholder="Rue, numero, batiment..." style={{ fontSize: '0.95rem' }} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-medium text-secondary">
                                                <FaCity className="me-2" style={{ color: '#4361ee' }} />Ville
                                            </label>
                                            <input type="text" name="city" className="form-control py-3 rounded-3 border-0 bg-light"
                                                value={shippingInfo.city} onChange={handleChange}
                                                placeholder="Votre ville" style={{ fontSize: '0.95rem' }} />
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between mt-4">
                                        <button className="btn btn-outline-secondary rounded-pill px-4"
                                            onClick={() => navigate('/cart')}>
                                            <FaArrowLeft className="me-2" />Retour au panier
                                        </button>
                                        <button className="btn rounded-pill px-4 py-2"
                                            onClick={handleNextStep}
                                            style={{
                                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                border: 'none', color: 'white', fontWeight: '600'
                                            }}>
                                            Continuer <FaChevronRight className="ms-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                        <FaCreditCard className="me-2" style={{ color: '#4361ee' }} />
                                        Confirmation et paiement
                                    </h4>

                                    {error && (
                                        <div className="alert alert-danger rounded-3 mb-4">{error}</div>
                                    )}

                                    {/* Adresse de livraison resume */}
                                    <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold mb-0" style={{ color: '#0369a1' }}>
                                                <FaTruck className="me-2" />Adresse de livraison
                                            </h6>
                                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                onClick={() => setStep(1)}>Modifier</button>
                                        </div>
                                        <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                                            <strong>{shippingInfo.fullName}</strong><br />
                                            {shippingInfo.address}, {shippingInfo.postalCode} {shippingInfo.city}<br />
                                            {shippingInfo.phone} - {shippingInfo.email}
                                        </p>
                                    </div>

                                    {/* Articles */}
                                    <h6 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Articles ({getCartCount()})</h6>
                                    {cart.map((item, index) => (
                                        <div key={index} className="d-flex align-items-center gap-3 p-3 mb-2 rounded-3"
                                            style={{ backgroundColor: '#f8fafc' }}>
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
                                                    {item.product.title || item.product.name}
                                                </div>
                                                <small className="text-muted">Qte: {item.quantity}</small>
                                            </div>
                                            <div className="fw-bold" style={{ color: '#4361ee' }}>
                                                {formatPrice(item.product.price * item.quantity)} DT
                                            </div>
                                        </div>
                                    ))}

                                    <div className="d-flex justify-content-between mt-4">
                                        <button className="btn btn-outline-secondary rounded-pill px-4"
                                            onClick={() => setStep(1)}>
                                            <FaArrowLeft className="me-2" />Retour
                                        </button>
                                        <button className="btn rounded-pill px-4 py-3"
                                            onClick={handleCheckout}
                                            disabled={loading}
                                            style={{
                                                background: 'linear-gradient(145deg, #16a34a, #15803d)',
                                                border: 'none', color: 'white', fontWeight: '700',
                                                fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(22, 163, 74, 0.35)'
                                            }}>
                                            {loading ? (
                                                <><FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />Redirection vers Stripe...</>
                                            ) : (
                                                <><FaLock className="me-2" />Payer {formatPrice(subtotal)} DT</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="col-lg-5">
                        <div className="card border-0 rounded-4 shadow-sm" style={{ position: 'sticky', top: '90px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                    <FaShoppingCart className="me-2" style={{ color: '#4361ee' }} />
                                    Recapitulatif
                                </h5>

                                {cart.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-2"
                                        style={{ fontSize: '0.9rem' }}>
                                        <span className="text-muted">
                                            {(item.product.title || item.product.name)?.substring(0, 30)}
                                            {(item.product.title || item.product.name)?.length > 30 ? '...' : ''}
                                            {' '} x{item.quantity}
                                        </span>
                                        <span className="fw-medium">{formatPrice(item.product.price * item.quantity)} DT</span>
                                    </div>
                                ))}

                                <hr style={{ borderColor: '#e2e8f0' }} />

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted">Sous-total</span>
                                    <span className="fw-medium">{formatPrice(subtotal)} DT</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-muted"><FaTruck className="me-1" size={12} />Livraison</span>
                                    <span className="fw-medium text-success">Gratuite</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center p-3 rounded-3"
                                    style={{ background: 'linear-gradient(145deg, #4361ee10, #3a0ca310)' }}>
                                    <span className="fw-bold" style={{ color: '#0f172a', fontSize: '1.1rem' }}>Total</span>
                                    <span className="fw-bold" style={{ color: '#4361ee', fontSize: '1.3rem' }}>
                                        {formatPrice(subtotal)} DT
                                    </span>
                                </div>

                                <div className="mt-4 text-center">
                                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                        <FaShieldAlt size={14} style={{ color: '#4361ee' }} />
                                        <small className="text-muted">Paiement securise par Stripe</small>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" style={{ height: '24px' }} />
                                        <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" style={{ height: '24px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;