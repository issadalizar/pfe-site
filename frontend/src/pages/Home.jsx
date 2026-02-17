import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingCart, FaUser, FaSearch, FaArrowRight, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaLeaf, FaGem, FaHeart, FaTruck,
  FaStore, FaBars, FaCogs, FaCar, FaFlask 
} from "react-icons/fa";
import { productAPI, categoryAPI } from "../services/api";
import SectorCard from "../components/SectorCard";
import FeaturedProducts from "../components/FeaturedProducts";
import ContactForm from "../components/ContactForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/home.css";
import { cncProductDetails } from "./productData";

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All products");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Catégories principales pour le filtrage du catalogue
  const mainCategories = [
    "All products",
    "CNC Turing Machine",
    "CNC Milling Machine",
    "CAPTEURS ET ACTIONNEURS",
    "ÉLECTRICITÉ",
    "RÉSEAUX MULTIPLEXÉS",
    "Accessoires",
    "EDUCATION EQUIPMENT"
  ];

  // Secteurs d'expertise - maintenant indépendants du catalogue
  const expertiseSectors = [
    {
      id: "cnc-education",
      name: "CNC for Education",
      displayName: "CNC for Education",
      icon: <FaCogs size={20} />,
      color: "#0066cc",
      description: "Machines CNC pour l'enseignement et la formation professionnelle",
      path: "/sector/cnc-education"
    },
    {
      id: "voiture",
      name: "Voiture",
      displayName: "Voiture",
      icon: <FaCar size={20} />,
      color: "#ff9900",
      description: "Équipements didactiques pour l'automobile",
      path: "/sector/voiture"
    },
    {
      id: "mcp-lab",
      name: "MCP lab electronics",
      displayName: "MCP lab electronics",
      icon: <FaFlask size={20} />,
      color: "#0099ff",
      description: "Matériel de laboratoire pour l'électronique",
      path: "/sector/mcp-lab"
    }
  ];

  useEffect(() => {
    fetchCategories();
    loadAllProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || response.data || [];
      // Récupérer les catégories de niveau 1 (sans parent)
      const mainCategories = cats
        .filter(cat => !cat.parent || cat.level === 1)
        .slice(0, 8);
      setCategories(mainCategories.length > 0 ? mainCategories : cats.slice(0, 8));
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadAllProducts = () => {
    const products = Object.values(cncProductDetails);
    console.log("📦 Tous les produits chargés:", products.length);
    
    const categories = [...new Set(products.map(p => p.mainCategory))];
    console.log("📊 Catégories disponibles:", categories);
    
    setAllProducts(products);
    
    // Produits vedettes spécifiques
    const featured = [
      cncProductDetails['De2-Ultra Mini CNC Turning Center'],
      cncProductDetails['Fa2-Ultra Mini CNC Milling Center'],
      cncProductDetails['De8 (iKC8) CNC Turning Machine'],
      cncProductDetails['PX1 Baby CNC Milling Machine'],
      cncProductDetails['DT-M002 – Mesure des Positions'],
      cncProductDetails['PTL908-2H – High Voltage Safety Test Lead 10kV']
    ].filter(product => product !== null && product !== undefined);
    
    setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 6));
  };

  const handleSectorClick = (sector) => {
    navigate(sector.path);
  };

  const handleProductClick = (product) => {
    navigate(`/product/${encodeURIComponent(product.title)}`);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleLoginClick = () => {
    navigate("/dashboard");
  };

  // Fonction pour gérer les erreurs de chargement d'images
  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  // Fonction pour obtenir la première image valide d'un produit
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  // Filtrer les produits selon la catégorie sélectionnée (UNIQUEMENT pour le catalogue)
  const getFilteredProducts = () => {
    let filtered = [...allProducts];

    if (selectedCategory && selectedCategory !== "All products") {
      filtered = filtered.filter(p => 
        p.mainCategory === selectedCategory || 
        p.category === selectedCategory ||
        p.category?.includes(selectedCategory) ||
        p.mainCategory?.includes(selectedCategory)
      );
    }

    return filtered;
  };

  // Compter les produits par catégorie (UNIQUEMENT pour le catalogue)
  const getCategoryProductCount = (cat) => {
    return allProducts.filter(p => 
      p.mainCategory === cat || 
      p.category === cat ||
      p.category?.includes(cat) ||
      p.mainCategory?.includes(cat)
    ).length;
  };

  const filteredProducts = getFilteredProducts();

  const renderStars = (rating = 4.5) => {
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < Math.floor(rating) ? "#4a9eff" : "#dee2e6" }}>
            ★
          </span>
        ))}
        <small className="text-muted ms-1">({Math.floor(Math.random() * 50) + 10})</small>
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(price).replace('TND', 'DT');
  };

  const truncateText = (text, maxLength = 25) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="py-3 sticky-top" style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #0066cc', zIndex: 1030 }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3 col-md-4 col-7">
              <div className="d-flex align-items-center">
                <div 
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: '#e6f0ff',
                    borderRadius: '50%',
                    color: '#0066cc',
                    fontSize: '30px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <FaStore />
                </div>
                <div>
                  <h1 className="fw-bold mb-0" style={{ fontSize: '1.8rem', color: '#0066cc', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    UniverTechno+
                  </h1>
                  <p className="mb-0 small" style={{ color: '#4a9eff' }}>
                    Votre partenaire en équipement industriel et pédagogique
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-5 col-md-4 d-none d-md-block">
              <div className="d-flex justify-content-center gap-4">
                <div className="text-center">
                  <FaPhone style={{ color: '#0066cc' }} />
                  <p className="small mb-0">+216 71 123 456</p>
                </div>
                <div className="text-center">
                  <FaEnvelope style={{ color: '#0066cc' }} />
                  <p className="small mb-0">contact@univertechno.tn</p>
                </div>
                <div className="text-center">
                  <FaMapMarkerAlt style={{ color: '#0066cc' }} />
                  <p className="small mb-0">Tunis, Tunisie</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-4 col-5">
              <div className="d-flex align-items-center justify-content-end gap-3">
                <div className="position-relative d-none d-lg-block">
                  <input 
                    type="text" 
                    className="form-control form-control-sm rounded-pill" 
                    placeholder="Rechercher..."
                    style={{ width: "150px", borderColor: '#0066cc' }}
                  />
                  <FaSearch className="position-absolute" style={{ right: "10px", top: "8px", color: "#0066cc" }} />
                </div>

                <div 
                  className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#e6f0ff', width: '40px', height: '40px', cursor: 'pointer' }}
                  onClick={handleLoginClick}
                >
                  <FaUser style={{ color: '#0066cc' }} />
                </div>

                <div className="position-relative">
                  <div 
                    className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: '#e6f0ff', width: '40px', height: '40px', cursor: 'pointer' }}
                    onClick={() => navigate("/cart")}
                  >
                    <FaShoppingCart style={{ color: '#0066cc' }} />
                  </div>
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                    style={{ backgroundColor: '#ff6b6b', fontSize: '10px' }}
                  >
                    3
                  </span>
                </div>

                <button 
                  className="btn d-none d-lg-block rounded-pill px-4"
                  style={{ backgroundColor: '#0066cc', color: 'white', border: 'none' }}
                  onClick={handleLoginClick}
                >
                  Se connecter
                </button>

                <button 
                  className="btn d-lg-none p-0"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ color: '#0066cc' }}
                >
                  <FaBars size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="navbar navbar-expand-lg py-2" style={{ backgroundColor: '#f0f7ff' }}>
        <div className="container">
          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className="nav-link fw-bold" href="#home" style={{ color: '#0066cc' }}>Accueil</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#secteurs" style={{ color: '#4a4a4a' }}>Secteurs</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#catalog" style={{ color: '#4a4a4a' }}>Catalogue</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact" style={{ color: '#4a4a4a' }}>Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

     {/* Hero Section - Image avec perspective en relief droite */}
