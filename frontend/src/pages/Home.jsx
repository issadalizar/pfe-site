import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaShoppingCart, FaUser, FaSearch, FaArrowRight, FaMapMarkerAlt, 
  FaPhone, FaEnvelope, FaLeaf, FaGem, FaHeart, FaTruck,
  FaStore, FaBars, FaCogs, FaCar, FaFlask, FaTimes,
  FaChevronRight, FaStar, FaStarHalf, FaRegStar
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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Secteurs d'expertise
  const expertiseSectors = [
    {
      id: "cnc-education",
      name: "CNC for Education",
      displayName: "CNC for Education",
      icon: <FaCogs size={24} />,
      color: "#4361ee",
      description: "Machines CNC pour l'enseignement et la formation professionnelle",
      path: "/sector/cnc-education"
    },
    {
      id: "voiture",
      name: "Voiture",
      displayName: "Voiture",
      icon: <FaCar size={24} />,
      color: "#f72585",
      description: "Équipements didactiques pour l'automobile",
      path: "/sector/voiture"
    },
    {
      id: "mcp-lab",
      name: "MCP lab electronics",
      displayName: "MCP lab electronics",
      icon: <FaFlask size={24} />,
      color: "#4cc9f0",
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

  return (
    <div className="home-page">
      {/* Header - Style moderne et épuré */}
      <header className="py-3 sticky-top" style={{ 
        backgroundColor: '#ffffff', 
        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
        zIndex: 1030 
      }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            {/* Logo */}
            <div className="d-flex align-items-center">
              <div 
                className="me-2 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '45px', 
                  height: '45px', 
                  background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transform: 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(5deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
              >
                <FaStore />
              </div>
              <div>
                <h1 className="fw-bold mb-0" style={{ 
                  fontSize: '1.5rem', 
                  background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  cursor: 'pointer' 
                }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  UniverTechno+
                </h1>
              </div>
            </div>

            {/* Navigation - Centrée */}
            <div className="d-none d-lg-block">
              <ul className="nav">
                <li className="nav-item">
                  <a className="nav-link fw-medium" href="#home" style={{ color: '#2b2d42' }}>Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-medium" href="#products" style={{ color: '#2b2d42' }}>Products</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-medium" href="#services" style={{ color: '#2b2d42' }}>Services</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-medium" href="#about" style={{ color: '#2b2d42' }}>About</a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-medium" to="/contact" style={{ color: '#2b2d42' }}>Contact</Link>
                </li>
              </ul>
            </div>

            {/* Search et Actions */}
            <div className="d-flex align-items-center gap-3">
              {/* Barre de recherche */}
              <div className="position-relative d-none d-md-block">
                <input 
                  type="text" 
                  className="form-control rounded-pill border-0 bg-light" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: "200px", 
                    padding: '0.5rem 1rem 0.5rem 2.5rem',
                    fontSize: '0.9rem'
                  }}
                />
                <FaSearch className="position-absolute" style={{ left: "15px", top: "12px", color: "#8d99ae", fontSize: '14px' }} />
              </div>

              {/* Icônes utilisateur et panier */}
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: '#f8f9fa', 
                  width: '40px', 
                  height: '40px', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={handleLoginClick}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              >
                <FaUser style={{ color: '#4361ee' }} />
              </div>

              <div className="position-relative">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: '#f8f9fa', 
                    width: '40px', 
                    height: '40px', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate("/cart")}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                >
                  <FaShoppingCart style={{ color: '#4361ee' }} />
                </div>
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{ 
                    backgroundColor: '#f72585', 
                    fontSize: '10px',
                    border: '2px solid white'
                  }}
                >
                  3
                </span>
              </div>

              {/* Menu mobile */}
              <button 
                className="btn d-lg-none p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ color: '#4361ee' }}
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {mobileMenuOpen && (
            <div className="d-lg-none mt-3 pb-2">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link" href="#home" style={{ color: '#2b2d42' }}>Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#products" style={{ color: '#2b2d42' }}>Products</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#services" style={{ color: '#2b2d42' }}>Services</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#about" style={{ color: '#2b2d42' }}>About</a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact" style={{ color: '#2b2d42' }}>Contact</Link>
                </li>
              </ul>
              <div className="mt-3">
                <input 
                  type="text" 
                  className="form-control rounded-pill bg-light border-0" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Design épuré avec image à droite */}
      <section id="home" className="py-5" style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-4" style={{ color: '#4361ee !important' }}>
                  UI/UX DESIGN
                </span>
                <h1 className="display-3 fw-bold mb-4" style={{ 
                  fontSize: '3.5rem', 
                  lineHeight: '1.2',
                  color: '#2b2d42'
                }}>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </h1>
                <p className="lead mb-4" style={{ fontSize: '1.1rem', color: '#8d99ae', maxWidth: '500px' }}>
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when known printer took a galley.
                </p>
                <div className="d-flex gap-3">
                  <button 
                    className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-medium"
                    style={{ 
                      background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                      border: 'none',
                      boxShadow: '0 10px 20px rgba(67, 97, 238, 0.2)'
                    }}
                  >
                    Contact
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg px-5 py-3 rounded-pill fw-medium"
                    style={{ borderColor: '#4361ee', color: '#4361ee' }}
                  >
                    READ MORE
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative" style={{
                perspective: '1000px'
              }}>
                {/* Image principale */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '500px',
                  transform: 'rotateY(-5deg) rotateX(2deg)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease',
                  boxShadow: '20px 20px 40px rgba(0,0,0,0.1), -10px -10px 30px rgba(255,255,255,0.8)',
                  borderRadius: '30px',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotateY(-3deg) rotateX(1deg) translateZ(20px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(2deg)';
                }}>
                  <img 
                    src="/image2.png" 
                    alt="UniverTechno+" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  {/* Overlay dégradé */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(58, 12, 163, 0.1) 100%)',
                    pointerEvents: 'none'
                  }}></div>
                </div>
                
                {/* Éléments décoratifs */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(67, 97, 238, 0.05)',
                  borderRadius: '50%',
                  zIndex: -1
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '200px',
                  height: '200px',
                  background: 'rgba(247, 37, 133, 0.05)',
                  borderRadius: '50%',
                  zIndex: -1
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Secteurs Section - Design en cartes modernes */}
      <section id="services" className="py-5" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#2b2d42' }}>Nos Secteurs d'Expertise</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Des solutions complètes pour chaque domaine d'expertise
            </p>
          </div>

          <div className="row g-4">
            {expertiseSectors.map((sector, index) => (
              <div key={index} className="col-md-4">
                <div 
                  className="card h-100 border-0 rounded-4 overflow-hidden"
                  style={{ 
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleSectorClick(sector)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(67, 97, 238, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div 
                        className="icon-container rounded-3 d-flex align-items-center justify-content-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${sector.color}20, ${sector.color}10)`,
                          width: '60px',
                          height: '60px',
                          color: sector.color
                        }}
                      >
                        {sector.icon}
                      </div>
                      <h5 className="fw-bold mb-0" style={{ color: sector.color }}>{sector.displayName}</h5>
                    </div>
                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {sector.description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-medium" style={{ color: '#2b2d42' }}>Découvrir</span>
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '35px', 
                          height: '35px',
                          backgroundColor: `${sector.color}15`,
                          color: sector.color,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FaChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue Section - Avec grille de produits */}
      <section id="products" className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#2b2d42' }}>Catalogue Complet</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Découvrez notre gamme complète d'équipements professionnels
            </p>
          </div>
          
          <div className="row">
            {/* Filtres à gauche */}
            <div className="col-lg-3 mb-4">
              <div className="bg-white p-4 rounded-4 border-0" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div className="mb-4">
                  <div 
                    className="d-flex align-items-center justify-content-between p-3 rounded-3 cursor-pointer"
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: selectedCategory === "All products" ? '#4361ee' : '#f8f9fa',
                      color: selectedCategory === "All products" ? 'white' : '#2b2d42',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleCategoryFilter("All products")}
                  >
                    <span className="fw-medium">Tous les produits</span>
                    <span className="badge" style={{ 
                      backgroundColor: selectedCategory === "All products" ? 'rgba(255,255,255,0.2)' : '#e9ecef',
                      color: selectedCategory === "All products" ? 'white' : '#2b2d42'
                    }}>
                      {allProducts.length}
                    </span>
                  </div>
                </div>

                <div>
                  <h6 className="fw-bold mb-3" style={{ color: '#2b2d42' }}>Catégories</h6>
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
                            color: selectedCategory === cat ? '#4361ee' : '#6c757d',
                            backgroundColor: selectedCategory === cat ? '#e7f0ff' : 'transparent',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={(e) => { e.preventDefault(); handleCategoryFilter(cat); }}
                        >
                          <span className="small">{cat}</span>
                          <small className="text-muted">({count})</small>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Grille de produits à droite */}
            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: '#2b2d42' }}>
                    {selectedCategory === "All products" ? "Tous les produits" : selectedCategory}
                  </h4>
                </div>
                <span className="small text-muted">
                  {filteredProducts.length} produits trouvés
                </span>
              </div>

              <div className="row g-4">
                {filteredProducts.slice(0, 12).map((product, index) => (
                  <div key={index} className="col-md-6 col-lg-4">
                    <div 
                      className="card h-100 border-0 rounded-4 overflow-hidden"
                      onClick={() => handleProductClick(product)}
                      style={{ 
                        cursor: "pointer",
                        boxShadow: '0 5px 20px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(67, 97, 238, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.02)';
                      }}
                    >
                      <div className="product-image p-3 text-center bg-light">
                        <img 
                          src={product.images?.[0] || "/images/placeholder.png"}
                          alt={product.title}
                          className="img-fluid"
                          style={{ height: "150px", objectFit: "contain" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/150/e9ecef/4361ee?text=${encodeURIComponent(product.title.substring(0, 20))}`;
                          }}
                        />
                      </div>
                      <div className="card-body p-3">
                        <h6 className="fw-bold mb-2" title={product.title} style={{ color: '#2b2d42' }}>
                          {truncateText(product.title, 30)}
                        </h6>
                        <p className="small text-muted mb-2 text-truncate">
                          {product.description || product.category || product.mainCategory}
                        </p>
                        {renderStars()}
                        <div className="mt-3 d-flex justify-content-between align-items-center">
                          <span className="fw-bold" style={{ color: '#4361ee' }}>
                            {formatPrice(product.price)}
                          </span>
                          <span className="small text-muted">/ unit</span>
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

              {filteredProducts.length > 12 && (
                <div className="text-center mt-5">
                  <button 
                    className="btn btn-outline-primary rounded-pill px-5 py-2"
                    style={{ borderColor: '#4361ee', color: '#4361ee' }}
                  >
                    Voir plus de produits
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5" style={{ backgroundColor: '#1a1a2e', color: '#a3a5c2' }}>
        <div className="container">
          <div className="row g-5 mb-5">
            <div className="col-md-6 col-lg-3">
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="me-2 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '20px'
                  }}
                >
                  <FaStore />
                </div>
                <h5 className="fw-bold mb-0 text-white">UniverTechno+</h5>
              </div>
              <p className="small" style={{ color: '#a3a5c2' }}>
                Votre partenaire en équipement industriel et pédagogique depuis 2020.
              </p>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4 text-white">Services</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Consultation</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Implémentation</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Support</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Formation</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4 text-white">À Propos</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Qui sommes-nous</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Notre histoire</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Carrières</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Blog</a></li>
              </ul>
            </div>
            <div className="col-md-6 col-lg-3">
              <h5 className="fw-bold mb-4 text-white">Retrouvez-nous</h5>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaMapMarkerAlt size={14} style={{ color: '#4361ee' }} />
                  <span style={{ color: '#a3a5c2' }}>123 Rue de l'Innovation, Tunis</span>
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaPhone size={14} style={{ color: '#4361ee' }} />
                  <span style={{ color: '#a3a5c2' }}>+216 71 123 456</span>
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaEnvelope size={14} style={{ color: '#4361ee' }} />
                  <span style={{ color: '#a3a5c2' }}>contact@univertechno.tn</span>
                </li>
              </ul>
            </div>
          </div>

          <hr className="opacity-25" style={{ borderColor: '#a3a5c2' }} />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 small" style={{ color: '#a3a5c2' }}>
                © 2024 UniverTechno+. Tous droits réservés.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex justify-content-md-end gap-4">
                <a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Facebook</a>
                <a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>LinkedIn</a>
                <a href="#" className="text-decoration-none" style={{ color: '#a3a5c2' }}>Twitter</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .nav-link {
          transition: color 0.3s ease;
          font-size: 0.95rem;
        }
        .nav-link:hover {
          color: #4361ee !important;
        }
        .card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.02);
        }
        .icon-container {
          transition: all 0.3s ease;
        }
        .card:hover .icon-container {
          transform: scale(1.1);
        }
        .btn-primary {
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          border: none;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(67, 97, 238, 0.3) !important;
        }
        .btn-outline-primary {
          transition: all 0.3s ease;
        }
        .btn-outline-primary:hover {
          background: linear-gradient(135deg, #4361ee, #3a0ca3);
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(67, 97, 238, 0.2);
        }
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 1020;
        }
        .badge.bg-primary.bg-opacity-10 {
          color: #4361ee !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Home;