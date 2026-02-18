import React from "react";
import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  return (
    <div className="contact-page" style={{ minHeight: '100vh', background: '#f8fafd' }}>
      <h1 className="text-center fw-bold mt-4 mb-2" style={{ color: '#0070e0', fontSize: '2.8rem' }}>Contactez-nous</h1>
      <p className="text-center mb-5" style={{ color: '#5a6e7f', fontSize: '1.2rem' }}>
        Notre équipe est à votre disposition pour répondre à toutes vos questions.
      </p>
      <div className="container d-flex flex-column flex-md-row justify-content-center align-items-start gap-5 mb-5">
        {/* Coordonnées */}
        <div style={{ minWidth: 320, maxWidth: 400 }}>
          <h2 className="fw-bold mb-4" style={{ color: '#0070e0' }}>Nos Coordonnées</h2>
          <p className="mb-4" style={{ color: '#5a6e7f' }}>
            N'hésitez pas à nous contacter pour toute demande d'information, d'assistance technique ou de partenariat.
          </p>
          <div className="d-flex align-items-start mb-4">
            <div style={{ width: 48, height: 48, background: '#0070e0', borderRadius: 12 }} className="me-3"></div>
            <div>
              <div className="fw-bold">Notre Adresse</div>
              <div>123 Rue de l'Innovation, Tunis, Tunisie</div>
            </div>
          </div>
          <div className="d-flex align-items-start mb-4">
            <div style={{ width: 48, height: 48, background: '#0070e0', borderRadius: 12 }} className="me-3"></div>
            <div>
              <div className="fw-bold">Téléphone</div>
              <div>+216 71 123 456</div>
              <div className="text-muted" style={{ fontSize: '0.95rem' }}>Lun - Ven, 8h - 18h</div>
            </div>
          </div>
          <div className="d-flex align-items-start mb-4">
            <div style={{ width: 48, height: 48, background: '#0070e0', borderRadius: 12 }} className="me-3"></div>
            <div>
              <div className="fw-bold">Email</div>
              <div>contact@univertechno.tn</div>
              <div>support@univertechno.tn</div>
            </div>
          </div>
        </div>
        {/* Formulaire */}
        <div className="flex-grow-1 d-flex justify-content-center">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
