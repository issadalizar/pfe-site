import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { verifySession } from '../services/orderService';
import {
    FaCheckCircle, FaStore, FaShoppingCart,
    FaArrowLeft, FaSpinner, FaFileInvoice, FaMoneyBillWave
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const orderIdParam = searchParams.get('order_id');
        const paymentType = searchParams.get('payment');
        setOrderId(orderIdParam || '');

        const verify = async () => {
            try {
                if (paymentType === 'cod') {
                    // Commande COD - pas besoin de vérifier Stripe
                    clearCart();
                    setVerified(true);
                } else if (sessionId) {
                    const result = await verifySession(sessionId);
                    if (result.paymentStatus === 'paid') {
                        setVerified(true);
                        clearCart();
                    }
                } else {
                    clearCart();
                    setVerified(true);
                }
            } catch (err) {
                console.error('Verification error:', err);
                clearCart();
                setVerified(true);
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, []);

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {/* Header */}
            <header className="py-3" style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.03)',
                borderBottom: '1px solid rgba(67, 97, 238, 0.1)'
            }}>
                <div className="container">
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
                </div>
            </header>

            {/* Content */}
            <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="text-center" style={{ maxWidth: '500px' }}>
                    {loading ? (
                        <div>
                            <FaSpinner size={48} style={{ color: '#4361ee', animation: 'spin 1s linear infinite' }} />
                            <h4 className="fw-bold mt-4" style={{ color: '#0f172a' }}>Verification du paiement...</h4>
                            <p className="text-muted">Veuillez patienter quelques instants</p>
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.6s ease' }}>
                            <div className="mb-4" style={{
                                width: '100px', height: '100px', borderRadius: '50%',
                                background: 'linear-gradient(145deg, #16a34a, #15803d)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto', boxShadow: '0 15px 40px rgba(22, 163, 74, 0.35)'
                            }}>
                                <FaCheckCircle size={48} color="white" />
                            </div>
                            <h2 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Commande confirmée !</h2>
                            {searchParams.get('payment') === 'cod' ? (
                                <>
                                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                        <FaMoneyBillWave style={{ color: '#16a34a' }} />
                                        <span className="fw-medium" style={{ color: '#16a34a' }}>Paiement à la livraison</span>
                                    </div>
                                    <p className="text-muted mb-2" style={{ fontSize: '1.05rem' }}>
                                        Votre commande a été enregistrée avec succès.
                                    </p>
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                                        Vous paierez en espèces lors de la réception de votre commande.
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted mb-2" style={{ fontSize: '1.05rem' }}>
                                    Votre paiement a ete traite avec succes.
                                </p>
                            )}
                            {orderId && (
                                <p className="mb-4" style={{ fontSize: '0.9rem' }}>
                                    <span className="text-muted">N de commande : </span>
                                    <span className="fw-bold" style={{ color: '#4361ee' }}>#{orderId.slice(-8).toUpperCase()}</span>
                                </p>
                            )}
                            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                                Un email de confirmation sera envoye a votre adresse email.
                            </p>

                            <div className="d-flex flex-column gap-3">
                                <button className="btn rounded-pill px-4 py-3 w-100"
                                    onClick={() => navigate('/client/dashboard')}
                                    style={{
                                        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                        border: 'none', color: 'white', fontWeight: '600',
                                        boxShadow: '0 8px 25px rgba(67, 97, 238, 0.35)'
                                    }}>
                                    <FaFileInvoice className="me-2" />Voir mes commandes
                                </button>
                                <button className="btn btn-outline-secondary rounded-pill px-4 py-3 w-100"
                                    onClick={() => navigate('/home')}>
                                    <FaArrowLeft className="me-2" />Retour a la boutique
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OrderSuccessPage;
