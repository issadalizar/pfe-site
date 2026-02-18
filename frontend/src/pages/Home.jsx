import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaShoppingCart, FaUser, FaSearch, FaArrowRight, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaLeaf, FaGem, FaHeart, FaTruck,
  FaStore, FaBars, FaCogs, FaCar, FaFlask, FaTimes,
  FaChevronRight, FaStar, FaStarHalf, FaRegStar, FaRobot,
  FaMicrochip, FaIndustry, FaGraduationCap, FaChartLine,
  FaShieldAlt, FaHeadset, FaRocket, FaAward, FaCheckCircle,
  FaQuoteRight, FaFacebook, FaLinkedin, FaTwitter, FaYoutube,
  FaInstagram, FaAngleRight, FaPlay, FaRegClock, FaRegCalendar,
  FaRegLightbulb, FaRegHandshake, FaRegPaperPlane, FaRegBell,
  FaMapMarkedAlt
} from "react-icons/fa";
import { productAPI, categoryAPI } from "../services/api";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

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

  // Secteurs d'expertise enrichis
  const expertiseSectors = [
    {
      id: "cnc-education",
      name: "CNC for Education",
      displayName: "CNC for Education",
      icon: <FaCogs size={28} />,
      color: "#4361ee",
      gradient: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      description: "Machines CNC pour l'enseignement et la formation professionnelle",
      path: "/sector/cnc-education",
      features: ["Formation pratique", "Simulation 3D", "Support pédagogique"],
      stats: { projects: 150, clients: 45 }
    },
    {
      id: "voiture",
      name: "Voiture",
      displayName: "Automotive",
      icon: <FaCar size={28} />,
      color: "#f72585",
      gradient: "linear-gradient(135deg, #f72585, #b5179e)",
      description: "Équipements didactiques pour l'automobile et diagnostic",
      path: "/sector/voiture",
      features: ["Diagnostic avancé", "Simulation moteur", "Systèmes embarqués"],
      stats: { projects: 98, clients: 32 }
    },
    {
      id: "mcp-lab",
      name: "MCP lab electronics",
      displayName: "Electronics Lab",
      icon: <FaFlask size={28} />,
      color: "#4cc9f0",
      gradient: "linear-gradient(135deg, #4cc9f0, #4895ef)",
      description: "Matériel de laboratoire pour l'électronique et l'instrumentation",
      path: "/sector/mcp-lab",
      features: ["Mesure précise", "Oscilloscopes", "Composants SMD"],
      stats: { projects: 210, clients: 67 }
    }
  ];

  // Témoignages clients
  const testimonials = [
    {
      id: 1,
      name: "Dr. Ahmed Ben Mahmoud",
      position: "Directeur, Institut Supérieur des Études Technologiques",
      content: "UniverTechno+ a équipé nos laboratoires avec des machines CNC de dernière génération. La qualité des équipements et le support technique sont exceptionnels.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Sarra Khelifi",
      position: "Responsable R&D, Tunisie Automotive",
      content: "Les solutions de diagnostic automobile nous ont permis d'optimiser nos processus de contrôle qualité. Un partenaire fiable et innovant.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      name: "Mohamed Ali Bouaziz",
      position: "Chef de projet, ENIT",
      content: "La plateforme de simulation électronique a révolutionné notre façon d'enseigner. Les étudiants peuvent maintenant expérimenter en toute sécurité.",
      rating: 4.5,
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    }
  ];

  // Statistiques clés
  const keyStats = [
    { icon: <FaIndustry />, value: "500+", label: "Équipements installés" },
    { icon: <FaGraduationCap />, value: "120+", label: "Institutions partenaires" },
    { icon: <FaAward />, value: "15+", label: "Années d'expertise" },
    { icon: <FaHeadset />, value: "24/7", label: "Support technique" }
  ];

  useEffect(() => {
    fetchCategories();
    loadAllProducts();
    loadAllCategoriesForDebug();
    
    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour charger toutes les catégories et afficher leurs IDs (pour debug)
  const loadAllCategoriesForDebug = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || response.data || [];
      console.log("📋 Toutes les catégories disponibles:");
      console.log("======================================");
      cats.forEach(cat => {
        console.log(`- Nom: ${cat.name}`);
        console.log(`  ID: ${cat._id}`);
        console.log(`  Parent: ${cat.parent?.name || cat.parent || 'Aucun'}`);
        console.log(`  Niveau: ${cat.level || 'Non spécifié'}`);
        console.log("---");
      });
      console.log("======================================");
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || response.data || [];
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
    setAllProducts(products);
    
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
    console.log("🔍 Clic sur le secteur:", sector);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Merci de votre inscription à notre newsletter !");
    setNewsletterEmail("");
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

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

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

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
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} style={{ color: "#ffc107" }} size={14} />;
          } else if (i === fullStars && hasHalfStar) {
            return <FaStarHalf key={i} style={{ color: "#ffc107" }} size={14} />;
          } else {
            return <FaRegStar key={i} style={{ color: "#ffc107" }} size={14} />;
          }
        })}
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

  const handleContactClick = () => {
    navigate("/contact");
  };

  const handleLocationClick = () => {
    window.open("https://www.google.com/maps/place/Univertechno/@35.6724336,10.1037157,17z/data=!3m1!4b1!4m6!3m5!1s0x12fdc50cb1c7e3d5:0xfd3f37fd908fff33!8m2!3d35.6724336!4d10.1037157!16s%2Fg%2F11tsd7jgzb?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D", "_blank");
  };

  return (
    <div className="home-page">
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary rounded-circle position-fixed"
          style={{
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            zIndex: 1050,
            boxShadow: '0 4px 20px rgba(67, 97, 238, 0.4)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaArrowRight style={{ transform: 'rotate(-90deg)' }} />
        </button>
      )}

      {/* Header */}
      <header className="py-3 sticky-top" style={{ 
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.03)',
        borderBottom: '1px solid rgba(67, 97, 238, 0.1)',
        zIndex: 1030 
      }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <div className="d-flex align-items-center">
              <div 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '26px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 8px 20px rgba(67, 97, 238, 0.3)'
                }}
                onClick={scrollToTop}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                }}
              >
                <FaStore />
              </div>
              <div>
                <h1 className="fw-bold mb-0" style={{ 
                  fontSize: '1.6rem', 
                  background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  cursor: 'pointer',
                  letterSpacing: '-0.5px'
                }} onClick={scrollToTop}>
                  UniVer<span style={{ color: '#4361ee', WebkitTextFillColor: '#4361ee' }}>Techno</span>+
                </h1>
              </div>
            </div>

            {/* Navigation */}
            <div className="d-none d-lg-block">
              <ul className="nav gap-2">
                {[
                  { name: 'Accueil', href: '#home' },
                  { name: 'Produits', href: '#products' },
                  { name: 'Expertise', href: '#services' },
                  { name: 'À propos', href: '#about' },
                  { name: 'Contact', href: '/contact' }
                ].map((item, index) => (
                  <li className="nav-item" key={index}>
                    {item.href.startsWith('/') ? (
                      <Link 
                        className="nav-link fw-medium px-4 py-2 rounded-pill"
                        to={item.href}
                        style={{ color: '#334155', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
                          e.currentTarget.style.color = '#4361ee';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a 
                        className="nav-link fw-medium px-4 py-2 rounded-pill"
                        href={item.href}
                        style={{ color: '#334155', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
                          e.currentTarget.style.color = '#4361ee';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-3">
              {/* Recherche */}
              <div className="position-relative d-none d-md-block">
                <input 
                  type="text" 
                  className="form-control rounded-pill border-0 bg-light"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: "240px", 
                    padding: '0.6rem 1rem 0.6rem 2.8rem',
                    fontSize: '0.95rem',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#4361ee';
                    e.target.style.boxShadow = '0 0 0 4px rgba(67, 97, 238, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <FaSearch className="position-absolute" style={{ 
                  left: "18px", 
                  top: "12px", 
                  color: "#94a3b8", 
                  fontSize: '16px',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Icônes */}
              <div className="d-flex align-items-center gap-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: '#f8fafc', 
                    width: '44px', 
                    height: '44px', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent'
                  }}
                  onClick={handleLoginClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eef2ff';
                    e.currentTarget.style.borderColor = '#4361ee';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <FaUser style={{ color: '#4361ee', fontSize: '18px' }} />
                </div>

                <div className="position-relative">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      width: '44px', 
                      height: '44px', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent'
                    }}
                    onClick={() => navigate("/cart")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#eef2ff';
                      e.currentTarget.style.borderColor = '#4361ee';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <FaShoppingCart style={{ color: '#4361ee', fontSize: '18px' }} />
                  </div>
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                    style={{ 
                      backgroundColor: '#f72585', 
                      fontSize: '11px',
                      padding: '4px 6px',
                      border: '2px solid white',
                      fontWeight: '600'
                    }}
                  >
                    3
                  </span>
                </div>
              </div>

              {/* Menu mobile */}
              <button 
                className="btn d-lg-none p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ 
                  color: '#4361ee',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '50%'
                }}
              >
                {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div className="d-lg-none mt-3 pb-2" style={{ animation: 'slideDown 0.3s ease' }}>
              <ul className="nav flex-column">
                {[
                  { name: 'Accueil', href: '#home' },
                  { name: 'Produits', href: '#products' },
                  { name: 'Expertise', href: '#services' },
                  { name: 'À propos', href: '#about' },
                  { name: 'Contact', href: '/contact' }
                ].map((item, index) => (
                  <li className="nav-item" key={index}>
                    {item.href.startsWith('/') ? (
                      <Link 
                        className="nav-link py-3"
                        to={item.href}
                        style={{ color: '#334155', borderBottom: '1px solid #e2e8f0' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a 
                        className="nav-link py-3"
                        href={item.href}
                        style={{ color: '#334155', borderBottom: '1px solid #e2e8f0' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <input 
                  type="text" 
                  className="form-control rounded-pill bg-light border-0 py-3"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="position-relative overflow-hidden" style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0b1120 0%, #1a237e 50%, #283593 100%)',
      }}>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(67, 97, 238, 0.15) 0%, transparent 50%)',
          animation: 'pulse 8s infinite'
        }}></div>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(247, 37, 133, 0.1) 0%, transparent 50%)',
          animation: 'pulse 12s infinite reverse'
        }}></div>

        <div className="container h-100 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-12 text-white text-center" style={{ animation: 'fadeInUp 1s ease' }}>
              <div className="mb-4">
                <span className="badge px-4 py-2 rounded-pill" style={{
                  background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                  boxShadow: '0 10px 30px rgba(67, 97, 238, 0.3)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <FaRocket className="me-2" style={{ fontSize: '14px' }} />
                  INNOVATION TECHNOLOGIQUE
                </span>
              </div>
              
              <h1 className="display-3 fw-bold mb-4" style={{
                lineHeight: '1.2',
                textShadow: '0 4px 30px rgba(0,0,0,0.3)'
              }}>
                Façonnez l'avenir avec{' '}
                <span style={{
                  background: 'linear-gradient(120deg, #64b5f6, #c084fc, #f72585)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  animation: 'gradient 3s linear infinite'
                }}>
                  l'excellence
                </span>
                <br />technologique
              </h1>
              
              <p className="lead mb-5" style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Équipements de pointe pour l'éducation et l'industrie. 
                Solutions sur-mesure, support expert et innovation continue.
              </p>
              
              <div className="d-flex flex-wrap gap-4 justify-content-center">
                <button 
                  className="btn btn-lg px-5 py-3 rounded-pill"
                  onClick={handleContactClick}
                  style={{
                    background: 'linear-gradient(120deg, #4361ee, #3a0ca3)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 20px 40px rgba(67, 97, 238, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 30px 50px rgba(67, 97, 238, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(67, 97, 238, 0.3)';
                  }}
                >
                  Contactez-nous
                </button>
                
                <button 
                  className="btn btn-lg px-5 py-3 rounded-pill"
                  onClick={handleLocationClick}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <FaMapMarkedAlt className="me-2" style={{ fontSize: '14px' }} />
                  Localisation
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      {/* Secteurs d'expertise */}
      <section id="services" className="py-6" style={{
        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge px-4 py-2 rounded-pill mb-3" style={{
              background: 'linear-gradient(145deg, #4361ee20, #3a0ca320)',
              color: '#4361ee',
              fontWeight: '600'
            }}>
              NOTRE EXPERTISE
            </span>
            <h2 className="display-4 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Solutions par secteur
            </h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              Des solutions complètes et adaptées à chaque domaine d'application
            </p>
          </div>

          <div className="row g-4">
            {expertiseSectors.map((sector, index) => (
              <div key={index} className="col-lg-4">
                <div 
                  className="card h-100 border-0 rounded-4 overflow-hidden"
                  style={{
                    background: 'white',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    cursor: 'pointer',
                    border: '1px solid rgba(67, 97, 238, 0.1)'
                  }}
                  onClick={() => handleSectorClick(sector)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 40px 80px rgba(67, 97, 238, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.02)';
                  }}
                >
                  <div style={{
                    height: '6px',
                    background: sector.gradient,
                    width: '100%'
                  }}></div>
                  
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div style={{
                        width: '70px',
                        height: '70px',
                        background: `${sector.color}15`,
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: sector.color,
                        fontSize: '30px'
                      }}>
                        {sector.icon}
                      </div>
                      <div>
                        <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                          {sector.displayName}
                        </h4>
                        <div className="d-flex gap-3">
                          <small style={{ color: '#64748b' }}>
                            <FaChartLine className="me-1" />
                            {sector.stats.projects} projets
                          </small>
                          <small style={{ color: '#64748b' }}>
                            <FaHeadset className="me-1" />
                            {sector.stats.clients} clients
                          </small>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
                      {sector.description}
                    </p>

                    <div className="mb-4">
                      {sector.features.map((feature, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                          <FaCheckCircle style={{ color: sector.color, fontSize: '14px' }} />
                          <small style={{ color: '#334155' }}>{feature}</small>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-medium" style={{ color: sector.color }}>
                        Explorer le secteur
                      </span>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: `${sector.color}15`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: sector.color,
                        transition: 'all 0.3s ease'
                      }}>
                        <FaArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue produits */}
      <section id="products" className="py-6">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge px-4 py-2 rounded-pill mb-3" style={{
              background: 'linear-gradient(145deg, #f7258520, #b5179e20)',
              color: '#f72585',
              fontWeight: '600'
            }}>
              CATALOGUE
            </span>
            <h2 className="display-4 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Équipements professionnels
            </h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              Découvrez notre gamme complète de solutions technologiques
            </p>
          </div>

          {/* Filtres */}
          <div className="row mb-5">
            <div className="col-lg-3 mb-4 mb-lg-0">
              <div className="bg-white p-4 rounded-4 border" style={{
                borderColor: 'rgba(67, 97, 238, 0.1) !important',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
              }}>
                <div className="mb-4">
                  <div 
                    className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{ 
                      cursor: 'pointer',
                      background: selectedCategory === "All products" ? 'linear-gradient(145deg, #4361ee, #3a0ca3)' : '#f8fafc',
                      color: selectedCategory === "All products" ? 'white' : '#334155',
                      transition: 'all 0.3s ease',
                      border: selectedCategory === "All products" ? 'none' : '1px solid #e2e8f0'
                    }}
                    onClick={() => handleCategoryFilter("All products")}
                  >
                    <span className="fw-medium">Tous les produits</span>
                    <span className="badge" style={{ 
                      background: selectedCategory === "All products" ? 'rgba(255,255,255,0.2)' : '#e9ecef',
                      color: selectedCategory === "All products" ? 'white' : '#334155',
                      padding: '6px 10px',
                      borderRadius: '8px'
                    }}>
                      {allProducts.length}
                    </span>
                  </div>
                </div>

                <div>
                  <h6 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Catégories</h6>
                  <div className="d-flex flex-column gap-2">
                    {mainCategories.map((cat, index) => {
                      if (cat === "All products") return null;
                      const count = getCategoryProductCount(cat);
                      return (
                        <a 
                          key={index}
                          href="#" 
                          className="text-decoration-none d-flex align-items-center justify-content-between p-3 rounded-3"
                          style={{ 
                            color: selectedCategory === cat ? '#4361ee' : '#64748b',
                            background: selectedCategory === cat ? '#eef2ff' : 'transparent',
                            transition: 'all 0.3s ease',
                            border: '1px solid',
                            borderColor: selectedCategory === cat ? '#4361ee' : 'transparent'
                          }}
                          onClick={(e) => { e.preventDefault(); handleCategoryFilter(cat); }}
                        >
                          <span className="small fw-medium">{cat}</span>
                          <small style={{ color: selectedCategory === cat ? '#4361ee' : '#94a3b8' }}>
                            ({count})
                          </small>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Grille de produits */}
            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                    {selectedCategory === "All products" ? "Tous les produits" : selectedCategory}
                  </h4>
                  <small className="text-muted">
                    {filteredProducts.length} produits disponibles
                  </small>
                </div>
                <select className="form-select w-auto rounded-pill" style={{
                  borderColor: '#e2e8f0',
                  padding: '0.6rem 2rem 0.6rem 1rem',
                  fontSize: '0.95rem'
                }}>
                  <option>Trier par : Popularité</option>
                  <option>Prix croissant</option>
                  <option>Prix décroissant</option>
                  <option>Nouveautés</option>
                </select>
              </div>

              <div className="row g-4">
                {filteredProducts.slice(0, 12).map((product, index) => (
                  <div key={index} className="col-md-6 col-xl-4">
                    <div 
                      className="card h-100 border-0 rounded-4 overflow-hidden"
                      onClick={() => handleProductClick(product)}
                      style={{ 
                        cursor: "pointer",
                        background: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        border: '1px solid rgba(67, 97, 238, 0.1)'
                      }}
                    >
                      <div className="position-relative">
                        <div className="product-image p-4 text-center" style={{
                          background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={product.images?.[0] || "/images/placeholder.png"}
                            alt={product.title}
                            className="img-fluid"
                            style={{ 
                              height: "150px", 
                              objectFit: "contain",
                              transition: 'transform 0.3s ease'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/150/e9ecef/4361ee?text=${encodeURIComponent(product.title.substring(0, 20))}`;
                            }}
                          />
                        </div>
                        
                        {index < 2 && (
                          <span className="position-absolute top-0 end-0 m-3 badge rounded-pill" style={{
                            background: 'linear-gradient(145deg, #f72585, #b5179e)',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            NOUVEAU
                          </span>
                        )}
                      </div>

                      <div className="card-body p-4">
                        <h6 className="fw-bold mb-2" title={product.title} style={{ 
                          color: '#0f172a',
                          fontSize: '1rem',
                          lineHeight: '1.4'
                        }}>
                          {truncateText(product.title, 35)}
                        </h6>
                        
                        <p className="small text-muted mb-3" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.description || product.category || product.mainCategory}
                        </p>
                        
                        <div className="mb-3">
                          {renderStars()}
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-bold h5 mb-0" style={{ color: '#4361ee' }}>
                              {formatPrice(product.price)}
                            </span>
                            <small className="text-muted ms-1">TTC</small>
                          </div>
                          <button className="btn btn-sm rounded-circle" style={{
                            width: '40px',
                            height: '40px',
                            background: '#eef2ff',
                            color: '#4361ee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            <FaShoppingCart size={14} />
                          </button>
                        </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages clients */}
      <section className="py-6" style={{
        background: 'linear-gradient(145deg, #0f172a, #1e293b)',
        color: 'white'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge px-4 py-2 rounded-pill mb-3" style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: '600'
            }}>
              TÉMOIGNAGES
            </span>
            <h2 className="display-4 fw-bold mb-3 text-white">
              Ce qu'ils disent de nous
            </h2>
            <p className="text-white-50" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              La confiance de nos partenaires, notre plus grande fierté
            </p>
          </div>

          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-md-4">
                <div className="card h-100 border-0 rounded-4" style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div className="card-body p-4">
                    <FaQuoteRight style={{
                      color: 'rgba(255,255,255,0.2)',
                      fontSize: '40px',
                      marginBottom: '20px'
                    }} />
                    
                    <p className="mb-4" style={{
                      color: 'rgba(255,255,255,0.9)',
                      lineHeight: '1.6',
                      fontStyle: 'italic'
                    }}>
                      "{testimonial.content}"
                    </p>

                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="rounded-circle"
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          border: '3px solid rgba(255,255,255,0.2)'
                        }}
                      />
                      <div>
                        <h6 className="fw-bold mb-1 text-white">{testimonial.name}</h6>
                        <small style={{ color: 'rgba(255,255,255,0.6)' }}>{testimonial.position}</small>
                        <div className="mt-2">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Newsletter */}
      <section className="py-6" style={{
        background: 'linear-gradient(145deg, #4361ee, #3a0ca3)'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center text-white">
              <h2 className="display-5 fw-bold mb-4">
                Restez informé des dernières innovations
              </h2>
              <p className="mb-5" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                Recevez nos actualités, offres exclusives et nouveautés produits
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="d-flex flex-wrap gap-3 justify-content-center">
                <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                  <input
                    type="email"
                    className="form-control form-control-lg rounded-pill border-0"
                    placeholder="Votre adresse email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-lg rounded-pill px-5"
                  style={{
                    background: 'white',
                    color: '#4361ee',
                    fontWeight: '600',
                    border: 'none',
                    padding: '1rem 2rem'
                  }}
                >
                  <FaRegPaperPlane className="me-2" />
                  S'inscrire
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6" style={{
        background: '#0f172a',
        color: '#94a3b8'
      }}>
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(145deg, #4361ee, #3a0ca3)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px'
                }}>
                  <FaStore />
                </div>
                <h4 className="fw-bold text-white mb-0">UniverTechno+</h4>
              </div>
              <p className="mb-4">
                Leader dans la fourniture d'équipements technologiques pour l'éducation et l'industrie.
              </p>
              <div className="d-flex gap-3">
                {[FaFacebook, FaLinkedin, FaTwitter, FaYoutube, FaInstagram].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#94a3b8',
                      transition: 'all 0.3s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="col-lg-8">
              <div className="row g-4">
                <div className="col-md-4">
                  <h5 className="fw-bold text-white mb-4">Liens rapides</h5>
                  <ul className="list-unstyled">
                    {['Accueil', 'Produits', 'Services', 'À propos', 'Contact'].map((item, index) => (
                      <li className="mb-3" key={index}>
                        <a href="#" className="text-decoration-none" style={{ color: '#94a3b8' }}>
                          <FaAngleRight className="me-2" style={{ fontSize: '12px', color: '#4361ee' }} />
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-md-4">
                  <h5 className="fw-bold text-white mb-4">Contact</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center gap-3">
                      <FaMapMarkerAlt style={{ color: '#4361ee', fontSize: '18px' }} />
                      <span style={{ color: '#94a3b8' }}>123 Rue de l'Innovation, Tunis</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center gap-3">
                      <FaPhone style={{ color: '#4361ee', fontSize: '18px' }} />
                      <span style={{ color: '#94a3b8' }}>+216 71 123 456</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center gap-3">
                      <FaEnvelope style={{ color: '#4361ee', fontSize: '18px' }} />
                      <span style={{ color: '#94a3b8' }}>contact@univertechno.tn</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 small">
                © 2024 UniverTechno+. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles globaux */}
      <style jsx>{`
        .py-6 {
          padding-top: 5rem;
          padding-bottom: 5rem;
        }
        
        .nav-link {
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .btn {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 1020;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #4361ee;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #3a0ca3;
        }
        
        ::selection {
          background: #4361ee;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Home;