<section id="home" className="hero-section py-5" style={{ 
  background: 'linear-gradient(135deg, #0066cc 0%, #4a9eff 100%)',
  minHeight: '500px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden'
}}>
  <div className="container">
    <div className="row align-items-center">
      <div className="col-lg-8">
        <div className="hero-content text-white">
          <h1 className="display-1 fw-bold mb-3" style={{ fontSize: '4.5rem', lineHeight: '1.1' }}>
            UniverTechno+<span style={{ color: '#FFD700' }}>!</span>
          </h1>
          <p className="lead mb-4" style={{ fontSize: '1.8rem', opacity: 0.9 }}>
            L'Équipement de Demain, Aujourd'hui
          </p>
          <p className="mb-4" style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '600px' }}>
            Solutions complètes pour l'enseignement technique et la formation professionnelle
          </p>
          <div className="d-flex gap-3 mt-4">
            <button className="btn btn-light btn-lg px-5 rounded-pill fw-bold" style={{ color: '#0066cc' }}>
              Découvrez Nos Solutions
            </button>
            <button className="btn btn-outline-light btn-lg px-5 rounded-pill fw-bold">
              En Savoir Plus
            </button>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        {/* Image avec perspective en relief vers la droite */}
        <div className="image-container" style={{
          position: 'relative',
          width: '100%',
          height: '450px',
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}>
          
          {/* Image avec effet de relief */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: 'rotateY(-15deg) rotateX(5deg) translateX(25px) translateZ(30px)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s ease',
            boxShadow: `
              25px 25px 50px rgba(0,0,0,0.4),
              -5px -5px 20px rgba(255,255,255,0.2),
              inset -5px -5px 10px rgba(0,0,0,0.2),
              inset 5px 5px 15px rgba(255,255,255,0.3)
            `,
            borderRadius: '20px',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(3deg) translateX(20px) translateZ(40px)';
            e.currentTarget.style.boxShadow = '30px 30px 60px rgba(0,0,0,0.5), -5px -5px 25px rgba(255,255,255,0.3), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 12px rgba(255,255,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(5deg) translateX(25px) translateZ(30px)';
            e.currentTarget.style.boxShadow = '25px 25px 50px rgba(0,0,0,0.4), -5px -5px 20px rgba(255,255,255,0.2), inset -5px -5px 10px rgba(0,0,0,0.2), inset 5px 5px 15px rgba(255,255,255,0.3)';
          }}>
            
            {/* Image principale - image.png */}
            <img 
              src="/image.png" 
              alt="UniverTechno+" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'contrast(1.05) brightness(1.02)'
              }}
            />
            
            {/* Effet de relief supplémentaire avec dégradé */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.2) 100%)',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              borderRadius: '20px'
            }}></div>
          </div>
          
          {/* Élément décoratif pour accentuer le relief (ombre portée au sol) */}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            right: '10px',
            width: '90%',
            height: '30px',
            background: 'rgba(0,0,0,0.2)',
            filter: 'blur(15px)',
            transform: 'rotateX(5deg) translateZ(-20px)',
            borderRadius: '50%',
            zIndex: -1
          }}></div>
        </div>
      </div>
    </div>
  </div>

  {/* Éléments décoratifs en arrière-plan */}
  <div style={{
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '300px',
    height: '300px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '50%',
    transform: 'rotate(25deg)',
    zIndex: 0
  }}></div>
  
  <div style={{
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '400px',
    height: '400px',
    background: 'rgba(0,0,0,0.02)',
    borderRadius: '50%',
    zIndex: 0
  }}></div>
