import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/contactAPI';
import { FaEnvelope, FaClock, FaUser, FaTag, FaSearch, FaFilter, FaFileInvoice, FaCommentDots, FaTrash, FaTrashRestore, FaTrashAlt } from 'react-icons/fa';
import { devisAPI } from '../../services/devisAPI';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [quoteMessages, setQuoteMessages] = useState([]);
    const [deletedMessages, setDeletedMessages] = useState([]); 
    const [deletedQuotes, setDeletedQuotes] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contact');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showTrash, setShowTrash] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        read: 0,
        archived: 0
    });

    useEffect(() => {
        fetchMessages();
        fetchQuoteMessages();
        fetchDevisStats();
        loadDeletedMessages(); // Charger les messages supprimés
    }, []);

    // Charger les messages supprimés depuis localStorage
    const loadDeletedMessages = () => {
        try {
            const deletedContacts = JSON.parse(localStorage.getItem('deleted_contacts') || '[]');
            const deletedDevis = JSON.parse(localStorage.getItem('deleted_devis') || '[]');
            setDeletedMessages(deletedContacts);
            setDeletedQuotes(deletedDevis);
        } catch (error) {
            console.error('Erreur chargement corbeille:', error);
        }
    };

    // Sauvegarder les messages supprimés
    const saveDeletedMessages = (contacts, devis) => {
        localStorage.setItem('deleted_contacts', JSON.stringify(contacts));
        localStorage.setItem('deleted_devis', JSON.stringify(devis));
    };

    // Fonction pour récupérer les messages de contact
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll();
            console.log('Messages de contact reçus:', response.data);
            let activeMessages = response.data.data || response.data || [];
            
            // Filtrer les messages qui ne sont pas dans la corbeille
            activeMessages = activeMessages.filter(msg => 
                !deletedMessages.some(deleted => deleted._id === msg._id)
            );
            
            setMessages(activeMessages);
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer les demandes de devis
    const fetchQuoteMessages = async () => {
        try {
            setLoading(true);
            const localDevis = JSON.parse(localStorage.getItem('devis_list') || '[]');
            let activeDevis = [];

            if (localDevis.length > 0) {
                console.log('Devis locaux trouvés:', localDevis);
                activeDevis = localDevis;
            } else {
                const response = await devisAPI.getAll();
                console.log('Devis API reçus:', response.data);
                activeDevis = response.data.data || response.data || [];
            }
            
            // Filtrer les devis qui ne sont pas dans la corbeille
            activeDevis = activeDevis.filter(devis => 
                !deletedQuotes.some(deleted => deleted._id === devis._id)
            );
            
            setQuoteMessages(activeDevis);
        } catch (error) {
            console.error('Erreur lors du chargement des devis:', error);
            setQuoteMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer les statistiques des devis
    const fetchDevisStats = async () => {
        try {
            const response = await devisAPI.getStats();
            console.log('Statistiques reçues:', response.data);
            setStats(response.data.data || response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            const localDevis = JSON.parse(localStorage.getItem('devis_list') || '[]');
            const activeDevis = localDevis.filter(devis => 
                !deletedQuotes.some(deleted => deleted._id === devis._id)
            );
            if (activeDevis.length > 0) {
                setStats({
                    total: activeDevis.length,
                    pending: activeDevis.filter(d => d.status === 'pending').length,
                    read: activeDevis.filter(d => d.status === 'read').length,
                    archived: activeDevis.filter(d => d.status === 'archived').length
                });
            }
        }
    };

    // Fonction pour mettre à jour le statut d'un message
    const updateMessageStatus = async (id, newStatus, type = 'contact') => {
        try {
            if (type === 'contact') {
                await contactAPI.updateStatus(id, newStatus);
                await fetchMessages();
            } else {
                await devisAPI.updateStatus(id, newStatus);
                await fetchQuoteMessages();
                await fetchDevisStats();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
        }
    };

    // Fonction pour supprimer un message (mettre à la corbeille)
    const deleteMessage = async (id, type = 'contact', messageData = null) => {
        if (window.confirm('Êtes-vous sûr de vouloir déplacer ce message vers la corbeille ?')) {
            try {
                if (type === 'contact') {
                    // Récupérer les données du message
                    const messageToDelete = messages.find(msg => msg._id === id);
                    if (messageToDelete) {
                        const updatedDeleted = [...deletedMessages, { ...messageToDelete, deletedAt: new Date().toISOString() }];
                        setDeletedMessages(updatedDeleted);
                        saveDeletedMessages(updatedDeleted, deletedQuotes);
                        
                        // Optionnel: supprimer définitivement de l'API
                        // await contactAPI.delete(id);
                    }
                    await fetchMessages();
                } else {
                    // Pour les devis
                    const devisToDelete = quoteMessages.find(msg => msg._id === id);
                    if (devisToDelete) {
                        const updatedDeleted = [...deletedQuotes, { ...devisToDelete, deletedAt: new Date().toISOString() }];
                        setDeletedQuotes(updatedDeleted);
                        saveDeletedMessages(deletedMessages, updatedDeleted);
                        
                        // Optionnel: supprimer définitivement de l'API
                        // await devisAPI.delete(id);
                    }
                    await fetchQuoteMessages();
                    await fetchDevisStats();
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression du message');
            }
        }
    };

    // Fonction pour restaurer un message depuis la corbeille
    const restoreMessage = async (id, type = 'contact') => {
        if (type === 'contact') {
            const updatedDeleted = deletedMessages.filter(msg => msg._id !== id);
            setDeletedMessages(updatedDeleted);
            saveDeletedMessages(updatedDeleted, deletedQuotes);
            await fetchMessages();
        } else {
            const updatedDeleted = deletedQuotes.filter(msg => msg._id !== id);
            setDeletedQuotes(updatedDeleted);
            saveDeletedMessages(deletedMessages, updatedDeleted);
            await fetchQuoteMessages();
            await fetchDevisStats();
        }
    };

    // Fonction pour supprimer définitivement un message
    const permanentDelete = async (id, type = 'contact') => {
        if (window.confirm('⚠️ Suppression définitive ! Êtes-vous sûr de vouloir supprimer ce message définitivement ?')) {
            try {
                if (type === 'contact') {
                    // Supprimer définitivement de l'API si nécessaire
                    // await contactAPI.delete(id);
                    const updatedDeleted = deletedMessages.filter(msg => msg._id !== id);
                    setDeletedMessages(updatedDeleted);
                    saveDeletedMessages(updatedDeleted, deletedQuotes);
                } else {
                    // Supprimer définitivement de l'API si nécessaire
                    // await devisAPI.delete(id);
                    const updatedDeleted = deletedQuotes.filter(msg => msg._id !== id);
                    setDeletedQuotes(updatedDeleted);
                    saveDeletedMessages(deletedMessages, updatedDeleted);
                }
                alert('Message supprimé définitivement');
            } catch (error) {
                console.error('Erreur lors de la suppression définitive:', error);
                alert('Erreur lors de la suppression définitive');
            }
        }
    };

    // Vider la corbeille complètement
    const emptyTrash = async (type = 'contact') => {
        if (window.confirm(`⚠️ Vider la corbeille des ${type === 'contact' ? 'messages' : 'devis'} ? Cette action est irréversible !`)) {
            try {
                if (type === 'contact') {
                    // Supprimer définitivement tous les messages de la corbeille
                    for (const msg of deletedMessages) {
                        // await contactAPI.delete(msg._id);
                    }
                    setDeletedMessages([]);
                    saveDeletedMessages([], deletedQuotes);
                } else {
                    for (const devis of deletedQuotes) {
                        // await devisAPI.delete(devis._id);
                    }
                    setDeletedQuotes([]);
                    saveDeletedMessages(deletedMessages, []);
                }
                alert('Corbeille vidée avec succès');
            } catch (error) {
                console.error('Erreur lors du vidage de la corbeille:', error);
                alert('Erreur lors du vidage de la corbeille');
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

    const filteredMessages = (showTrash ? 
        (activeTab === 'contact' ? deletedMessages : deletedQuotes) :
        (activeTab === 'contact' ? messages : quoteMessages)
    ).filter(msg => {
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

    return (
        <div className="container-fluid">
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
                            onClick={() => {
                                setActiveTab('contact');
                                setShowTrash(false);
                            }}
                        >
                            <FaCommentDots className="me-2" />
                            Messages Contact
                            <span className="badge bg-light text-dark ms-2">{messages.length}</span>
                        </button>
                        <button
                            className={`btn ${activeTab === 'quote' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => {
                                setActiveTab('quote');
                                setShowTrash(false);
                            }}
                        >
                            <FaFileInvoice className="me-2" />
                            Demandes Devis
                            <span className="badge bg-light text-dark ms-2">{quoteMessages.length}</span>
                        </button>
                    </div>

                    {/* Bouton Corbeille */}
                    <button
                        className={`btn ${showTrash ? 'btn-danger' : 'btn-outline-danger'} me-2`}
                        onClick={() => {
                            setShowTrash(!showTrash);
                            setSearchTerm('');
                            setFilter('all');
                        }}
                        title="Voir la corbeille"
                    >
                        <FaTrashAlt className="me-2" />
                        Corbeille
                        {((activeTab === 'contact' && deletedMessages.length > 0) || 
                          (activeTab === 'quote' && deletedQuotes.length > 0)) && (
                            <span className="badge bg-danger text-white ms-2">
                                {activeTab === 'contact' ? deletedMessages.length : deletedQuotes.length}
                            </span>
                        )}
                    </button>

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
                        Total: {!showTrash ? (activeTab === 'contact' ? messages.length : quoteMessages.length) : 
                                (activeTab === 'contact' ? deletedMessages.length : deletedQuotes.length)}
                    </span>
                </div>
            </div>

            {/* Cartes de statistiques pour les devis */}
            {activeTab === 'quote' && !showTrash && (
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-primary text-white">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-1">Total devis</h6>
                                        <h3 className="mb-0">{stats.total}</h3>
                                    </div>
                                    <FaFileInvoice size={40} className="opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-warning text-dark">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-1">En attente</h6>
                                        <h3 className="mb-0">{stats.pending}</h3>
                                    </div>
                                    <FaClock size={40} className="opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-info text-white">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-1">Lus</h6>
                                        <h3 className="mb-0">{stats.read}</h3>
                                    </div>
                                    <FaEnvelope size={40} className="opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm bg-secondary text-white">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-1">Archivés</h6>
                                        <h3 className="mb-0">{stats.archived}</h3>
                                    </div>
                                    <FaTag size={40} className="opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Afficher la corbeille si active */}
            {showTrash && (
                <div className="alert alert-warning mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <FaTrashAlt className="me-2" />
                        <strong>Corbeille - Messages supprimés</strong>
                        <span className="ms-2 text-muted">
                            ({activeTab === 'contact' ? deletedMessages.length : deletedQuotes.length} message(s))
                        </span>
                    </div>
                    {(activeTab === 'contact' ? deletedMessages.length : deletedQuotes.length) > 0 && (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => emptyTrash(activeTab)}
                        >
                            <FaTrash className="me-1" />
                            Vider la corbeille
                        </button>
                    )}
                </div>
            )}

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
                                            <tr key={msg._id} className={showTrash ? "table-danger" : ""}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar bg-light rounded-circle p-2 me-3 text-primary">
                                                            <FaUser />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{msg.name}</div>
                                                            <div className="small text-muted">{msg.email}</div>
                                                            {msg.deletedAt && showTrash && (
                                                                <small className="text-danger">
                                                                    Supprimé le: {new Date(msg.deletedAt).toLocaleDateString()}
                                                                </small>
                                                            )}
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
                                                    <div className="d-flex gap-2">
                                                        {!showTrash ? (
                                                            <>
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={msg.status || 'pending'}
                                                                    onChange={(e) => updateMessageStatus(msg._id, e.target.value, 'contact')}
                                                                    style={{
                                                                        width: '130px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 600,
                                                                        backgroundColor: msg.status === 'read' ? '#d1ecf1' : msg.status === 'archived' ? '#e2e3e5' : '#fff3cd',
                                                                        color: msg.status === 'read' ? '#0c5460' : msg.status === 'archived' ? '#383d41' : '#856404',
                                                                        border: 'none'
                                                                    }}
                                                                >
                                                                    <option value="pending">En attente</option>
                                                                    <option value="read">Lu</option>
                                                                    <option value="archived">Archive</option>
                                                                </select>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => deleteMessage(msg._id, 'contact', msg)}
                                                                    title="Supprimer"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => restoreMessage(msg._id, 'contact')}
                                                                    title="Restaurer"
                                                                >
                                                                    <FaTrashRestore />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => permanentDelete(msg._id, 'contact')}
                                                                    title="Supprimer définitivement"
                                                                >
                                                                    <FaTrashAlt />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={msg._id || msg.id} className={showTrash ? "table-danger" : ""}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar bg-light rounded-circle p-2 me-3 text-primary">
                                                            <FaUser />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{msg.name}</div>
                                                            <div className="small text-muted">{msg.company}</div>
                                                            <div className="small text-muted">{msg.email}</div>
                                                            {msg.deletedAt && showTrash && (
                                                                <small className="text-danger">
                                                                    Supprimé le: {new Date(msg.deletedAt).toLocaleDateString()}
                                                                </small>
                                                            )}
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
                                                    <div className="d-flex gap-2">
                                                        {!showTrash ? (
                                                            <>
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={msg.status || 'pending'}
                                                                    onChange={(e) => updateMessageStatus(msg._id, e.target.value, 'devis')}
                                                                    style={{
                                                                        width: '130px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 600,
                                                                        backgroundColor: msg.status === 'read' ? '#d1ecf1' : msg.status === 'archived' ? '#e2e3e5' : '#fff3cd',
                                                                        color: msg.status === 'read' ? '#0c5460' : msg.status === 'archived' ? '#383d41' : '#856404',
                                                                        border: 'none'
                                                                    }}
                                                                >
                                                                    <option value="pending">En attente</option>
                                                                    <option value="read">Lu</option>
                                                                    <option value="archived">Archive</option>
                                                                </select>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => deleteMessage(msg._id, 'devis', msg)}
                                                                    title="Supprimer"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => restoreMessage(msg._id, 'devis')}
                                                                    title="Restaurer"
                                                                >
                                                                    <FaTrashRestore />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => permanentDelete(msg._id, 'devis')}
                                                                    title="Supprimer définitivement"
                                                                >
                                                                    <FaTrashAlt />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'contact' ? "6" : "7"} className="text-center py-5 text-muted">
                                            {showTrash ? "La corbeille est vide." : "Aucun message trouvé."}
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