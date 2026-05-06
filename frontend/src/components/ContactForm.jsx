import React, { useState } from 'react';
import { FaPaperPlane, FaUser, FaEnvelope, FaTag, FaCommentAlt, FaCheckCircle, FaExclamationCircle, FaHeadset, FaClock, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { contactAPI } from '../services/contactAPI';
import '../styles/contact.css';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            await contactAPI.create(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.error || 'Une erreur est survenue, veuillez réessayer.');
        }
    };

    return (
        <div className="contact-form-wrapper">
            <div className="contact-card">
                <div className="card-header-gradient">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h1 className="fw-bold text-white mb-3 display-4">Contactez-nous</h1>
                            <p className="text-white-50 mb-0 fs-5">
                                Nous sommes là pour vous aider 24h/24 et 7j/7
                            </p>
                        </div>
                        <Link to="/home" className="btn-back-home">
                            ← Accueil
                        </Link>
                    </div>
                </div>

                <div className="card-body p-4 p-md-5">
                    {status === 'success' ? (
                        <div className="text-center py-5 fade-in">
                            <div className="success-icon mb-4">
                                <FaCheckCircle className="text-success display-1" />
                            </div>
                            <h4 className="fw-bold text-success mb-3">Message Envoyé !</h4>
                            <p className="text-muted mb-4">
                                Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.
                            </p>
                            <div className="d-flex gap-3 justify-content-center">
                                <button
                                    className="btn btn-outline-primary rounded-pill px-4"
                                    onClick={() => setStatus('idle')}
                                >
                                    Envoyer un autre message
                                </button>
                                <Link to="/home" className="btn btn-primary rounded-pill px-4">
                                    Retour à l'accueil
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={status === 'submitting' ? 'opacity-50' : ''}>
                            {status === 'error' && (
                                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                    <FaExclamationCircle className="me-2" />
                                    <div>{errorMessage}</div>
                                </div>
                            )}

                            <div className="form-floating mb-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    placeholder="Votre nom"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                />
                                <label htmlFor="name">
                                    <FaUser className="me-2 text-primary" /> Nom complet
                                </label>
                            </div>

                            <div className="form-floating mb-4">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                />
                                <label htmlFor="email">
                                    <FaEnvelope className="me-2 text-primary" /> Adresse email
                                </label>
                            </div>

                            <div className="form-floating mb-4">
                                <select
                                    className="form-select"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                >
                                    <option value="" disabled>Sélectionnez un sujet</option>
                                    <option value="assistance">Assistance Technique</option>
                                    <option value="commercial">Service Commercial</option>
                                    <option value="reclamation">Réclamation</option>
                                    <option value="autre">Autre demande</option>
                                </select>
                                <label htmlFor="subject">
                                    <FaTag className="me-2 text-primary" /> Sujet
                                </label>
                            </div>

                            <div className="form-floating mb-4">
                                <textarea
                                    className="form-control"
                                    id="message"
                                    name="message"
                                    placeholder="Votre message"
                                    style={{ height: '150px' }}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                ></textarea>
                                <label htmlFor="message">
                                    <FaCommentAlt className="me-2 text-primary" /> Message
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn-submit w-100"
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Envoi en cours...
                                    </span>
                                ) : (
                                    <span>
                                        Envoyer le message <FaPaperPlane className="ms-2" />
                                    </span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="contact-info-section mt-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="info-card">
                            <FaHeadset className="info-icon" />
                            <h5>Support 24/7</h5>
                            <p>Notre équipe est disponible à tout moment pour vous assister</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="info-card">
                            <FaClock className="info-icon" />
                            <h5>Réponse rapide</h5>
                            <p>Nous répondons à tous vos messages sous 24h</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="info-card">
                            <FaShieldAlt className="info-icon" />
                            <h5>Confidentialité</h5>
                            <p>Vos données sont protégées et sécurisées</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;