</section>

      {/* Nos Secteurs Section - Design en cartes - INDÉPENDANT */}
      <section id="secteurs" className="py-5 bg-light">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-5" style={{ color: '#0066cc' }}>Nos Secteurs d'Expertise</h2>

          <div className="row g-4">
            {expertiseSectors.map((sector, index) => {
              return (
                <div key={index} className="col-md-4">
                  <div 
                    className="sector-card bg-white p-4 rounded-4 shadow-sm h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSectorClick(sector)}
                  >
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div 
                        className="icon-container rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          backgroundColor: `${sector.color}20`,
                          width: '50px',
                          height: '50px',
                          color: sector.color
                        }}
                      >
                        {sector.icon}
                      </div>
                      <h5 className="fw-bold mb-0" style={{ color: sector.color }}>{sector.displayName}</h5>
                    </div>
                    <p className="text-muted mb-3">{sector.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Découvrir</span>
                      <a 
                        href="#" 
                        className="text-decoration-none fw-bold"
                        style={{ color: sector.color }}
                        onClick={(e) => { e.preventDefault(); handleSectorClick(sector); }}
                      >
                        En savoir plus +
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog Section - Avec filtres à gauche et produits à droite - INDÉPENDANT */}
      <section id="catalog" className="py-5 bg-white">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-5" style={{ color: '#0066cc' }}>Catalogue Complet</h2>
          
          <div className="row">
            {/* Colonne de gauche - Filtres */}
            <div className="col-lg-3 mb-4">
              <div className="bg-white p-4 rounded-4 shadow-sm">
                {/* All products */}
                <div className="mb-4">
                  <div 
                    className="d-flex align-items-center justify-content-between p-2 rounded cursor-pointer"
                    style={{ cursor: 'pointer', backgroundColor: selectedCategory === "All products" ? '#e6f0ff' : 'transparent' }}
                    onClick={() => handleCategoryFilter("All products")}
                  >
                    <span className="fw-bold" style={{ color: '#0066cc' }}>Tous les produits</span>
                    <span className="badge" style={{ backgroundColor: '#e6f0ff', color: '#0066cc' }}>{allProducts.length}</span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h6 className="fw-bold mb-3" style={{ color: '#0066cc' }}>Catégories</h6>
                  <div className="d-flex flex-column gap-2">
                    {mainCategories.map((cat, index) => {
                      if (cat === "All products") return null;
                      const count = getCategoryProductCount(cat);
                      return (
                        <a 
                          key={index}
                          href="#" 
                          className="text-decoration-none d-flex align-items-center justify-content-between p-2 rounded"
                          style={{ 
                            color: '#666',
                            backgroundColor: selectedCategory === cat ? '#e6f0ff' : 'transparent'
                          }}
                          onClick={(e) => { e.preventDefault(); handleCategoryFilter(cat); }}
                        >
                          <span>{cat}</span>
                          <small className="text-muted">({count})</small>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne de droite - Products Grid */}
            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: '#0066cc' }}>
                    {selectedCategory === "All products" ? "Tous les produits" : selectedCategory}
                  </h4>
                </div>
                <span className="text-muted">
                  Affichage 1 - {Math.min(filteredProducts.length, 12)} sur {filteredProducts.length} produits
                </span>
              </div>

              <div className="row g-4">
                {filteredProducts.slice(0, 12).map((product, index) => (
                  <div key={index} className="col-md-6 col-lg-4">
                    <div 
                      className="product-card bg-white rounded-4 shadow-sm h-100 p-3"
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="product-image mb-3 text-center">
                        <img 
                          src={product.images?.[0] || "/images/placeholder.png"}
                          alt={product.title}
                          className="img-fluid"
                          style={{ height: "150px", objectFit: "contain" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/150/0066cc/ffffff?text=${encodeURIComponent(product.title.substring(0, 20))}`;
                          }}
                        />
                      </div>
                      <h6 className="fw-bold mb-2" title={product.title}>{truncateText(product.title, 30)}</h6>
                      <p className="small text-muted mb-2 text-truncate">{product.description || product.category || product.mainCategory}</p>
                      {renderStars()}
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <span className="fw-bold" style={{ color: '#0066cc' }}>{formatPrice(product.price)}</span>
                        <span className="small text-muted">/ unit</span>
                      </div>
                      <div className="mt-2">
                        <span className="badge" style={{ backgroundColor: '#e6f0ff', color: '#0066cc' }}>
                          {product.category || product.mainCategory || "Equipment"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">Aucun produit trouvé</p>
                </div>
              )}

              {filteredProducts.length > 12 && (
                <div className="text-center mt-5">
                  <button className="btn btn-outline-primary rounded-pill px-5 py-2">
                    Voir plus de produits
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#0066cc' }}>
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">
            Commencez Votre Transformation Numérique
          </h2>
          <p className="lead mb-4">
            Contactez nos experts pour une consultation gratuite
          </p>
          <button className="btn btn-light btn-lg px-5 fw-bold rounded-pill">
            Planifier une Démonstration
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold mb-3" style={{ color: '#0066cc' }}>Contactez-nous</h2>
              <p className="lead text-muted">
                Notre équipe est à votre disposition pour répondre à toutes vos questions.
              </p>
            </div>
          </div>

          <div className="row g-5 align-items-center">
            {/* Contact Info Column */}
            <div className="col-lg-5">
              <div className="pe-lg-5">
                <h3 className="fw-bold mb-4 text-primary">Nos Coordonnées</h3>
                <p className="mb-5 text-muted">
                  N'hésitez pas à nous contacter pour toute demande d'information,
                  d'assistance technique ou de partenariat.
                </p>

                <div className="d-flex align-items-start mb-4">
                  <div className="icon-square bg-primary bg-opacity-10 text-primary p-3 rounded-3 me-3">
                    <FaMapMarkerAlt size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Notre Adresse</h5>
                    <p className="text-muted mb-0">123 Rue de l'Innovation, Tunis, Tunisie</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div className="icon-square bg-primary bg-opacity-10 text-primary p-3 rounded-3 me-3">
                    <FaPhone size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Téléphone</h5>
                    <p className="text-muted mb-0">+216 71 123 456</p>
                    <small className="text-muted">Lun - Ven, 8h - 18h</small>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-4">
                  <div className="icon-square bg-primary bg-opacity-10 text-primary p-3 rounded-3 me-3">
                    <FaEnvelope size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Email</h5>
                    <p className="text-muted mb-0">contact@univertechno.tn</p>
                    <p className="text-muted mb-0">support@univertechno.tn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="col-lg-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-5">
        <div className="container">
          <div className="row g-5 mb-5">
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">Services</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Consultation</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Implémentation</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Support</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Formation</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">À Propos</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Qui sommes-nous</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Notre histoire</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Carrières</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Blog</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">Partenaires</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Programme Partenaires</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Devenir Partenaire</a></li>
                <li className="mb-2"><a href="#" className="text-light-emphasis text-decoration-none">Ressources</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4">Retrouvez-nous</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <FaMapMarkerAlt className="me-2" />
                  123 Rue de l'Innovation, Tunis
                </li>
                <li className="mb-2">
                  <FaPhone className="me-2" />
                  +216 71 123 456
                </li>
                <li className="mb-2">
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

      <style jsx>{`
        .product-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid rgba(0, 102, 204, 0.1);
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 102, 204, 0.1) !important;
          border-color: rgba(0, 102, 204, 0.3);
        }
        
        .sector-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid rgba(0, 102, 204, 0.1);
        }
        .sector-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 102, 204, 0.1) !important;
          border-color: rgba(0, 102, 204, 0.3);
        }
        
        .icon-container {
          transition: all 0.3s ease;
        }
        .sector-card:hover .icon-container {
          transform: scale(1.1);
        }
        
        .bg-primary {
          background-color: #0066cc !important;
        }
        .btn-primary {
          background-color: #0066cc;
          border-color: #0066cc;
        }
        .btn-primary:hover {
          background-color: #0052a3;
          border-color: #0052a3;
        }
        .text-primary {
          color: #0066cc !important;
        }
        .hero-section {
          background: linear-gradient(135deg, #f8faff 0%, #e6f0ff 100%);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 1020;
        }
      `}</style>
    </div>
  );
};

export default Home;