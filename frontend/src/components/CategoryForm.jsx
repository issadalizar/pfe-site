import React, { useState } from 'react';
import { FaPaperPlane, FaUser, FaEnvelope, FaTag, FaCommentAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { contactAPI } from '../services/api';

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

    if (status === 'success') {
        return (
            <div className="text-center py-5" style={{ background: 'transparent' }}>
                <div className="mb-4">
                    <FaCheckCircle style={{ color: '#FFA500', fontSize: '4rem' }} /> {/* Orange */}
                </div>
                <h4 className="fw-bold mb-3" style={{ color: '#ffffff' }}>Message Envoyé !</h4>
                <p style={{ color: '#ffffff', opacity: 0.9 }}>
                    Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.
                </p>
                <button
                    className="btn px-4 py-2 mt-3"
                    onClick={() => setStatus('idle')}
                    style={{ 
                        background: 'transparent',
                        border: '2px solid #FFA500',
                        color: '#FFA500',
                        fontWeight: 'bold',
                        borderRadius: '5px'
                    }}
                >
                    Envoyer un autre message
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            background: 'transparent', // Fond transparent
            padding: '2rem',
            borderRadius: '0'
        }}>
            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                {status === 'error' && (
                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" style={{ background: 'rgba(220, 53, 69, 0.1)', border: '1px solid #dc3545', color: '#ffffff' }}>
                        <FaExclamationCircle className="me-2" style={{ color: '#dc3545' }} />
                        <div>{errorMessage}</div>
                    </div>
                )}

                {/* Nom complet */}
                <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-bold mb-2" style={{ color: '#ffffff' }}>
                        <FaUser style={{ color: '#FFA500', marginRight: '8px' }} />
                        Nom complet
                    </label>
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
                        style={{ 
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid #FFA500',
                            borderRadius: '0',
                            color: '#ffffff',
                            padding: '10px 0',
                            fontSize: '1.1rem'
                        }}
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-bold mb-2" style={{ color: '#ffffff' }}>
                        <FaEnvelope style={{ color: '#FFA500', marginRight: '8px' }} />
                        Adresse email
                    </label>
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
                        style={{ 
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid #FFA500',
                            borderRadius: '0',
                            color: '#ffffff',
                            padding: '10px 0',
                            fontSize: '1.1rem'
                        }}
                    />
                </div>

                {/* Sujet */}
                <div className="mb-4">
                    <label htmlFor="subject" className="form-label fw-bold mb-2" style={{ color: '#ffffff' }}>
                        <FaTag style={{ color: '#FFA500', marginRight: '8px' }} />
                        Sujet
                    </label>
                    <select
                        className="form-select"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={status === 'submitting'}
                        style={{ 
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid #FFA500',
                            borderRadius: '0',
                            color: '#ffffff',
                            padding: '10px 0',
                            fontSize: '1.1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" disabled style={{ background: '#e6f0fa', color: '#000' }}>Sélectionnez un sujet</option>
                        <option value="assistance" style={{ background: '#e6f0fa', color: '#000' }}>Assistance Technique</option>
                        <option value="commercial" style={{ background: '#e6f0fa', color: '#000' }}>Service Commercial</option>
                        <option value="reclamation" style={{ background: '#e6f0fa', color: '#000' }}>Réclamation</option>
                        <option value="autre" style={{ background: '#e6f0fa', color: '#000' }}>Autre demande</option>
                    </select>
                </div>

                {/* Message */}
                <div className="mb-5">
                    <label htmlFor="message" className="form-label fw-bold mb-2" style={{ color: '#ffffff' }}>
                        <FaCommentAlt style={{ color: '#FFA500', marginRight: '8px' }} />
                        Message
                    </label>
                    <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        placeholder="Votre message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={status === 'submitting'}
                        style={{ 
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid #FFA500',
                            borderRadius: '0',
                            color: '#ffffff',
                            padding: '10px 0',
                            fontSize: '1.1rem',
                            resize: 'none'
                        }}
                    ></textarea>
                </div>

                {/* Bouton Submit */}
                <button
                    type="submit"
                    className="btn w-100 py-3 fw-bold transition-all"
                    disabled={status === 'submitting'}
                    style={{ 
                        background: '#FFA500',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '1.2rem',
                        borderRadius: '5px',
                        opacity: status === 'submitting' ? 0.7 : 1
                    }}
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
        </div>
    );
};

export default ContactForm;