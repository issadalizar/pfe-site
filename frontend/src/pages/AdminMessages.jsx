import React, { useState, useEffect } from 'react';
import { contactAPI } from '../services/api';
import { FaEnvelope, FaClock, FaUser, FaTag, FaSearch, FaFilter } from 'react-icons/fa';
import '../styles/admin-messages.css';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, read, archived
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await contactAPI.getAll();
            setMessages(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
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

    const filteredMessages = messages.filter(msg => {
        const matchesFilter = filter === 'all' || msg.status === filter;
        const matchesSearch =
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Messages Reçus</h2>
                    <p className="text-muted">Gérez les demandes de contact et réclamations.</p>
                </div>
                <div className="d-flex gap-2">
                    <span className="badge bg-primary fs-6 rounded-pill px-3 py-2">
                        Total: {messages.length}
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
                                    placeholder="Rechercher..."
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
                                <tr>
                                    <th scope="col" className="ps-4">Client / Email</th>
                                    <th scope="col">Sujet</th>
                                    <th scope="col">Message</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Statut</th>
                                    {/* <th scope="col" className="text-end pe-4">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMessages.length > 0 ? (
                                    filteredMessages.map((msg) => (
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
                                            {/* <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-outline-primary rounded-circle">
                                            <FaEnvelope size={12} />
                                        </button>
                                    </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
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
