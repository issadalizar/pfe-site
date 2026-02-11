import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaArrowLeft } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/contact.css";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Votre message a été envoyé avec succès! Nous vous répondrons bientôt.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.error || "Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage("Erreur de connexion au serveur. Veuillez vérifier la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid px-5">
          <button
            className="navbar-brand fw-bold text-primary"
            onClick={() => navigate("/home")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: "1.5rem" }}>⚙️</span> UniverTechno+
          </button>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-4">
              <li className="nav-item">
                <button
                  className="nav-link btn"
                  onClick={() => navigate("/home")}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <FaArrowLeft className="me-2" />
                  Retour à l'accueil
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="contact-hero bg-primary text-white py-5 mb-5">
        <div className="container-fluid px-5">
          <h1 className="display-4 fw-bold mb-2">Nous Contacter</h1>
          <p className="lead">Nous sommes là pour répondre à vos questions et vous aider</p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-5">
        <div className="container-fluid px-5">
          <div className="row g-5">
            {/* Left Column - Contact Form */}
            <div className="col-lg-6">
              <div className="contact-form-wrapper">
                <h2 className="fw-bold mb-4">Envoyer un Message</h2>

                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccessMessage("")}
                    ></button>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {errorMessage}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setErrorMessage("")}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre.email@example.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label fw-semibold">
                      Sujet
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Objet de votre message"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-semibold">
                      Message
                    </label>
                    <textarea
                      className="form-control form-control-lg"
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Votre message..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg w-100 fw-bold"
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le Message"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - Contact Information */}
            <div className="col-lg-6">
              <div className="contact-info-wrapper">
                <h2 className="fw-bold mb-5">Nos Informations</h2>

                {/* Address */}
                <div className="contact-info-item mb-4">
                  <div className="info-header">
                    <FaMapMarkerAlt className="text-primary me-3" style={{ fontSize: "1.5rem" }} />
                    <h5 className="fw-bold mb-0">Adresse</h5>
                  </div>
                  <p className="text-muted ms-5">
                    123 Rue de l'Innovation<br />
                    2000 Tunis, Tunisie
                  </p>
                </div>

                {/* Phone */}
                <div className="contact-info-item mb-4">
                  <div className="info-header">
                    <FaPhone className="text-primary me-3" style={{ fontSize: "1.5rem" }} />
                    <h5 className="fw-bold mb-0">Téléphone</h5>
                  </div>
                  <p className="text-muted ms-5">
                    <a href="tel:+21671123456" className="text-decoration-none text-muted">
                      +216 71 123 456
                    </a>
                    <br />
                    <small>Lun-Ven: 09h00 - 18h00</small>
                  </p>
                </div>

                {/* Email */}
                <div className="contact-info-item mb-4">
                  <div className="info-header">
                    <FaEnvelope className="text-primary me-3" style={{ fontSize: "1.5rem" }} />
                    <h5 className="fw-bold mb-0">Email</h5>
                  </div>
                  <p className="text-muted ms-5">
                    <a href="mailto:contact@univertechno.tn" className="text-decoration-none text-muted">
                      contact@univertechno.tn
                    </a>
                    <br />
                    <a href="mailto:support@univertechno.tn" className="text-decoration-none text-muted">
                      support@univertechno.tn
                    </a>
                  </p>
                </div>

                {/* Business Hours */}
                <div className="contact-info-item mb-4">
                  <div className="info-header">
                    <FaClock className="text-primary me-3" style={{ fontSize: "1.5rem" }} />
                    <h5 className="fw-bold mb-0">Horaires de Travail</h5>
                  </div>
                  <p className="text-muted ms-5">
                    Lundi - Jeudi: 09h00 - 18h00<br />
                    Vendredi: 09h00 - 17h00<br />
                    Samedi - Dimanche: Fermé
                  </p>
                </div>

                {/* Additional Info Box */}
                <div className="contact-info-box mt-5 p-4 bg-light rounded">
                  <h5 className="fw-bold mb-3">Besoin d'une assistance rapide?</h5>
                  <p className="text-muted mb-3">
                    Notre équipe d'experts est prête à vous aider. Nous répondons généralement dans les 24 heures.
                  </p>
                  <button className="btn btn-outline-primary">
                    Démarrer un Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Service Areas */}
      <section className="py-5 bg-light">
        <div className="container-fluid px-5">
          <h2 className="fw-bold mb-5 text-center">Nos Services</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <h5 className="fw-bold mb-3">Consultation</h5>
                <p className="text-muted">
                  Obtenez des conseils d'experts adaptés à vos besoins
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <h5 className="fw-bold mb-3">Support Technique</h5>
                <p className="text-muted">
                  Assistance technique 24/7 pour vos systèmes
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <h5 className="fw-bold mb-3">Formation</h5>
                <p className="text-muted">
                  Formations adaptées à votre équipe
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100 text-center p-4">
                <h5 className="fw-bold mb-3">Implémentation</h5>
                <p className="text-muted">
                  Mise en place de solutions personnalisées
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-5">
        <div className="container-fluid px-5">
          <div className="text-center">
            <p className="mb-0 text-light-emphasis">
              © 2024 UniverTechno+. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
