import React from "react";
import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  return (
    <div style={{ 
      background: '#003399', // Bleu roi
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="fw-bold mb-4" style={{ 
              fontSize: '3.5rem', 
              letterSpacing: '2px',
              color: '#ffffff' // Blanc
            }}>CONTACT US</h1>
            
            <div className="pe-lg-5">
              <ContactForm />
            </div>
          </div>
          
          <div className="col-lg-6 text-center">
            <img 
              src="/homme.png" 
              alt="Contact illustration" 
              className="img-fluid"
              style={{
                maxHeight: '500px',
                width: 'auto'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}