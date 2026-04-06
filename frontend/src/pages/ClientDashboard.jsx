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
    FaTruck, FaCreditCard, FaExchangeAlt, FaUndoAlt, FaSyncAlt,
    FaBan, FaClock, FaPrint, FaTimesCircle, FaDownload
} from 'react-icons/fa';
import { getMyOrders, cancelOrder } from '../services/orderService';
import { createReturnRequest, getMyReturnRequests } from '../services/returnRequestService';
import { createFacture, getMyFactures } from '../services/factureService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuth();
    const { cart, getCartCount, getCartTotal, updateQuantity, removeFromCart } = useCart();
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

    // Retours/Échanges
    const [returnRequests, setReturnRequests] = useState([]);
    const [returnsLoading, setReturnsLoading] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnForm, setReturnForm] = useState({ type: 'retour', reason: '', items: [] });
    const [returnSubmitting, setReturnSubmitting] = useState(false);
    const [returnSuccess, setReturnSuccess] = useState('');
    const [returnError, setReturnError] = useState('');

    // Annulation de commande
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [now, setNow] = useState(Date.now());
    const [receiptOrder, setReceiptOrder] = useState(null);
    const [factures, setFactures] = useState([]);
    const [facturesLoading, setFacturesLoading] = useState(false);

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

    // Charger les factures : récupérer les commandes, créer les factures manquantes, puis afficher
    useEffect(() => {
        if (activeTab === 'invoices') {
            setFacturesLoading(true);
            (async () => {
                try {
                    // 1. Récupérer les commandes du client
                    const ordersData = await getMyOrders();
                    const myOrders = ordersData.orders || [];
                    console.log('Commandes trouvées:', myOrders.length);

                    // 2. Créer une facture pour chaque commande séquentiellement
                    for (const order of myOrders) {
                        try {
                            await createFacture(order._id);
                        } catch (err) {
                            console.error('Erreur création facture pour', order._id, err.response?.data || err.message);
                        }
                    }

                    // 3. Récupérer toutes les factures
                    const facturesData = await getMyFactures();
                    console.log('Factures récupérées:', facturesData.data?.length);
                    setFactures(facturesData.data || []);
                } catch (err) {
                    console.error('Erreur chargement factures:', err);
                } finally {
                    setFacturesLoading(false);
                }
            })();
        }
    }, [activeTab]);

    // Charger les demandes de retour
    useEffect(() => {
        if (activeTab === 'returns') {
            setReturnsLoading(true);
            getMyReturnRequests()
                .then(data => setReturnRequests(data.returnRequests || []))
                .catch(err => console.error('Erreur chargement retours:', err))
                .finally(() => setReturnsLoading(false));
        }
    }, [activeTab]);

    // Auto-clear return messages
    useEffect(() => {
        if (returnSuccess) {
            const timer = setTimeout(() => setReturnSuccess(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [returnSuccess]);

    // Compteur live pour les commandes COD (mise à jour chaque seconde)
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // ─── Logique annulation ──────────────────────────────────────────────────

    /**
     * Retourne true si la commande a été passée il y a moins de 24h
     * et que son statut autorise encore l'annulation.
     */
    const canCancelOrder = (order) => {https://github.com/issadalizar/pfe-site/pull/2/conflict?name=frontend%252Fsrc%252Fpages%252FClientDashboard.jsx&ancestor_oid=ac40515552bde59bcca968e19ffdd056886a46d0&base_oid=f3530b5072c974446997c7acc5aa16904a019280&head_oid=7bdd1422afc9e92f1ef6f805daaa7ac83d0d585f
        // Seulement les commandes COD (paiement à la livraison)
        // Seulement pour les commandes payées à la livraison (COD)
        if (order.paymentMethod !== 'livraison') return false;
        const cancellableStatuses = ['en_attente', 'confirmee'];
        if (!cancellableStatuses.includes(order.orderStatus)) return false;
        const hoursSinceCreation =
            (now - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation < 24;
    };

    /**
     * Calcule le temps restant avec heures, minutes et secondes.
     */
    const getTimeRemaining = (createdAt) => {
        const msRemaining =
            24 * 60 * 60 * 1000 - (now - new Date(createdAt).getTime());
        if (msRemaining <= 0) return null;
        const hours = Math.floor(msRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
        if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}min ${String(seconds).padStart(2, '0')}s`;
        if (minutes > 0) return `${minutes}min ${String(seconds).padStart(2, '0')}s`;
        return `${seconds}s`;
    };

    const openCancelModal = (order) => {
        setOrderToCancel(order);
        setCancelError('');
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!orderToCancel) return;
        setCancelLoading(true);
        setCancelError('');
        try {
            await cancelOrder(orderToCancel._id);
            // Mettre à jour localement pour éviter un rechargement complet
            setOrders(prev =>
                prev.map(o =>
                    o._id === orderToCancel._id
                        ? { ...o, orderStatus: 'annulee' }
                        : o
                )
            );
            setSuccessMsg('Commande annulée avec succès.');
            setShowCancelModal(false);
            setOrderToCancel(null);
        } catch (err) {
            setCancelError(
                err.response?.data?.error || 'Erreur lors de l\'annulation. Veuillez réessayer.'
            );
        } finally {
            setCancelLoading(false);
        }
    };

    // ────────────────────────────────────────────────────────────────────────

    const openReturnModal = (order) => {
        setSelectedOrder(order);
        setReturnForm({
            type: 'retour',
            reason: '',
            items: order.items.map(item => ({ productName: item.productName, quantity: item.quantity, selected: true }))
        });
        setReturnError('');
        setShowReturnModal(true);
    };

    const handleSubmitReturn = async () => {
        if (!returnForm.reason.trim()) {
            setReturnError('Veuillez indiquer le motif de votre demande.');
            return;
        }
        const selectedItems = returnForm.items.filter(i => i.selected);
        if (selectedItems.length === 0) {
            setReturnError('Veuillez sélectionner au moins un article.');
            return;
        }

        setReturnSubmitting(true);
        setReturnError('');
        try {
            await createReturnRequest({
                orderId: selectedOrder._id,
                type: returnForm.type,
                reason: returnForm.reason,
                items: selectedItems.map(i => ({ productName: i.productName, quantity: i.quantity }))
            });
            setReturnSuccess('Demande envoyée avec succès !');
            setShowReturnModal(false);
            setActiveTab('returns');
        } catch (err) {
            setReturnError(err.response?.data?.error || 'Erreur lors de l\'envoi de la demande.');
        } finally {
            setReturnSubmitting(false);
        }
    };

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

    // Générer et télécharger le PDF d'une facture
    const generatePDF = (facture) => {
        const doc = new jsPDF();
        const orderNumber = facture.factureNumber || facture._id.slice(-8).toUpperCase();

        // Header gradient
        doc.setFillColor(67, 97, 238);
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('UniVerTechno+', 105, 22, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Facture', 105, 32, { align: 'center' });

        // Infos facture
        doc.setTextColor(15, 23, 42);
        let y = 55;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Facture N°: ${orderNumber}`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date(facture.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, y + 7);

        const methodLabel = facture.paymentMethod === 'livraison' ? 'Paiement à la livraison'
            : facture.paymentMethod === 'virement' ? 'Virement bancaire' : 'Carte bancaire';
        doc.text(`Paiement: ${methodLabel}`, 14, y + 14);

        const statusLabel = ({ pending: 'En attente', paid: 'Payé', failed: 'Échoué' })[facture.paymentStatus] || facture.paymentStatus;
        doc.text(`Statut paiement: ${statusLabel}`, 14, y + 21);

        // Adresse de livraison
        y = 90;
        doc.setFillColor(240, 249, 255);
        doc.roundedRect(14, y - 5, 182, 38, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Adresse de livraison', 18, y + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const s = facture.shippingInfo || {};
        doc.text(`${s.fullName || ''}`, 18, y + 10);
        doc.text(`${s.address || ''}, ${s.postalCode || ''} ${s.city || ''}`, 18, y + 17);
        doc.text(`Tél: ${s.phone || ''} | Email: ${s.email || ''}`, 18, y + 24);

        // Tableau articles
        y = 135;
        const tableData = (facture.items || []).map(item => [
            item.productName,
            item.quantity,
            `${formatPrice(item.price)} DT`,
            `${formatPrice(item.price * item.quantity)} DT`
        ]);

        const table = autoTable(doc, {
            startY: y,
            head: [['Produit', 'Qté', 'Prix unit.', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [67, 97, 238],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });

        // Totaux
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setDrawColor(226, 232, 240);
        doc.line(14, finalY, 196, finalY);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Sous-total:', 120, finalY + 10);
        doc.setTextColor(51, 65, 85);
        doc.text(`${formatPrice(facture.totalAmount)} DT`, 196, finalY + 10, { align: 'right' });

        doc.setTextColor(100, 116, 139);
        doc.text('Livraison:', 120, finalY + 18);
        doc.setTextColor(22, 163, 74);
        doc.text('Gratuite', 196, finalY + 18, { align: 'right' });

        doc.line(120, finalY + 23, 196, finalY + 23);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Total:', 120, finalY + 32);
        doc.setTextColor(67, 97, 238);
        doc.text(`${formatPrice(facture.totalAmount)} DT`, 196, finalY + 32, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('UniVerTechno+ - Équipements CNC & Éducation', 105, 285, { align: 'center' });

        doc.save(`Facture_${orderNumber}.pdf`);
    };

    // Créer une facture en DB puis télécharger le PDF
    const handleDownloadFacture = async (order) => {
        try {
            const result = await createFacture(order._id);
            generatePDF(result.data);
        } catch (err) {
            console.error('Erreur génération facture:', err);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Mon Profil', icon: <FaUser /> },
        { id: 'cart', label: 'Mon Panier', icon: <FaShoppingCart /> },
        { id: 'orders', label: 'Mes Commandes', icon: <FaHistory /> },
        { id: 'invoices', label: 'Mes Factures', icon: <FaFileInvoice /> },
        { id: 'returns', label: 'Retours/Échanges', icon: <FaExchangeAlt /> },
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
                                        {cart.length > 0 && (
                                            <button
                                                className="btn rounded-pill px-4"
                                                onClick={() => navigate('/checkout')}
                                                style={{
                                                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                    border: 'none', color: 'white', fontWeight: 600, fontSize: '0.9rem'
                                                }}
                                            >
                                                Passer la commande
                                                <FaChevronRight className="ms-2" size={12} />
                                            </button>
                                        )}
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
                                            {cart.map((item, index) => (
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
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <button className="btn btn-sm" style={{
                                                                width: '26px', height: '26px', padding: 0,
                                                                borderRadius: '8px', border: '1px solid #e2e8f0',
                                                                backgroundColor: '#f8fafc', fontSize: '0.85rem',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }} onClick={() => updateQuantity(item.product.title, item.quantity - 1)}>
                                                                −
                                                            </button>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                                                                {item.quantity}
                                                            </span>
                                                            <button className="btn btn-sm" style={{
                                                                width: '26px', height: '26px', padding: 0,
                                                                borderRadius: '8px', border: '1px solid #e2e8f0',
                                                                backgroundColor: '#f8fafc', fontSize: '0.85rem',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }} onClick={() => updateQuantity(item.product.title, item.quantity + 1)}>
                                                                +
                                                            </button>
                                                            <button className="btn btn-sm ms-1" style={{
                                                                width: '26px', height: '26px', padding: 0,
                                                                borderRadius: '8px', border: 'none',
                                                                backgroundColor: '#fee2e2', color: '#dc2626',
                                                                fontSize: '0.7rem', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center'
                                                            }} onClick={() => removeFromCart(item.product.title)}
                                                                title="Supprimer">
                                                                <FaTimes size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="fw-bold" style={{ color: '#4361ee' }}>
                                                        {formatPrice(item.product.price * item.quantity)} DT
                                                    </div>
                                                </div>
                                            ))}

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
                                                const cancellable = canCancelOrder(order);
                                                const timeLeft = cancellable ? getTimeRemaining(order.createdAt) : null;

                                                return (
                                                    <div key={order._id} className="p-3 mb-3 rounded-3"
                                                        style={{
                                                            backgroundColor: order.orderStatus === 'annulee' ? '#fef2f2' : '#f8fafc',
                                                            border: `1px solid ${order.orderStatus === 'annulee' ? '#fecaca' : '#e2e8f0'}`,
                                                            transition: 'all 0.2s',
                                                            opacity: order.orderStatus === 'annulee' ? 0.75 : 1
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (order.orderStatus !== 'annulee')
                                                                e.currentTarget.style.borderColor = '#4361ee';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor =
                                                                order.orderStatus === 'annulee' ? '#fecaca' : '#e2e8f0';
                                                        }}>

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
                                                            <div className="d-flex gap-2 flex-wrap justify-content-end">
                                                                {order.paymentMethod === 'livraison' && (
                                                                    <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', border: '1px solid #bbf7d0' }}>
                                                                        💰 À la livraison
                                                                    </span>
                                                                )}
                                                                <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: ps.bg, color: ps.color, fontSize: '0.75rem' }}>
                                                                    <FaCreditCard className="me-1" size={10} />{ps.label}
                                                                </span>
                                                                <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: os.bg, color: os.color, fontSize: '0.75rem' }}>
                                                                    <FaTruck className="me-1" size={10} />{os.label}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* ── Alerte date limite retour/échange ── */}
                                                        {order.orderStatus === 'livree' && order.returnDeadline && (() => {
                                                            const deadline = new Date(order.returnDeadline);
                                                            const now = new Date();
                                                            const isExpired = deadline < now;
                                                            const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                                                            return (
                                                                <div style={{
                                                                    background: isExpired
                                                                        ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                                                                        : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                                                                    border: `1px solid ${isExpired ? '#fecaca' : '#fde68a'}`,
                                                                    borderRadius: '10px',
                                                                    padding: '8px 14px',
                                                                    marginBottom: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px',
                                                                    fontSize: '0.82rem'
                                                                }}>
                                                                    <span style={{ fontSize: '1.1rem' }}>{isExpired ? '⛔' : '⚠️'}</span>
                                                                    <div>
                                                                        {isExpired ? (
                                                                            <span style={{ color: '#991b1b', fontWeight: 600 }}>
                                                                                Le délai pour demander un retour/échange est expiré depuis le {deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{ color: '#92400e', fontWeight: 600 }}>
                                                                                Vous avez jusqu'au <strong>{deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong> pour demander un retour ou échange.
                                                                                {daysLeft <= 3 && <span style={{ color: '#dc2626' }}> ({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''} !)</span>}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                                {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                                            </span>

                                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                {/* ── Bouton Annuler (≤ 24h) ── */}
                                                                {cancellable && (
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        {/* Minuteur */}
                                                                        {timeLeft && (
                                                                            <span style={{
                                                                                fontSize: '0.72rem',
                                                                                backgroundColor: '#fff7ed',
                                                                                color: '#c2410c',
                                                                                border: '1px solid #fed7aa',
                                                                                borderRadius: '20px',
                                                                                padding: '3px 10px',
                                                                                fontWeight: 500,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px'
                                                                            }}>
                                                                                <FaClock size={9} />
                                                                                {timeLeft}
                                                                            </span>
                                                                        )}
                                                                        <button
                                                                            className="btn btn-sm rounded-pill px-3"
                                                                            style={{
                                                                                border: '1.5px solid #dc2626',
                                                                                background: 'white',
                                                                                color: '#dc2626',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 600,
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.currentTarget.style.background = '#dc2626';
                                                                                e.currentTarget.style.color = 'white';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.currentTarget.style.background = 'white';
                                                                                e.currentTarget.style.color = '#dc2626';
                                                                            }}
                                                                            onClick={(e) => { e.stopPropagation(); openCancelModal(order); }}
                                                                        >
                                                                            <FaBan className="me-1" size={10} />
                                                                            Annuler la commande
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* ── Bouton Retour/Échange (livrée) ── */}
                                                                {order.orderStatus === 'livree' && order.paymentStatus === 'paid' && (
                                                                    (() => {
                                                                        const deadlinePassed = order.returnDeadline && new Date(order.returnDeadline) < new Date();
                                                                        if (deadlinePassed) {
                                                                            return (
                                                                                <span style={{
                                                                                    fontSize: '0.72rem', color: '#991b1b',
                                                                                    backgroundColor: '#fee2e2', border: '1px solid #fecaca',
                                                                                    borderRadius: '20px', padding: '3px 10px', fontWeight: 500
                                                                                }}>
                                                                                    <FaClock size={9} className="me-1" />Délai retour expiré
                                                                                </span>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                {order.returnDeadline && (
                                                                                    <span style={{
                                                                                        fontSize: '0.72rem', color: '#c2410c',
                                                                                        backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
                                                                                        borderRadius: '20px', padding: '3px 10px', fontWeight: 500,
                                                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                                                    }}>
                                                                                        <FaCalendarAlt size={9} />
                                                                                        Avant le {new Date(order.returnDeadline).toLocaleDateString('fr-FR', {
                                                                                            day: '2-digit', month: 'short'
                                                                                        })}
                                                                                    </span>
                                                                                )}
                                                                                <button
                                                                                    className="btn btn-sm rounded-pill px-3"
                                                                                    style={{
                                                                                        background: 'linear-gradient(145deg, #dc2626, #991b1b)',
                                                                                        border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 600
                                                                                    }}
                                                                                    onClick={(e) => { e.stopPropagation(); openReturnModal(order); }}
                                                                                >
                                                                                    <FaExchangeAlt className="me-1" size={10} />
                                                                                    Retour/Échange
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })()
                                                                )}

                                                                <span className="fw-bold" style={{ color: '#4361ee' }}>
                                                                    {formatPrice(order.totalAmount)} DT
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Modal de confirmation d'annulation ── */}
                        {showCancelModal && orderToCancel && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} onClick={() => !cancelLoading && setShowCancelModal(false)}>
                                <div className="card border-0 rounded-4 shadow-lg"
                                    style={{ maxWidth: '440px', width: '95%' }}
                                    onClick={e => e.stopPropagation()}>
                                    <div className="card-body p-4 text-center">
                                        {/* Icône */}
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '50%',
                                            background: '#fef2f2', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', margin: '0 auto 16px'
                                        }}>
                                            <FaBan size={28} style={{ color: '#dc2626' }} />
                                        </div>

                                        <h5 className="fw-bold mb-2" style={{ color: '#0f172a' }}>
                                            Annuler la commande ?
                                        </h5>
                                        <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                            Commande <strong style={{ color: '#4361ee' }}>
                                                #{orderToCancel._id.slice(-8).toUpperCase()}
                                            </strong>
                                        </p>
                                        <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                                            Cette action est irréversible. En cas de paiement effectué,
                                            le remboursement sera traité sous 3 à 5 jours ouvrables.
                                        </p>

                                        {/* Alerte d'erreur */}
                                        {cancelError && (
                                            <div className="alert alert-danger d-flex align-items-center rounded-3 mb-3 py-2 text-start">
                                                <FaExclamationTriangle className="me-2 flex-shrink-0" />
                                                <div style={{ fontSize: '0.85rem' }}>{cancelError}</div>
                                            </div>
                                        )}

                                        <div className="d-flex gap-3 justify-content-center">
                                            <button
                                                className="btn btn-outline-secondary rounded-pill px-4"
                                                onClick={() => setShowCancelModal(false)}
                                                disabled={cancelLoading}
                                            >
                                                Conserver
                                            </button>
                                            <button
                                                className="btn rounded-pill px-4"
                                                style={{
                                                    background: 'linear-gradient(145deg, #dc2626, #991b1b)',
                                                    border: 'none', color: 'white', fontWeight: 600
                                                }}
                                                onClick={handleConfirmCancel}
                                                disabled={cancelLoading}
                                            >
                                                {cancelLoading ? (
                                                    <><FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />Annulation...</>
                                                ) : (
                                                    <><FaBan className="me-2" size={13} />Oui, annuler</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Factures */}
                        {activeTab === 'invoices' && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                        <FaFileInvoice className="me-2" style={{ color: '#4361ee' }} />
                                        Mes Factures
                                    </h4>

                                    {facturesLoading ? (
                                        <div className="text-center py-5">
                                            <FaSpinner size={32} style={{ color: '#4361ee', animation: 'spin 1s linear infinite' }} />
                                            <p className="text-muted mt-3">Chargement des factures...</p>
                                        </div>
                                    ) : factures.length === 0 ? (
                                        <div className="text-center py-5">
                                            <FaFileInvoice size={48} style={{ color: '#cbd5e1' }} />
                                            <h5 className="text-muted mt-3">Aucune facture</h5>
                                            <p className="text-muted">Vos factures apparaitront ici apres vos commandes</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {factures.map((facture) => (
                                                <div key={facture._id} className="d-flex justify-content-between align-items-center p-3 mb-2 rounded-3"
                                                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <div>
                                                        <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                                                            {facture.factureNumber}
                                                        </span>
                                                        <br />
                                                        <small className="text-muted">
                                                            {new Date(facture.createdAt).toLocaleDateString('fr-FR', {
                                                                day: '2-digit', month: 'long', year: 'numeric'
                                                            })}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="fw-bold" style={{ color: '#4361ee', fontSize: '0.95rem' }}>
                                                            {formatPrice(facture.totalAmount)} DT
                                                        </span>
                                                        <button
                                                            className="btn btn-sm rounded-pill px-3"
                                                            style={{
                                                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                                                border: 'none', color: 'white',
                                                                fontSize: '0.75rem', fontWeight: 600
                                                            }}
                                                            onClick={() => setReceiptOrder(facture)}
                                                        >
                                                            <FaPrint className="me-1" size={10} />
                                                            Voir
                                                        </button>
                                                        <button
                                                            className="btn btn-sm rounded-pill px-3"
                                                            style={{
                                                                background: 'linear-gradient(145deg, #16a34a, #15803d)',
                                                                border: 'none', color: 'white',
                                                                fontSize: '0.75rem', fontWeight: 600
                                                            }}
                                                            onClick={() => generatePDF(facture)}
                                                        >
                                                            <FaDownload className="me-1" size={10} />
                                                            PDF
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Retours/Échanges */}
                        {activeTab === 'returns' && (
                            <div className="card border-0 rounded-4 shadow-sm">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
                                        <FaExchangeAlt className="me-2" style={{ color: '#dc2626' }} />
                                        Mes Demandes de Retour / Échange
                                    </h4>

                                    {returnsLoading ? (
                                        <div className="text-center py-5">
                                            <FaSpinner size={32} style={{ color: '#4361ee', animation: 'spin 1s linear infinite' }} />
                                            <p className="text-muted mt-3">Chargement...</p>
                                        </div>
                                    ) : returnRequests.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div style={{
                                                width: '80px', height: '80px', borderRadius: '24px',
                                                background: 'linear-gradient(145deg, #dc262615, #991b1b15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 16px'
                                            }}>
                                                <FaExchangeAlt size={32} style={{ color: '#dc2626' }} />
                                            </div>
                                            <h5 className="fw-bold text-muted">Aucune demande</h5>
                                            <p className="text-muted mb-4">
                                                Vous pouvez demander un retour ou échange depuis l'onglet Commandes
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            {returnRequests.map((req) => {
                                                const statusMap = {
                                                    en_attente: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
                                                    acceptee: { bg: '#d1fae5', color: '#065f46', label: 'Acceptée' },
                                                    refusee: { bg: '#fee2e2', color: '#991b1b', label: 'Refusée' },
                                                };
                                                const ss = statusMap[req.status] || statusMap.en_attente;
                                                const typeIcon = req.type === 'retour' ? <FaUndoAlt size={10} /> : <FaSyncAlt size={10} />;
                                                const typeLabel = req.type === 'retour' ? 'Retour' : 'Échange';
                                                const typeBg = req.type === 'retour' ? '#fee2e2' : '#dbeafe';
                                                const typeColor = req.type === 'retour' ? '#991b1b' : '#1e40af';

                                                return (
                                                    <div key={req._id} className="p-3 mb-3 rounded-3"
                                                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#dc2626'}
                                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                                                                    #{req._id.slice(-8).toUpperCase()}
                                                                </span>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {new Date(req.createdAt).toLocaleDateString('fr-FR', {
                                                                        day: '2-digit', month: 'long', year: 'numeric'
                                                                    })}
                                                                </small>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: typeBg, color: typeColor, fontSize: '0.75rem' }}>
                                                                    {typeIcon} <span className="ms-1">{typeLabel}</span>
                                                                </span>
                                                                <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: ss.bg, color: ss.color, fontSize: '0.75rem' }}>
                                                                    {ss.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                            <strong>Motif :</strong> {req.reason}
                                                        </p>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {req.items?.map((item, idx) => (
                                                                <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
                                                                    {item.productName} x{item.quantity}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {req.adminNote && (
                                                            <div className="mt-2 p-2 rounded-2" style={{
                                                                backgroundColor: req.status === 'acceptee' ? '#f0fdf4' : '#fef2f2',
                                                                border: `1px solid ${req.status === 'acceptee' ? '#bbf7d0' : '#fecaca'}`,
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <strong>Réponse admin :</strong> {req.adminNote}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Modal: Demande de retour/échange */}
                        {showReturnModal && selectedOrder && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} onClick={() => setShowReturnModal(false)}>
                                <div className="card border-0 rounded-4 shadow-lg" style={{ maxWidth: '550px', width: '95%', maxHeight: '90vh', overflow: 'auto' }}
                                    onClick={e => e.stopPropagation()}>
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h5 className="fw-bold mb-0">
                                                <FaExchangeAlt className="me-2" style={{ color: '#dc2626' }} />
                                                Demande de Retour / Échange
                                            </h5>
                                            <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => setShowReturnModal(false)}>
                                                <FaTimes />
                                            </button>
                                        </div>

                                        <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <small className="text-muted">Commande</small>
                                            <div className="fw-bold" style={{ color: '#4361ee' }}>#{selectedOrder._id.slice(-8).toUpperCase()}</div>
                                        </div>

                                        {returnError && (
                                            <div className="alert alert-danger d-flex align-items-center rounded-3 mb-3 py-2">
                                                <FaExclamationTriangle className="me-2" />
                                                <div style={{ fontSize: '0.9rem' }}>{returnError}</div>
                                            </div>
                                        )}

                                        <label className="form-label fw-medium">Type de demande</label>
                                        <div className="d-flex gap-2 mb-3">
                                            <button
                                                className={`btn flex-fill rounded-pill ${returnForm.type === 'retour' ? '' : 'btn-outline-secondary'}`}
                                                style={returnForm.type === 'retour' ? { background: 'linear-gradient(145deg, #dc2626, #991b1b)', border: 'none', color: 'white' } : {}}
                                                onClick={() => setReturnForm({ ...returnForm, type: 'retour' })}
                                            >
                                                <FaUndoAlt className="me-2" />Retour
                                            </button>
                                            <button
                                                className={`btn flex-fill rounded-pill ${returnForm.type === 'echange' ? '' : 'btn-outline-secondary'}`}
                                                style={returnForm.type === 'echange' ? { background: 'linear-gradient(145deg, #1e40af, #1e3a8a)', border: 'none', color: 'white' } : {}}
                                                onClick={() => setReturnForm({ ...returnForm, type: 'echange' })}
                                            >
                                                <FaSyncAlt className="me-2" />Échange
                                            </button>
                                        </div>

                                        <label className="form-label fw-medium">Motif</label>
                                        <textarea
                                            className="form-control mb-3 rounded-3"
                                            rows="3"
                                            placeholder="Décrivez la raison de votre demande..."
                                            value={returnForm.reason}
                                            onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                                        />

                                        <label className="form-label fw-medium">Articles concernés</label>
                                        {returnForm.items.map((item, idx) => (
                                            <div key={idx} className="d-flex align-items-center gap-2 mb-2 p-2 rounded-2" style={{ backgroundColor: '#f8fafc' }}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={item.selected}
                                                    onChange={() => {
                                                        const newItems = [...returnForm.items];
                                                        newItems[idx].selected = !newItems[idx].selected;
                                                        setReturnForm({ ...returnForm, items: newItems });
                                                    }}
                                                />
                                                <span className="flex-grow-1" style={{ fontSize: '0.9rem' }}>{item.productName}</span>
                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>x{item.quantity}</span>
                                            </div>
                                        ))}

                                        <div className="d-flex gap-2 mt-4">
                                            <button className="btn btn-outline-secondary rounded-pill flex-fill" onClick={() => setShowReturnModal(false)}>
                                                Annuler
                                            </button>
                                            <button
                                                className="btn rounded-pill flex-fill"
                                                style={{ background: 'linear-gradient(145deg, #dc2626, #991b1b)', border: 'none', color: 'white', fontWeight: 600 }}
                                                onClick={handleSubmitReturn}
                                                disabled={returnSubmitting}
                                            >
                                                {returnSubmitting ? (
                                                    <><FaSpinner className="me-2" style={{ animation: 'spin 1s linear infinite' }} />Envoi...</>
                                                ) : (
                                                    <><FaExchangeAlt className="me-2" />Envoyer la demande</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
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

            {/* ── Modal Facture / Reçu de Commande ── */}
            {receiptOrder && (
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
                        {/* Header actions */}
                        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
                            <h5 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>
                                <FaFileInvoice className="me-2" style={{ color: '#4361ee' }} />
                                Facture
                            </h5>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-primary rounded-pill px-3"
                                    onClick={() => {
                                        const printWindow = window.open('', '_blank');
                                        const o = receiptOrder;
                                        const orderDate = new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
                                        const orderNumber = o._id.slice(-8).toUpperCase();
                                        const statusMap = { en_attente: 'En attente', confirmee: 'Confirmée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' };
                                        const paymentMap = { pending: 'En attente', paid: 'Payé', failed: 'Échoué' };
                                        const methodLabel = o.paymentMethod === 'livraison' ? ' (à la livraison)' : o.paymentMethod === 'virement' ? ' (virement bancaire)' : '';
                                        const itemsHTML = o.items.map(item => `
                                            <tr>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${item.productName}</td>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:14px;color:#64748b;">${item.quantity}</td>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;color:#334155;">${formatPrice(item.price)} DT</td>
                                                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:600;color:#0f172a;">${formatPrice(item.price * item.quantity)} DT</td>
                                            </tr>`).join('');
                                        printWindow.document.write(`
                                            <!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture #${orderNumber}</title></head>
                                            <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                                            <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
                                                <div style="background:linear-gradient(145deg,#4361ee,#3a0ca3);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;">
                                                    <h1 style="margin:0;color:white;font-size:26px;font-weight:700;">UniVerTechno+</h1>
                                                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Facture</p>
                                                </div>
                                                <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                                                    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
                                                        <table style="width:100%;border-collapse:collapse;">
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">N° de commande</td><td style="padding:4px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">#${orderNumber}</td></tr>
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Date</td><td style="padding:4px 0;font-size:13px;color:#0f172a;text-align:right;">${orderDate}</td></tr>
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Statut</td><td style="padding:4px 0;font-size:13px;color:#065f46;font-weight:600;text-align:right;">${statusMap[o.orderStatus] || o.orderStatus}</td></tr>
                                                            <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Paiement</td><td style="padding:4px 0;font-size:13px;color:#065f46;font-weight:600;text-align:right;">${paymentMap[o.paymentStatus] || o.paymentStatus}${methodLabel}</td></tr>
                                                        </table>
                                                    </div>
                                                    <h3 style="margin:0 0 12px;font-size:15px;color:#0f172a;font-weight:600;">Adresse de livraison</h3>
                                                    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;margin-bottom:28px;font-size:13px;color:#334155;line-height:1.6;">
                                                        <strong>${o.shippingInfo?.fullName}</strong><br>
                                                        ${o.shippingInfo?.address}<br>
                                                        ${o.shippingInfo?.postalCode} ${o.shippingInfo?.city}<br>
                                                        Tél: ${o.shippingInfo?.phone}<br>
                                                        Email: ${o.shippingInfo?.email}
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
                                                            <tr><td style="padding:6px 16px;font-size:14px;color:#64748b;">Sous-total</td><td style="padding:6px 16px;text-align:right;font-size:14px;color:#334155;">${formatPrice(o.totalAmount)} DT</td></tr>
                                                            <tr><td style="padding:6px 16px;font-size:14px;color:#64748b;">Livraison</td><td style="padding:6px 16px;text-align:right;font-size:14px;color:#16a34a;font-weight:500;">Gratuite</td></tr>
                                                            <tr><td style="padding:14px 16px;font-size:18px;font-weight:700;color:#0f172a;">Total</td><td style="padding:14px 16px;text-align:right;font-size:20px;font-weight:700;color:#4361ee;">${formatPrice(o.totalAmount)} DT</td></tr>
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
                                <button className="btn btn-sm rounded-pill px-3"
                                    style={{ background: 'linear-gradient(145deg, #16a34a, #15803d)', border: 'none', color: 'white' }}
                                    onClick={() => generatePDF(receiptOrder)}>
                                    <FaDownload className="me-1" /> PDF
                                </button>
                                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                    onClick={() => setReceiptOrder(null)}>
                                    <FaTimesCircle className="me-1" /> Fermer
                                </button>
                            </div>
                        </div>

                        {/* Receipt content */}
                        <div style={{ padding: '16px 24px 24px' }}>
                            {/* Header gradient */}
                            <div style={{
                                background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                                borderRadius: '16px 16px 0 0', padding: '32px 24px', textAlign: 'center'
                            }}>
                                <h2 style={{ margin: 0, color: 'white', fontSize: '22px', fontWeight: 700 }}>UniVerTechno+</h2>
                                <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>Facture</p>
                            </div>

                            {/* Body */}
                            <div style={{
                                backgroundColor: 'white', padding: '28px',
                                borderRadius: '0 0 16px 16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                            }}>
                                {/* Order info */}
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{receiptOrder.factureNumber ? 'N° Facture' : 'N° de commande'}</span>
                                        <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{receiptOrder.factureNumber || `#${receiptOrder._id.slice(-8).toUpperCase()}`}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Date</span>
                                        <span style={{ fontSize: '0.82rem', color: '#0f172a' }}>{new Date(receiptOrder.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Statut</span>
                                        <span className="badge rounded-pill px-2 py-1" style={{
                                            fontSize: '0.75rem',
                                            backgroundColor: ({
                                                en_attente: '#fef3c7', confirmee: '#d1fae5', expediee: '#dbeafe', livree: '#d1fae5', annulee: '#fee2e2'
                                            })[receiptOrder.orderStatus] || '#fef3c7',
                                            color: ({
                                                en_attente: '#92400e', confirmee: '#065f46', expediee: '#1e40af', livree: '#065f46', annulee: '#991b1b'
                                            })[receiptOrder.orderStatus] || '#92400e',
                                            fontWeight: 600
                                        }}>
                                            {({ en_attente: 'En attente', confirmee: 'Confirmée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' })[receiptOrder.orderStatus] || receiptOrder.orderStatus}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Paiement</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: receiptOrder.paymentStatus === 'paid' ? '#065f46' : '#92400e' }}>
                                            {({ pending: 'En attente', paid: 'Payé', failed: 'Échoué' })[receiptOrder.paymentStatus] || receiptOrder.paymentStatus}
                                            {receiptOrder.paymentMethod === 'livraison' && ' (à la livraison)'}
                                            {receiptOrder.paymentMethod === 'virement' && ' (virement bancaire)'}
                                        </span>
                                    </div>
                                </div>

                                {/* Shipping */}
                                <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                                    <FaMapMarkerAlt className="me-2 text-primary" />Adresse de livraison
                                </h6>
                                <div style={{
                                    background: '#f0f9ff', border: '1px solid #bae6fd',
                                    borderRadius: '10px', padding: '14px', marginBottom: '24px',
                                    fontSize: '0.82rem', color: '#334155', lineHeight: 1.7
                                }}>
                                    <strong>{receiptOrder.shippingInfo?.fullName}</strong><br />
                                    {receiptOrder.shippingInfo?.address}<br />
                                    {receiptOrder.shippingInfo?.postalCode} {receiptOrder.shippingInfo?.city}<br />
                                    <FaPhone size={10} className="me-1" />{receiptOrder.shippingInfo?.phone}<br />
                                    <FaEnvelope size={10} className="me-1" />{receiptOrder.shippingInfo?.email}
                                </div>

                                {/* Items */}
                                <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                                    <FaBox className="me-2 text-primary" />Articles commandés
                                </h6>
                                <table className="table mb-3" style={{ fontSize: '0.82rem' }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Produit</th>
                                            <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Qté</th>
                                            <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Prix unit.</th>
                                            <th style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receiptOrder.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ color: '#334155' }}>{item.productName}</td>
                                                <td style={{ textAlign: 'center', color: '#64748b' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right', color: '#334155' }}>{formatPrice(item.price)} DT</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{formatPrice(item.price * item.quantity)} DT</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '14px' }}>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Sous-total</span>
                                        <span style={{ fontSize: '0.85rem', color: '#334155' }}>{formatPrice(receiptOrder.totalAmount)} DT</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Livraison</span>
                                        <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>Gratuite</span>
                                    </div>
                                    <div className="d-flex justify-content-between" style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Total</span>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4361ee' }}>{formatPrice(receiptOrder.totalAmount)} DT</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ textAlign: 'center', padding: '16px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                UniVerTechno+ - Équipements CNC & Éducation
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
