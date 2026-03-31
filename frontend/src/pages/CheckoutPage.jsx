import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createCheckoutSession, createCodOrder, createVirementOrder } from '../services/orderService';
import {
    FaStore, FaArrowLeft, FaUser, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaCity, FaMailBulk, FaShoppingCart,
    FaCreditCard, FaLock, FaSpinner, FaCheckCircle,
    FaChevronRight, FaBox, FaShieldAlt, FaTruck, FaMoneyBillWave,
    FaUniversity, FaCopy
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
    const [paymentMethod, setPaymentMethod] = useState('stripe');
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

    const handleCodCheckout = async () => {
        setLoading(true);
        setError('');
        try {
            const items = cart.map(item => ({
                productId: item.product._id,
                productName: item.product.nom || item.product.name || item.product.title || 'Produit',
                productImage: item.product.images?.[0] || '',
                quantity: item.quantity,
                price: parseFloat(item.product.prix || item.product.price) || 0
            }));

            const result = await createCodOrder(items, shippingInfo);

            if (result.success && result.orderId) {
                clearCart();
                navigate(`/order/success?payment=cod&order_id=${result.orderId}`);
            } else {
                setError('Erreur lors de la création de la commande.');
            }
        } catch (err) {
            console.error('COD checkout error:', err);
            setError(err.response?.data?.error || 'Erreur lors de la commande. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleVirementCheckout = async () => {
        setLoading(true);
        setError('');
        try {
            const items = cart.map(item => ({
                productId: item.product._id,
                productName: item.product.nom || item.product.name || item.product.title || 'Produit',
                productImage: item.product.images?.[0] || '',
                quantity: item.quantity,
                price: parseFloat(item.product.prix || item.product.price) || 0
            }));

            const result = await createVirementOrder(items, shippingInfo);

            if (result.success && result.orderId) {
                clearCart();
                navigate(`/order/success?payment=virement&order_id=${result.orderId}`);
            } else {
                setError('Erreur lors de la création de la commande.');
            }
        } catch (err) {
            console.error('Virement checkout error:', err);
            setError(err.response?.data?.error || 'Erreur lors de la commande. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const [ribCopied, setRibCopied] = useState(false);
    const RIB_NUMBER = 'TN59 1000 0000 0000 1234 5678';
    const WHATSAPP_NUMBER = '+21600000000';
    const ADMIN_EMAIL = 'admin@univertechno.com';

    const copyRib = () => {
        navigator.clipboard.writeText(RIB_NUMBER.replace(/\s/g, ''));
        setRibCopied(true);
        setTimeout(() => setRibCopied(false), 2000);
    };

    const handlePayment = () => {
        if (paymentMethod === 'livraison') {
            handleCodCheckout();
        } else if (paymentMethod === 'virement') {
            handleVirementCheckout();
        } else {
            handleCheckout();
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

                                    {/* Choix du mode de paiement */}
                                    <h6 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Mode de paiement</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <div
                                                onClick={() => setPaymentMethod('stripe')}
                                                style={{
                                                    border: paymentMethod === 'stripe' ? '2px solid #4361ee' : '2px solid #e2e8f0',
                                                    borderRadius: '16px', padding: '20px', cursor: 'pointer',
                                                    background: paymentMethod === 'stripe' ? 'linear-gradient(145deg, #eef2ff, #e0e7ff)' : 'white',
                                                    transition: 'all 0.3s ease', height: '100%'
                                                }}
                                            >
                                                <div className="d-flex flex-column align-items-center text-center gap-2">
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '12px',
                                                        background: paymentMethod === 'stripe' ? 'linear-gradient(145deg, #4361ee, #3a0ca3)' : '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: paymentMethod === 'stripe' ? 'white' : '#94a3b8'
                                                    }}>
                                                        <FaCreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>Carte bancaire</div>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Paiement sécurisé via Stripe</small>
                                                    </div>
                                                    {paymentMethod === 'stripe' && (
                                                        <FaCheckCircle style={{ color: '#4361ee' }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div
                                                onClick={() => setPaymentMethod('livraison')}
                                                style={{
                                                    border: paymentMethod === 'livraison' ? '2px solid #16a34a' : '2px solid #e2e8f0',
                                                    borderRadius: '16px', padding: '20px', cursor: 'pointer',
                                                    background: paymentMethod === 'livraison' ? 'linear-gradient(145deg, #f0fdf4, #dcfce7)' : 'white',
                                                    transition: 'all 0.3s ease', height: '100%'
                                                }}
                                            >
                                                <div className="d-flex flex-column align-items-center text-center gap-2">
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '12px',
                                                        background: paymentMethod === 'livraison' ? 'linear-gradient(145deg, #16a34a, #15803d)' : '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: paymentMethod === 'livraison' ? 'white' : '#94a3b8'
                                                    }}>
                                                        <FaMoneyBillWave size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>À la livraison</div>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Payez en espèces à la réception</small>
                                                    </div>
                                                    {paymentMethod === 'livraison' && (
                                                        <FaCheckCircle style={{ color: '#16a34a' }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div
                                                onClick={() => setPaymentMethod('virement')}
                                                style={{
                                                    border: paymentMethod === 'virement' ? '2px solid #ea580c' : '2px solid #e2e8f0',
                                                    borderRadius: '16px', padding: '20px', cursor: 'pointer',
                                                    background: paymentMethod === 'virement' ? 'linear-gradient(145deg, #fff7ed, #ffedd5)' : 'white',
                                                    transition: 'all 0.3s ease', height: '100%'
                                                }}
                                            >
                                                <div className="d-flex flex-column align-items-center text-center gap-2">
                                                    <div style={{
                                                        width: '44px', height: '44px', borderRadius: '12px',
                                                        background: paymentMethod === 'virement' ? 'linear-gradient(145deg, #ea580c, #c2410c)' : '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: paymentMethod === 'virement' ? 'white' : '#94a3b8'
                                                    }}>
                                                        <FaUniversity size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.9rem' }}>Virement bancaire</div>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Transférez sur notre compte</small>
                                                    </div>
                                                    {paymentMethod === 'virement' && (
                                                        <FaCheckCircle style={{ color: '#ea580c' }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bloc info virement bancaire */}
                                    {paymentMethod === 'virement' && (
                                        <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                                            <h6 className="fw-bold mb-3" style={{ color: '#ea580c' }}>
                                                <FaUniversity className="me-2" />Informations de virement
                                            </h6>
                                            <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                                Veuillez effectuer le virement du montant total sur le RIB suivant :
                                            </p>
                                            <div className="d-flex align-items-center gap-2 p-2 rounded-2 mb-3" style={{ backgroundColor: '#fff', border: '1px dashed #ea580c' }}>
                                                <code style={{ fontSize: '1.05rem', color: '#ea580c', fontWeight: '700', letterSpacing: '1px' }}>
                                                    {RIB_NUMBER}
                                                </code>
                                                <button className="btn btn-sm ms-auto" onClick={copyRib}
                                                    style={{
                                                        background: ribCopied ? '#16a34a' : 'linear-gradient(145deg, #ea580c, #c2410c)',
                                                        color: 'white', border: 'none', borderRadius: '8px', padding: '4px 12px',
                                                        fontSize: '0.8rem', fontWeight: '600'
                                                    }}>
                                                    <FaCopy className="me-1" />{ribCopied ? 'Copié !' : 'Copier'}
                                                </button>
                                            </div>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                                                Après le virement, envoyez la preuve (reçu) via l'une des options disponibles sur la page de confirmation.
                                            </p>
                                        </div>
                                    )}

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
                                            onClick={handlePayment}
                                            disabled={loading}
                                            style={{
                                                background: paymentMethod === 'livraison'
                                                    ? 'linear-gradient(145deg, #16a34a, #15803d)'
                                                    : paymentMethod === 'virement'
                                                        ? 'linear-gradient(145deg, #ea580c, #c2410c)'
                                                        : 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                border: 'none', color: 'white', fontWeight: '700',
                                                fontSize: '1.05rem',
                                                boxShadow: paymentMethod === 'livraison'
                                                    ? '0 8px 25px rgba(22, 163, 74, 0.35)'
                                                    : paymentMethod === 'virement'
                                                        ? '0 8px 25px rgba(234, 88, 12, 0.35)'
                                                        : '0 8px 25px rgba(67, 97, 238, 0.35)'
                                            }}>
                                            {loading ? (
                                                <><FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />
                                                    {paymentMethod === 'livraison' ? 'Confirmation en cours...' : paymentMethod === 'virement' ? 'Confirmation en cours...' : 'Redirection vers Stripe...'}
                                                </>
                                            ) : paymentMethod === 'livraison' ? (
                                                <><FaMoneyBillWave className="me-2" />Confirmer - Paiement à la livraison</>
                                            ) : paymentMethod === 'virement' ? (
                                                <><FaUniversity className="me-2" />Confirmer - Virement bancaire</>
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
                                        <FaShieldAlt size={14} style={{ color: paymentMethod === 'virement' ? '#ea580c' : '#4361ee' }} />
                                        <small className="text-muted">
                                            {paymentMethod === 'livraison'
                                                ? 'Paiement en espèces à la livraison'
                                                : paymentMethod === 'virement'
                                                    ? 'Virement bancaire'
                                                    : 'Paiement sécurisé par Stripe'}
                                        </small>
                                    </div>
                                    {paymentMethod === 'stripe' && (
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" style={{ height: '24px' }} />
                                            <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" style={{ height: '24px' }} />
                                        </div>
                                    )}
                                    {paymentMethod === 'livraison' && (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <FaMoneyBillWave size={16} style={{ color: '#16a34a' }} />
                                            <small style={{ color: '#16a34a', fontWeight: '600' }}>Espèces</small>
                                        </div>
                                    )}
                                    {paymentMethod === 'virement' && (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <FaUniversity size={16} style={{ color: '#ea580c' }} />
                                            <small style={{ color: '#ea580c', fontWeight: '600' }}>Virement</small>
                                        </div>
                                    )}
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