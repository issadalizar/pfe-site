import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FaTimesCircle, FaStore, FaArrowLeft,
    FaShoppingCart, FaRedoAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrderCancelPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id') || '';

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
                <div className="text-center" style={{ maxWidth: '500px', animation: 'fadeIn 0.6s ease' }}>
                    <div className="mb-4" style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto', boxShadow: '0 15px 40px rgba(245, 158, 11, 0.3)'
                    }}>
                        <FaTimesCircle size={48} color="white" />
                    </div>
                    <h2 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Paiement annule</h2>
                    <p className="text-muted mb-4" style={{ fontSize: '1.05rem' }}>
                        Votre paiement n'a pas ete finalise. Aucun montant n'a ete debite.
                        Votre panier a ete conserve.
                    </p>

                    <div className="d-flex flex-column gap-3">
                        <button className="btn rounded-pill px-4 py-3 w-100"
                            onClick={() => navigate('/checkout')}
                            style={{
                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                border: 'none', color: 'white', fontWeight: '600',
                                boxShadow: '0 8px 25px rgba(67, 97, 238, 0.35)'
                            }}>
                            <FaRedoAlt className="me-2" />Reessayer le paiement
                        </button>
                        <button className="btn btn-outline-secondary rounded-pill px-4 py-3 w-100"
                            onClick={() => navigate('/cart')}>
                            <FaShoppingCart className="me-2" />Retour au panier
                        </button>
                        <button className="btn btn-link text-muted rounded-pill px-4 py-2"
                            onClick={() => navigate('/home')}>
                            <FaArrowLeft className="me-2" />Continuer mes achats
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OrderCancelPage;
