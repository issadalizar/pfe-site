import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Afficher un loader pendant la vérification du token
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"
                        style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted">Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    // Si non connecté → rediriger vers login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si admin requis mais l'utilisateur n'est pas admin
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
