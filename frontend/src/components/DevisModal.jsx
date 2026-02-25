// DevisModal.jsx
import React, { useState } from 'react';
import { 
  FaTimes, 
  FaCheck, 
  FaBuilding, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaShieldAlt 
} from 'react-icons/fa';
import { devisAPI } from '../services/devisAPI';

const DevisModal = ({ product, isOpen, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    message: '',
    productTitle: product?.title || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Préparer les données pour MongoDB
      const devisData = {
        company: quoteForm.company,
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        quantity: parseInt(quoteForm.quantity),
        message: quoteForm.message,
        productId: product?.id || product?._id || `prod_${Date.now()}`,
        productTitle: product?.title,
        productCategory: product?.category,
        productMainCategory: product?.mainCategory,
        productPrice: product?.price,
        status: 'pending'
      };
      
      console.log('📤 Envoi à MongoDB:', devisData);
      
      // Envoyer à l'API backend
      const response = await devisAPI.create(devisData);
      
      console.log('✅ Réponse MongoDB:', response.data);
      
      // Aussi sauvegarder dans localStorage pour fallback
      try {
        const existingDevis = JSON.parse(localStorage.getItem('devis_list') || '[]');
        existingDevis.push({
          ...devisData,
          _id: response.data.data?._id || 'local_' + Date.now(),
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('devis_list', JSON.stringify(existingDevis));
      } catch (storageError) {
        console.warn('⚠️ Erreur sauvegarde localStorage:', storageError);
      }
      
      setQuoteSubmitted(true);
      
      setTimeout(() => {
        resetForm();
        onClose();
        setQuoteSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      
      // Message d'erreur détaillé
      let errorMessage = 'Une erreur est survenue lors de l\'envoi.';
      
      if (error.response) {
        // La requête a été faite mais le serveur a répondu avec un code d'erreur
        console.error('📡 Erreur réponse serveur:', error.response.data);
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('📡 Pas de réponse du serveur');
        errorMessage = 'Le serveur ne répond pas. Vérifiez que le backend est démarré.';
      } else {
        // Erreur de configuration
        console.error('📡 Erreur requête:', error.message);
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuoteForm({
      company: '',
      name: '',
      email: '',
      phone: '',
      quantity: 1,
      message: '',
      productTitle: product?.title || ''
    });
  };

  const handleClose = () => {
    resetForm();
    setQuoteSubmitted(false);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="quote-modal-overlay" onClick={handleClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quote-modal-close" onClick={handleClose}>
          <FaTimes />
        </button>
        
        {quoteSubmitted ? (
          <div className="quote-modal-success">
            <div className="success-icon">
              <FaCheck size={48} />
            </div>
            <h3>Demande envoyée avec succès !</h3>
            <p>Votre demande de devis pour <strong>{product.title}</strong> a bien été reçue.</p>
            <p className="text-muted">Notre équipe commerciale vous contactera sous 24h ouvrées.</p>
          </div>
        ) : (
          <>
            <div className="quote-modal-header">
              <h2>Demande de devis personnalisé</h2>
              <p className="text-muted">Pour : <strong>{product.title}</strong></p>
            </div>
            
            <form onSubmit={handleSubmit} className="quote-modal-form">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <FaBuilding className="me-2" />
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="company"
                    value={quoteForm.company}
                    onChange={handleInputChange}
                    required
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <FaUser className="me-2" />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={quoteForm.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom et prénom"
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <FaEnvelope className="me-2" />
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={quoteForm.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <FaPhone className="me-2" />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={quoteForm.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Quantité souhaitée *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={quoteForm.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Prix unitaire</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={`${product.price || 'Sur devis'}€`}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Message / Besoins spécifiques</label>
                <textarea
                  className="form-control"
                  name="message"
                  value={quoteForm.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Précisez vos besoins : options, accessoires, délais, financement, etc."
                  required
                ></textarea>
              </div>
              
              <div className="quote-modal-footer">
                <div className="quote-modal-info">
                  <FaShieldAlt className="text-primary me-2" />
                  <small>Votre demande sera traitée par notre service commercial dans les plus brefs délais.</small>
                </div>
                <div className="quote-modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-2"
                    onClick={handleClose}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DevisModal;