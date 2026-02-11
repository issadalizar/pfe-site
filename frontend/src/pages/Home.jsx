import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { productAPI, categoryAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import SectorCard from "../components/SectorCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/home.css";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.data ? response.data.data.slice(0, 6) : []);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || response.data || [];
      // Récupérer les catégories de niveau 1 (sans parent)
      const mainCategories = cats
        .filter(cat => !cat.parent || cat.level === 1)
        .slice(0, 4);
      setCategories(mainCategories.length > 0 ? mainCategories : cats.slice(0, 4));
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const renderStars = (rating = 4.5) => {
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < Math.floor(rating) ? "#ffc107" : "#ccc" }}>
            ★
          </span>
        ))}
        <small className="text-muted ms-1">{rating}/5</small>
      </div>
    );
  };

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid px-5">
          <button 
            className="navbar-brand fw-bold text-primary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                <a className="nav-link" href="#tendances">
                  Produits
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#secteurs">
                  Secteurs
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
            </ul>
            <button 
              className="btn btn-primary ms-4"
              onClick={() => navigate("/dashboard")}
            >
              Se connecter
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section bg-light py-5">
        <div className="container-fluid px-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold text-dark mb-4">
                L'Équipement de Demain, <span className="text-primary">Aujourd'hui</span>
              </h1>
              <div className="d-flex gap-3">
                <button className="btn btn-primary btn-lg px-5">
                  Découvrez Nos Solutions <FaArrowRight className="ms-2" />
                </button>
                <button className="btn btn-outline-primary btn-lg px-5">
                  En Savoir Plus
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image-placeholder">
                <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center d-flex flex-column h-100">
                      <div className="hero-card-description d-flex align-items-center justify-content-center flex-column flex-grow-1">
                        <p className="lead text-muted mb-0 text-center">
                          Votre Partenaire Technologique pour l'Innovation
                        </p>
                        <p className="small text-muted mt-3">Équipements Technologiques</p>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produits en Tendance */}
      <section id="tendances" className="py-5">
        <div className="container-fluid px-5">
          <div className="mb-5">
            <h2 className="display-5 fw-bold mb-2">Tendances Actuelles</h2>
            <p className="text-muted">Les produits les plus demandés</p>
          </div>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {products.map((product) => (
                <div key={product._id} className="col-md-6 col-lg-4">
                  <ProductCard 
                    product={product} 
                    onView={(id) => console.log("Voir produit:", id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Secteurs d'Expertise */}
      <section id="secteurs" className="py-5 bg-light">
        <div className="container-fluid px-5">
          <div className="mb-5">
            <h2 className="display-5 fw-bold mb-2">Nos Secteurs d'Expertise</h2>
            <p className="text-muted">Solutions complètes pour vos besoins</p>
          </div>

          {loadingCategories ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {categories.map((category, index) => (
                <div key={category._id} className="col-md-6 col-lg-3">
                  <SectorCard 
                    category={category} 
                    index={index}
                    onClick={(id) => console.log("Voir secteur:", id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-5">
        <div className="container-fluid px-5">
          <div className="mb-5">
            <h2 className="display-5 fw-bold mb-2">Ce que nos clients disent</h2>
            <p className="text-muted">Découvrez les avis de nos partenaires</p>
          </div>

          <div className="row g-4">
            {[
              {
                name: "Ahmed Ben Ali",
                company: "Tech Solutions SARL",
                text: "UniverTechno+ a transformé notre infrastructure technologique. Un partenaire fiable!",
                role: "Directeur Général",
              },
              {
                name: "Fatima Zahra",
                company: "Innovation Labs",
                text: "Qualité exceptionnelle et support client impeccable. Hautement recommandé!",
                role: "Responsable Projets",
              },
              {
                name: "Mohamed Karim",
                company: "Digital Future",
                text: "Les solutions proposées dépassent nos attentes. Partenaires depuis 3 ans!",
                role: "CTO",
              },
            ].map((testimonial, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm p-4">
                  <div className="mb-3">{renderStars(5)}</div>
                  <p className="card-text text-muted mb-4 fst-italic">
                    "{testimonial.text}"
                  </p>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style={{ width: "45px", height: "45px" }}
                    >
                      <span className="fw-bold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="mb-0 fw-bold">{testimonial.name}</p>
                      <small className="text-muted">{testimonial.role}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container-fluid px-5">
          <h2 className="display-5 fw-bold mb-4">
            Commencez Votre Transformation Numérique
          </h2>
          <p className="lead mb-4">
            Contactez nos experts pour une consultation gratuite
          </p>
          <button className="btn btn-light btn-lg px-5 fw-bold">
            Planifier une Démonstration
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-dark text-light py-5">
        <div className="container-fluid px-5">
          <div className="row g-5 mb-5">
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">Services</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-light-emphasis text-decoration-none">Consultation</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Implémentation</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Support</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Formation</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">À Propos</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-light-emphasis text-decoration-none">Qui sommes-nous</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Notre histoire</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Carrières</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Blog</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">Partenaires</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-light-emphasis text-decoration-none">Programme Partenaires</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Devenir Partenaire</a></li>
                <li><a href="#" className="text-light-emphasis text-decoration-none">Ressources</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">Contact</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <FaMapMarkerAlt className="me-2" />
                  123 Rue de l'Innovation, Tunis
                </li>
                <li className="mb-2">
                  <FaPhone className="me-2" />
                  +216 71 123 456
                </li>
                <li>
                  <FaEnvelope className="me-2" />
                  contact@univertechno.tn
                </li>
              </ul>
            </div>
          </div>

          <hr className="bg-light opacity-25" />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 text-light-emphasis">
                © 2024 UniverTechno+. Tous droits réservés.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex justify-content-md-end gap-3">
                <a href="#" className="text-light-emphasis">Facebook</a>
                <a href="#" className="text-light-emphasis">LinkedIn</a>
                <a href="#" className="text-light-emphasis">Twitter</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
