import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaTag, FaCommentAlt, FaPaperPlane,
  FaArrowLeft, FaStore, FaCheckCircle, FaExclamationCircle,
  FaPhoneAlt, FaMapMarkerAlt, FaClock, FaHeadset, FaShieldAlt
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { contactAPI } from "../services/contactAPI";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.subject) newErrors.subject = "Veuillez sélectionner un sujet";
    if (!formData.message) newErrors.message = "Le message est requis";
    else if (formData.message.length < 10) newErrors.message = "Message trop court (minimum 10 caractères)";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
      position: 'relative',
      background: 'linear-gradient(145deg, #0b1120 0%, #1a237e 50%, #283593 100%)'
    }}>
      {/* Background avec dégradé */}
      <div className="position-absolute w-100 h-100" style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 50%, rgba(67, 97, 238, 0.15) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      <div className="position-absolute w-100 h-100" style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(247, 37, 133, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            {/* Logo et retour */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-white bg-opacity-10 p-3"
                  style={{ cursor: 'pointer' }}
                  onClick={handleBackToHome}
                >
                  <FaArrowLeft style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                    borderRadius: '18px',
                    color: 'white',
                    fontSize: '30px',
                    boxShadow: '0 10px 30px rgba(67, 97, 238, 0.3)'
                  }}
                >
                  <FaStore />
                </div>
              </div>
              <h2 className="text-white fw-bold mb-2">Contactez-nous</h2>
              <p className="text-white-50">
                Notre équipe est à votre écoute pour répondre à toutes vos questions
              </p>
            </div>

            {/* Informations de contact - PLACÉES AU-DESSUS DU FORMULAIRE */}
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => window.location.href = 'tel:+21629375735'}>
                    <FaPhoneAlt style={{ color: '#4cc9f0', fontSize: '24px' }} />
                    <p className="text-white mt-2 mb-0 small">+216 29 375 735</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => window.location.href = 'mailto:s.univertechno@yahoo.fr'}>
                    <FaEnvelope style={{ color: '#f72585', fontSize: '24px' }} />
                    <p className="text-white mt-2 mb-0 small">s.univertechno@yahoo.fr</p>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaMapMarkerAlt style={{ color: '#4cc9f0', fontSize: '24px' }} />
                    <p className="text-white mt-2 mb-0 small">Sousse, Sahloul 1</p>
                    <small className="text-white-50">Immeuble Charchari, 2ème étage B16</small>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="text-center p-3 rounded-3" style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaClock style={{ color: '#f72585', fontSize: '24px' }} />
                    <p className="text-white mt-2 mb-0 small">Lun-Ven: 9h-17h</p>
                  </div>
                </div>
              </div>
              
              {/* Carte d'adresse détaillée */}
              <div className="mt-3 p-3 rounded-3 text-center" style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <FaMapMarkerAlt style={{ color: '#4cc9f0', marginRight: '8px' }} />
                <span className="text-white small">
                  Adresse complète : Sousse, Sahloul 1 - Immeuble Charchari, 2ème étage, Bureau B16
                </span>
              </div>
            </div>

            {/* Carte de contact - Formulaire */}
            <div className="card border-0 rounded-4 overflow-hidden" style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
            }}>
              <div className="card-body p-5">

                {/* Message de succès */}
                {status === 'success' && (
                  <div className="alert alert-success rounded-4 border-0 mb-4 d-flex align-items-center gap-3 py-3">
                    <FaCheckCircle className="flex-shrink-0" size={24} />
                    <div>
                      <strong>Message envoyé !</strong>
                      <p className="mb-0 small">Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                  </div>
                )}

                {/* Message d'erreur */}
                {status === 'error' && (
                  <div className="alert alert-danger rounded-4 border-0 mb-4 d-flex align-items-center gap-3 py-3">
                    <FaExclamationCircle className="flex-shrink-0" size={24} />
                    <div>
                      <strong>Erreur</strong>
                      <p className="mb-0 small">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Formulaire de contact */}
                {status !== 'success' && (
                  <form onSubmit={handleSubmit}>
                    {/* Nom complet */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Nom complet
                      </label>
                      <div className="position-relative">
                        <FaUser className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="text"
                          name="name"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${errors.name ? 'is-invalid' : ''}`}
                          placeholder="Jean Dupont"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          style={{
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      {errors.name && (
                        <small className="text-danger mt-2 d-block">{errors.name}</small>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Adresse email
                      </label>
                      <div className="position-relative">
                        <FaEnvelope className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <input
                          type="email"
                          name="email"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="jean@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          style={{
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem'
                          }}
                        />
                      </div>
                      {errors.email && (
                        <small className="text-danger mt-2 d-block">{errors.email}</small>
                      )}
                    </div>

                    {/* Sujet */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Sujet
                      </label>
                      <div className="position-relative">
                        <FaTag className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <select
                          name="subject"
                          className={`form-select rounded-3 border-0 bg-light ps-5 py-3 ${errors.subject ? 'is-invalid' : ''}`}
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          style={{
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem'
                          }}
                        >
                          <option value="" disabled>Sélectionnez un sujet</option>
                          <option value="assistance">Assistance Technique</option>
                          <option value="commercial">Service Commercial</option>
                          <option value="reclamation">Réclamation</option>
                          <option value="autre">Autre demande</option>
                        </select>
                      </div>
                      {errors.subject && (
                        <small className="text-danger mt-2 d-block">{errors.subject}</small>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <label className="form-label small fw-medium text-secondary mb-2">
                        Message
                      </label>
                      <div className="position-relative">
                        <FaCommentAlt className="position-absolute" style={{
                          left: '16px',
                          top: '14px',
                          color: '#94a3b8',
                          fontSize: '18px'
                        }} />
                        <textarea
                          name="message"
                          className={`form-control rounded-3 border-0 bg-light ps-5 py-3 ${errors.message ? 'is-invalid' : ''}`}
                          placeholder="Votre message..."
                          rows="4"
                          value={formData.message}
                          onChange={handleChange}
                          disabled={status === 'submitting'}
                          style={{
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            resize: 'none'
                          }}
                        ></textarea>
                      </div>
                      {errors.message && (
                        <small className="text-danger mt-2 d-block">{errors.message}</small>
                      )}
                    </div>

                    {/* Bouton d'envoi */}
                    <button
                      type="submit"
                      className="btn w-100 py-3 rounded-3 fw-medium mb-4"
                      disabled={status === 'submitting'}
                      style={{
                        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                        color: 'white',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {status === 'submitting' ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer le message <FaPaperPlane className="ms-2" />
                        </>
                      )}
                    </button>

                    {/* Lien retour */}
                    <div className="text-center">
                      <Link to="/home" className="text-decoration-none" style={{ color: '#64748b' }}>
                        <FaArrowLeft className="me-2" />
                        Retour à l'accueil
                      </Link>
                    </div>
                  </form>
                )}

                {/* Message de succès avec actions */}
                {status === 'success' && (
                  <div className="text-center">
                    <button
                      onClick={() => setStatus('idle')}
                      className="btn w-100 py-3 rounded-3 fw-medium"
                      style={{
                        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Envoyer un autre message
                    </button>
                    
                    <div className="text-center mt-4">
                      <Link to="/home" className="text-decoration-none" style={{ color: '#64748b' }}>
                        <FaArrowLeft className="me-2" />
                        Retour à l'accueil
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-white-50">
                © 2024 UniverTechno+ - Tous droits réservés
              </small>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          animation: fadeIn 0.6s ease;
        }
        
        .btn:not(.btn-link) {
          transition: all 0.3s ease;
        }
        
        .btn:not(.btn-link):hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(67, 97, 238, 0.3);
        }
        
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1);
          background-color: white !important;
        }
        
        .is-invalid {
          border: 2px solid #dc3545 !important;
        }
        
        .is-invalid:focus {
          box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1);
        }
        
        textarea.form-control {
          min-height: 120px;
        }
        
        textarea.form-control:focus {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
};

export default ContactPage;