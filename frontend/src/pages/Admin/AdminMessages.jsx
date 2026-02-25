import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';
import { FaEnvelope, FaClock, FaUser, FaTag, FaSearch, FaFilter, FaFileInvoice, FaCommentDots } from 'react-icons/fa';
import { devisAPI } from '../../services/devisAPI';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [quoteMessages, setQuoteMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contact');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
        fetchQuoteMessages();
    }, []);

    // ✅ Fonction ajoutée pour récupérer les messages de contact
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll();
            console.log('Messages de contact reçus:', response.data);
            setMessages(response.data.data || response.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fonction pour récupérer les demandes de devis
    const fetchQuoteMessages = async () => {
        try {
            setLoading(true);
            // Récupération depuis localStorage pour les tests locaux
            const localDevis = JSON.parse(localStorage.getItem('devis_list') || '[]');
            
            if (localDevis.length > 0) {
                console.log('Devis locaux trouvés:', localDevis);
                setQuoteMessages(localDevis);
            } else {
                // Si pas de données locales, essayer l'API
                const response = await devisAPI.getAll();
                console.log('Devis API reçus:', response.data);
                setQuoteMessages(response.data.data || response.data || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des devis:', error);
            setQuoteMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fonction pour mettre à jour le statut d'un message
    const updateMessageStatus = async (id, newStatus, type = 'contact') => {
        try {
            if (type === 'contact') {
                await contactAPI.updateStatus(id, newStatus);
                await fetchMessages(); // Recharger la liste
            } else {
                await devisAPI.updateStatus(id, newStatus);
                await fetchQuoteMessages(); // Recharger la liste
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
        }
    };

    // ✅ Fonction pour supprimer un message
    const deleteMessage = async (id, type = 'contact') => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
            try {
                if (type === 'contact') {
                    await contactAPI.delete(id);
                    await fetchMessages();
                } else {
                    await devisAPI.delete(id);
                    await fetchQuoteMessages();
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge bg-warning text-dark">En attente</span>;
            case 'read':
                return <span className="badge bg-info text-white">Lu</span>;
            case 'archived':
                return <span className="badge bg-secondary">Archivé</span>;
            default:
                return <span className="badge bg-light text-dark">{status}</span>;
        }
    };

    const getSubjectBadge = (subject) => {
        const colors = {
            'assistance': 'primary',
            'commercial': 'success',
            'reclamation': 'danger',
            'autre': 'secondary'
        };
        return <span className={`badge bg-${colors[subject] || 'secondary'}`}>{subject}</span>;
    };

    const filteredMessages = (activeTab === 'contact' ? messages : quoteMessages).filter(msg => {
        const matchesFilter = filter === 'all' || msg.status === filter;
        
        if (activeTab === 'contact') {
            const matchesSearch =
                msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        } else {
            const matchesSearch =
                msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        }
    });

    // Le reste du JSX reste identique...
    return (
        <div className="container-fluid">
            {/* ... Votre JSX existant ... */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold text-primary mb-1" style={{ fontSize: '2.5rem' }}>
                        <i className="bi bi-envelope me-2"></i>
                        Messages
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                        Gérez les demandes de contact et les demandes de devis.
                    </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <div className="btn-group me-3" role="group">
                        <button
                            className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <FaCommentDots className="me-2" />
                            Messages Contact
                            <span className="badge bg-light text-dark ms-2">{messages.length}</span>
                        </button>
                        <button
                            className={`btn ${activeTab === 'quote' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('quote')}
                        >
                            <FaFileInvoice className="me-2" />
                            Demandes Devis
                            <span className="badge bg-light text-dark ms-2">{quoteMessages.length}</span>
                        </button>
                    </div>
                    
                    <span className="badge bg-light text-dark p-3 shadow-sm">
                        <i className="bi bi-calendar me-2"></i>
                        {new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                    <span className="badge bg-primary fs-6 rounded-pill px-3 py-2">
                        Total: {activeTab === 'contact' ? messages.length : quoteMessages.length}
                    </span>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <FaSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 bg-light"
                                    placeholder={activeTab === 'contact' 
                                        ? "Rechercher par nom, email, sujet..." 
                                        : "Rechercher par nom, entreprise, produit..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="read">Lus</option>
                                <option value="archived">Archivés</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                {activeTab === 'contact' ? (
                                    <tr>
                                        <th scope="col" className="ps-4">Client / Email</th>
                                        <th scope="col">Sujet</th>
                                        <th scope="col">Message</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Statut</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th scope="col" className="ps-4">Client / Entreprise</th>
                                        <th scope="col">Produit</th>
                                        <th scope="col">Quantité</th>
                                        <th scope="col">Message</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Statut</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {filteredMessages.length > 0 ? (
                                    filteredMessages.map((msg) => (
                                        activeTab === 'contact' ? (
                                            <tr key={msg._id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar bg-light rounded-circle p-2 me-3 text-primary">
                                                            <FaUser />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{msg.name}</div>
                                                            <div className="small text-muted">{msg.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{getSubjectBadge(msg.subject)}</td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: '300px' }} title={msg.message}>
                                                        {msg.message}
                                                    </div>
                                                </td>
                                                <td className="text-nowrap text-muted">
                                                    <FaClock className="me-1" size={12} />
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>{getStatusBadge(msg.status)}</td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                            Actions
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li>
                                                                <button className="dropdown-item" onClick={() => updateMessageStatus(msg._id, 'read', 'contact')}>
                                                                    Marquer comme lu
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="dropdown-item" onClick={() => updateMessageStatus(msg._id, 'archived', 'contact')}>
                                                                    Archiver
                                                                </button>
                                                            </li>
                                                            <li><hr className="dropdown-divider" /></li>
                                                            <li>
                                                                <button className="dropdown-item text-danger" onClick={() => deleteMessage(msg._id, 'contact')}>
                                                                    Supprimer
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={msg._id || msg.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar bg-light rounded-circle p-2 me-3 text-primary">
                                                            <FaUser />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{msg.name}</div>
                                                            <div className="small text-muted">{msg.company}</div>
                                                            <div className="small text-muted">{msg.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{msg.productTitle}</div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info text-white">
                                                        {msg.quantity} unité(s)
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: '250px' }} title={msg.message}>
                                                        {msg.message}
                                                    </div>
                                                </td>
                                                <td className="text-nowrap text-muted">
                                                    <FaClock className="me-1" size={12} />
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>{getStatusBadge(msg.status)}</td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                            Actions
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li>
                                                                <button className="dropdown-item" onClick={() => updateMessageStatus(msg._id, 'read', 'devis')}>
                                                                    Marquer comme lu
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="dropdown-item" onClick={() => updateMessageStatus(msg._id, 'archived', 'devis')}>
                                                                    Archiver
                                                                </button>
                                                            </li>
                                                            <li><hr className="dropdown-divider" /></li>
                                                            <li>
                                                                <button className="dropdown-item text-danger" onClick={() => deleteMessage(msg._id, 'devis')}>
                                                                    Supprimer
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'contact' ? "6" : "7"} className="text-center py-5 text-muted">
                                            Aucun message trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;