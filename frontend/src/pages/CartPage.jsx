import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaShoppingCart, FaTrash, FaArrowLeft, FaArrowRight,
    FaMinus, FaPlus, FaStore, FaUser, FaLock, FaTimes,
    FaShieldAlt, FaTruck, FaCheckCircle, FaSearch, FaGlobe, FaBars,
    FaBox
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import '../styles/cart.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const CartPage = () => {
    const navigate = useNavigate();
    const {
        cart, notification, removeFromCart,
        updateQuantity, clearCart, getCartTotal, getCartCount
    } = useCart();

    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-TN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const handleCheckout = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
        } else {
            alert('Commande passée avec succès ! Nous vous contacterons bientôt.');
            clearCart();
            navigate('/home');
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login?redirect=/cart');
    };

    const subtotal = getCartTotal();
    const total = subtotal;

    return (
        <div className="cart-page">
            {/* Notification toast */}
            {notification && (
                <div className="cart-notification">
                    <div className="alert">
                        <FaCheckCircle size={18} />
                        {notification}
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
                        {/* Logo */}
                        <div className="d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
                            <div
                                className="me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                    borderRadius: '14px',
                                    color: 'white',
                                    fontSize: '26px',
                                    boxShadow: '0 8px 20px rgba(67, 97, 238, 0.3)'
                                }}
                            >
                                <FaStore />
                            </div>
                            <h1 className="fw-bold mb-0" style={{
                                fontSize: '1.6rem',
                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.5px'
                            }}>
                                UniVer<span style={{ color: '#4361ee', WebkitTextFillColor: '#4361ee' }}>Techno</span>+
                            </h1>
                        </div>

                        {/* Cart info */}
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <FaShoppingCart style={{ color: '#4361ee', fontSize: '20px' }} />
                                <span className="fw-bold" style={{ color: '#0f172a' }}>
                                    Mon Panier ({getCartCount()})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="bg-white border-bottom">
                <div className="container py-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/home" className="text-decoration-none" style={{ color: '#4361ee' }}>Accueil</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Panier</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-4">
                {cart.length === 0 ? (
                    /* Empty cart state */
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <FaShoppingCart size={48} style={{ color: '#4361ee' }} />
                        </div>
                        <h3>Votre panier est vide</h3>
                        <p>Parcourez notre catalogue et ajoutez des produits à votre panier</p>
                        <button
                            className="btn btn-lg px-5 py-3 rounded-pill"
                            onClick={() => navigate('/home#products')}
                            style={{
                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '600'
                            }}
                        >
                            <FaArrowLeft className="me-2" />
                            Découvrir nos produits
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {/* Cart items column */}
                        <div className="col-lg-8">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                                    Articles ({getCartCount()})
                                </h4>
                                <button
                                    className="btn btn-sm text-danger"
                                    onClick={clearCart}
                                    style={{ fontWeight: '500' }}
                                >
                                    <FaTrash className="me-1" size={12} />
                                    Vider le panier
                                </button>
                            </div>

                            {cart.map((item, index) => (
                                <div key={index} className="cart-item-card">
                                    <div className="d-flex gap-3 align-items-center flex-wrap flex-md-nowrap">
                                        {/* Product image */}
                                        <div className="cart-item-image">
                                            {item.product.images && item.product.images[0] ? (
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.title}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <FaBox size={32} style={{ color: '#94a3b8' }} />
                                            )}
                                        </div>

                                        {/* Product info */}
                                        <div className="cart-item-info">
                                            <div className="cart-item-title">{item.product.title}</div>
                                            <div className="cart-item-category">
                                                {item.product.category || item.product.mainCategory}
                                            </div>
                                            <div className="cart-item-price">
                                                {formatPrice(item.product.price)} DT
                                            </div>
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="quantity-controls">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(item.product.title, item.quantity - 1)}
                                            >
                                                <FaMinus size={12} />
                                            </button>
                                            <span className="quantity-value">{item.quantity}</span>
                                            <button
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(item.product.title, item.quantity + 1)}
                                            >
                                                <FaPlus size={12} />
                                            </button>
                                        </div>

                                        {/* Line total */}
                                        <div className="text-end" style={{ minWidth: '120px' }}>
                                            <div className="fw-bold" style={{ color: '#0f172a', fontSize: '1.1rem' }}>
                                                {formatPrice(item.product.price * item.quantity)} DT
                                            </div>
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item.product.title)}
                                            title="Supprimer"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary column */}
                        <div className="col-lg-4">
                            <div className="cart-summary">
                                <div className="cart-summary-title">Récapitulatif</div>

                                <div className="cart-summary-row">
                                    <span className="text-muted">Sous-total</span>
                                    <span className="fw-medium">{formatPrice(subtotal)} DT</span>
                                </div>

                                <div className="cart-summary-row">
                                    <span className="text-muted">
                                        <FaTruck className="me-1" size={14} />
                                        Livraison
                                    </span>
                                    <span className="fw-medium text-success">Gratuite</span>
                                </div>

                                <div className="cart-summary-row total">
                                    <span>Total</span>
                                    <span className="cart-total-value">{formatPrice(total)} DT</span>
                                </div>

                                <button className="cart-checkout-btn" onClick={handleCheckout}>
                                    <FaLock size={14} />
                                    Passer la commande
                                </button>

                                <button
                                    className="cart-continue-btn"
                                    onClick={() => navigate('/home#products')}
                                >
                                    <FaArrowLeft size={14} />
                                    Continuer les achats
                                </button>

                                <div className="mt-4 text-center">
                                    <small className="text-muted d-flex align-items-center justify-content-center gap-2">
                                        <FaShieldAlt size={14} style={{ color: '#4361ee' }} />
                                        Paiement sécurisé • Garantie 2 ans
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Login prompt modal */}
            {showLoginPrompt && (
                <div className="login-prompt-overlay" onClick={() => setShowLoginPrompt(false)}>
                    <div className="login-prompt-card" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="btn position-absolute"
                            style={{ top: '15px', right: '15px', color: '#94a3b8' }}
                            onClick={() => setShowLoginPrompt(false)}
                        >
                            <FaTimes size={20} />
                        </button>

                        <div className="login-prompt-icon">
                            <FaUser size={32} style={{ color: '#4361ee' }} />
                        </div>

                        <h4>Connexion requise</h4>
                        <p>Vous devez être connecté pour passer une commande. Connectez-vous ou créez un compte pour continuer.</p>

                        <button
                            className="btn w-100 py-3 rounded-3 fw-medium mb-3"
                            onClick={handleLoginRedirect}
                            style={{
                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                color: 'white',
                                border: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            <FaUser className="me-2" />
                            Se connecter
                        </button>

                        <button
                            className="btn btn-outline-secondary w-100 py-3 rounded-3"
                            onClick={() => setShowLoginPrompt(false)}
                        >
                            Continuer mes achats
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
