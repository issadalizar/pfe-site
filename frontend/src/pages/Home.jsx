import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGem,
  FaHeart,
  FaTruck,
  FaStore,
  FaBars,
  FaCogs,
  FaCar,
  FaFlask,
  FaTimes,
  FaChevronRight,
  FaStar,
  FaStarHalf,
  FaRegStar,
  FaRobot,
  FaMicrochip,
  FaIndustry,
  FaGraduationCap,
  FaChartLine,
  FaShieldAlt,
  FaHeadset,
  FaRocket,
  FaAward,
  FaCheckCircle,
  FaQuoteRight,
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaAngleRight,
  FaPlay,
  FaRegClock,
  FaRegCalendar,
  FaRegLightbulb,
  FaRegHandshake,
  FaRegPaperPlane,
  FaRegBell,
  FaMapMarkedAlt,
  FaGlobe,
  FaCube,
} from "react-icons/fa";
import { productAPI, categoryAPI } from "../services/CategorieProduct";
import { contactAPI } from "../services/contactAPI";
import FeaturedProducts from "../components/FeaturedProducts";
import ContactForm from "../components/ContactForm";
import ProductData from "../components/ProductData";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/home.css";
import { getAllCncProducts } from "../services/productDataService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ChatBot from "../components/ChatBot";
import { QRCodeSVG } from "qrcode.react";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, getCartCount, notification } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All products");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fermer les résultats de recherche au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== FONCTION POUR LA NAVIGATION 3D ==========
  const handleView3D = (e, product) => {
    e.stopPropagation();
    navigate(`/product3d/${encodeURIComponent(product.title)}`);
  };

  // Translations
  const translations = {
    fr: {
      home: "Accueil",
      products: "Produits",
      expertise: "Expertise",
      contactNav: "Contact",
      searchPlaceholder: "Rechercher un produit...",
      innovationBadge: "INNOVATION TECHNOLOGIQUE",
      heroTitle1: "Façonnez l'avenir avec",
      heroTitle2: "l'excellence",
      heroTitle3: "technologique",
      heroDescription:
        "Équipements de pointe pour l'éducation et l'industrie. Solutions sur-mesure, support expert et innovation continue.",
      contactUs: "Contactez-nous",
      location: "Localisation",
      expertiseBadge: "NOTRE EXPERTISE",
      expertiseTitle: "Solutions par secteur",
      expertiseDescription:
        "Des solutions complètes et adaptées à chaque domaine d'application",
      projects: "projets",
      clients: "clients",
      exploreSector: "Explorer le secteur",
      catalogBadge: "CATALOGUE",
      catalogTitle: "Équipements professionnels",
      catalogDescription:
        "Découvrez notre gamme complète de solutions technologiques",
      allProducts: "Tous les produits",
      categories: "Catégories",
      productsAvailable: "produits disponibles",
      sortBy: "Trier par : Popularité",
      sortPriceAsc: "Prix croissant",
      sortPriceDesc: "Prix décroissant",
      sortNewest: "Nouveautés",
      new: "NOUVEAU",
      noProducts: "Aucun produit trouvé",
      testimonialsBadge: "TÉMOIGNAGES",
      testimonialsTitle: "Ce qu'ils disent de nous",
      testimonialsDescription:
        "La confiance de nos partenaires, notre plus grande fierté",
      newsletterTitle: "Restez informé des dernières innovations",
      newsletterDescription:
        "Recevez nos actualités, offres exclusives et nouveautés produits",
      newsletterPlaceholder: "Votre adresse email",
      newsletterButton: "S'inscrire",
      footerDescription:
        "Leader dans la fourniture d'équipements technologiques pour l'éducation et l'industrie.",
      quickLinks: "Liens rapides",
      contact: "Contact",
      allRightsReserved: "Tous droits réservés.",
      cncEducation: "CNC for Education",
      automotive: "Automotive",
      electronicsLab: "Electronics Lab",
      cncTurning: "CNC Turing Machine",
      cncMilling: "CNC Milling Machine",
      sensors: "CAPTEURS ET ACTIONNEURS",
      electricity: "ÉLECTRICITÉ",
      multiplex: "RÉSEAUX MULTIPLEXÉS",
      accessories: "Accessoires",
      education: "EDUCATION EQUIPMENT",
      ttc: "TTC",
      newsletterSuccess: "Merci de votre inscription à notre newsletter !",
      results: "résultat(s)",
      close: "Fermer",
      moreResults: "autres résultats",
      noResults: "Aucun produit trouvé",
    },
    en: {
      home: "Home",
      products: "Products",
      expertise: "Expertise",
      contactNav: "Contact",
      searchPlaceholder: "Search for a product...",
      innovationBadge: "TECHNOLOGICAL INNOVATION",
      heroTitle1: "Shape the future with",
      heroTitle2: "technological",
      heroTitle3: "excellence",
      heroDescription:
        "Cutting-edge equipment for education and industry. Custom solutions, expert support, and continuous innovation.",
      contactUs: "Contact Us",
      location: "Location",
      expertiseBadge: "OUR EXPERTISE",
      expertiseTitle: "Solutions by sector",
      expertiseDescription:
        "Complete solutions adapted to each application domain",
      projects: "projects",
      clients: "clients",
      exploreSector: "Explore sector",
      catalogBadge: "CATALOG",
      catalogTitle: "Professional equipment",
      catalogDescription:
        "Discover our complete range of technological solutions",
      allProducts: "All products",
      categories: "Categories",
      productsAvailable: "products available",
      sortBy: "Sort by: Popularity",
      sortPriceAsc: "Price ascending",
      sortPriceDesc: "Price descending",
      sortNewest: "Newest",
      new: "NEW",
      noProducts: "No products found",
      testimonialsBadge: "TESTIMONIALS",
      testimonialsTitle: "What they say about us",
      testimonialsDescription: "The trust of our partners, our greatest pride",
      newsletterTitle: "Stay informed about the latest innovations",
      newsletterDescription:
        "Receive our news, exclusive offers, and new products",
      newsletterPlaceholder: "Your email address",
      newsletterButton: "Subscribe",
      footerDescription:
        "Leader in providing technological equipment for education and industry.",
      quickLinks: "Quick links",
      contact: "Contact",
      allRightsReserved: "All rights reserved.",
      cncEducation: "CNC for Education",
      automotive: "Automotive",
      electronicsLab: "Electronics Lab",
      cncTurning: "CNC Turing Machine",
      cncMilling: "CNC Milling Machine",
      sensors: "SENSORS AND ACTUATORS",
      electricity: "ELECTRICITY",
      multiplex: "MULTIPLEXED NETWORKS",
      accessories: "Accessories",
      education: "EDUCATION EQUIPMENT",
      ttc: "incl. tax",
      newsletterSuccess: "Thank you for subscribing to our newsletter!",
      results: "result(s)",
      close: "Close",
      moreResults: "more results",
      noResults: "No products found",
    },
  };

  const t = translations[language];

  const mainCategories = [
    "All products",
    "CNC Turning Machine",
    "CNC Milling Machine",
    "CAPTEURS ET ACTIONNEURS",
    "ÉLECTRICITÉ",
    "RÉSEAUX MULTIPLEXÉS",
    "Accessoires",
    "EDUCATION EQUIPMENT",
  ];

  const expertiseSectors = [
    {
      id: "cnc-education",
      name: "CNC for Education",
      displayNameFr: "CNC for Education",
      displayNameEn: "CNC for Education",
      icon: <FaCogs size={28} />,
      color: "#4361ee",
      gradient: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      descriptionFr:
        "Machines CNC pour l'enseignement et la formation professionnelle",
      descriptionEn: "CNC machines for education and vocational training",
      path: "/sector/cnc-education",
      featuresFr: [
        "Formation pratique",
        "Simulation 3D",
        "Support pédagogique",
      ],
      featuresEn: ["Hands-on training", "3D simulation", "Educational support"],
      stats: { projects: 150, clients: 45 },
    },
    {
      id: "voiture",
      name: "Voiture",
      displayNameFr: "Automobile",
      displayNameEn: "Automobile",
      icon: <FaCar size={28} />,
      color: "#f72585",
      gradient: "linear-gradient(135deg, #f72585, #b5179e)",
      descriptionFr: "Équipements didactiques pour l'automobile et diagnostic",
      descriptionEn: "Educational equipment for automotive and diagnostics",
      path: "/sector/voiture",
      featuresFr: [
        "Diagnostic avancé",
        "Simulation moteur",
        "Systèmes embarqués",
      ],
      featuresEn: [
        "Advanced diagnostics",
        "Engine simulation",
        "Embedded systems",
      ],
      stats: { projects: 98, clients: 32 },
    },
    {
      id: "mcp-lab",
      name: "MCP lab electronics",
      displayNameFr: "Electronics Lab",
      displayNameEn: "Electronics Lab",
      icon: <FaFlask size={28} />,
      color: "#4cc9f0",
      gradient: "linear-gradient(135deg, #4cc9f0, #4895ef)",
      descriptionFr:
        "Matériel de laboratoire pour l'électronique et l'instrumentation",
      descriptionEn: "Laboratory equipment for electronics and instrumentation",
      path: "/sector/mcp-lab",
      featuresFr: ["Mesure précise", "Oscilloscopes", "Composants SMD"],
      featuresEn: ["Precise measurement", "Oscilloscopes", "SMD components"],
      stats: { projects: 210, clients: 67 },
    },
  ];

  const keyStats = [
    {
      icon: <FaIndustry />,
      value: "500+",
      labelFr: "Équipements installés",
      labelEn: "Equipment installed",
    },
    {
      icon: <FaGraduationCap />,
      value: "120+",
      labelFr: "Institutions partenaires",
      labelEn: "Partner institutions",
    },
    {
      icon: <FaAward />,
      value: "15+",
      labelFr: "Années d'expertise",
      labelEn: "Years of expertise",
    },
    {
      icon: <FaHeadset />,
      value: "24/7",
      labelFr: "Support technique",
      labelEn: "Technical support",
    },
  ];

  useEffect(() => {
    fetchCategories();
    loadAllProducts();
    loadAllCategoriesForDebug();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadAllCategoriesForDebug = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || response.data || [];
      console.log(" Toutes les catégories disponibles:");
      console.log("======================================");
      cats.forEach((cat) => {
        console.log(`- Nom: ${cat.name}`);
        console.log(`  ID: ${cat._id}`);
        console.log(`  Parent: ${cat.parent?.name || cat.parent || "Aucun"}`);
        console.log(`  Niveau: ${cat.level || "Non spécifié"}`);
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
        .filter((cat) => !cat.parent || cat.level === 1)
        .slice(0, 8);
      setCategories(
        mainCategories.length > 0 ? mainCategories : cats.slice(0, 8)
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadAllProducts = async () => {
    const cncProductDetails = await getAllCncProducts();
    const products = Object.values(cncProductDetails);
    setAllProducts(products);

    const featured = [
      cncProductDetails["De2-Ultra Mini CNC Turning Center"],
      cncProductDetails["Fa2-Ultra Mini CNC Milling Center"],
      cncProductDetails["De8 (iKC8) CNC Turning Machine"],
      cncProductDetails["PX1 Baby CNC Milling Machine"],
      cncProductDetails["DT-M002 – Mesure des Positions"],
      cncProductDetails["PTL908-2H – High Voltage Safety Test Lead 10kV"],
    ].filter((product) => product !== null && product !== undefined);

    setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 6));
  };

  const handleSectorClick = (sector) => {
    console.log(" Clic sur le secteur:", sector);
    navigate(sector.path);
  };

  const handleProductClick = (product) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/product/${encodeURIComponent(product.title)}`);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setShowMobileFilters(false);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/dashboard" : "/client/dashboard");
    } else {
      navigate("/login");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(t.newsletterSuccess);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  const getFilteredProducts = useCallback(() => {
    let filtered = [...allProducts];

    if (selectedCategory && selectedCategory !== "All products") {
      filtered = filtered.filter(
        (p) =>
          p.mainCategory === selectedCategory ||
          p.category === selectedCategory ||
          (Array.isArray(p.category) && p.category.includes(selectedCategory)) ||
          (Array.isArray(p.mainCategory) && p.mainCategory.includes(selectedCategory)) ||
          (typeof p.category === "string" &&
            p.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (typeof p.mainCategory === "string" &&
            p.mainCategory.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allProducts, selectedCategory, searchQuery]);

  const getCategoryProductCount = useCallback((cat) => {
    if (cat === "All products") {
      return allProducts.length;
    }

    return allProducts.filter((p) => {
      if (p.mainCategory && p.mainCategory === cat) return true;
      if (p.category && p.category === cat) return true;
      if (Array.isArray(p.category) && p.category.includes(cat)) return true;
      if (Array.isArray(p.mainCategory) && p.mainCategory.includes(cat))
        return true;
      if (
        typeof p.category === "string" &&
        p.category.toLowerCase().includes(cat.toLowerCase())
      )
        return true;
      if (
        typeof p.mainCategory === "string" &&
        p.mainCategory.toLowerCase().includes(cat.toLowerCase())
      )
        return true;
      return false;
    }).length;
  }, [allProducts]);

  const filteredProducts = getFilteredProducts();
  const searchResults = searchQuery ? filteredProducts : [];

  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} style={{ color: "#ffc107" }} size={14} />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <FaStarHalf key={i} style={{ color: "#ffc107" }} size={14} />
            );
          } else {
            return <FaRegStar key={i} style={{ color: "#ffc107" }} size={14} />;
          }
        })}
        <small className="text-muted ms-1">
          ({Math.floor(Math.random() * 50) + 10})
        </small>
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-TN" : "en-TN", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 2,
    })
      .format(price)
      .replace("TND", language === "fr" ? "DT" : "TND");
  };

  const truncateText = (text, maxLength = 25) => {
    const str = typeof text === "string" ? text : text ? String(text) : "";
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  const handleLocationClick = () => {
    window.open(
      "https://www.google.com/maps/place/Univertechno/@35.6724336,10.1037157,17z/data=!3m1!4b1!4m6!3m5!1s0x12fdc50cb1c7e3d5:0xfd3f37fd908fff33!8m2!3d35.6724336!4d10.1037157!16s%2Fg%2F11tsd7jgzb?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D",
      "_blank"
    );
  };

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="home-page">
      {/* Cart notification toast */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            zIndex: 9999,
            animation: "slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            className="alert"
            style={{
              background: "linear-gradient(145deg, #4361ee, #3a0ca3)",
              color: "white",
              border: "none",
              borderRadius: "16px",
              padding: "14px 24px",
              boxShadow: "0 10px 40px rgba(67, 97, 238, 0.4)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaCheckCircle size={16} />
            {notification}
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary rounded-circle position-fixed"
          style={{
            bottom: "30px",
            right: "30px",
            width: "50px",
            height: "50px",
            zIndex: 1050,
            boxShadow: "0 4px 20px rgba(67, 97, 238, 0.4)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaArrowRight style={{ transform: "rotate(-90deg)" }} />
        </button>
      )}

      {/* Header */}
      <header
        className="py-2 sticky-top"
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.03)",
          borderBottom: "1px solid rgba(67, 97, 238, 0.1)",
          zIndex: 1030,
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            {/* Logo à GAUCHE */}
            <div className="d-flex align-items-center flex-shrink-0">
              <div
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  background: "linear-gradient(145deg, #4361ee, #3a0ca3)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "22px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 8px 20px rgba(67, 97, 238, 0.3)",
                }}
                onClick={scrollToTop}
              >
                <FaStore />
              </div>
              <h1
                className="fw-bold mb-0"
                style={{
                  fontSize: "clamp(1.1rem, 4vw, 1.4rem)",
                  background: "linear-gradient(145deg, #1e293b, #0f172a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  cursor: "pointer",
                  letterSpacing: "-0.5px",
                }}
                onClick={scrollToTop}
              >
                UniVer
                <span
                  style={{ color: "#4361ee", WebkitTextFillColor: "#4361ee" }}
                >
                  Techno
                </span>
                +
              </h1>
            </div>

            {/* BARRE DE RECHERCHE - desktop uniquement */}
            <div
              className="flex-grow-1 mx-3 d-none d-lg-block"
              style={{ maxWidth: "400px" }}
              ref={searchRef}
            >
              <div className="position-relative">
                <input
  ref={searchInputRef}
  type="text"
  className="form-control rounded-pill"
  placeholder={t.searchPlaceholder}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onFocus={(e) => {
    // Appeler la fonction handleSearchFocus
    handleSearchFocus();
    // Appliquer les styles
    e.currentTarget.style.borderColor = "#4361ee";
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(67, 97, 238, 0.1)";
  }}
  onBlur={(e) => {
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setShowSearchResults(false);
      }
    }, 200);
  }}
  style={{
    paddingLeft: "40px",
    paddingRight: "80px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: "0.9rem",
    height: "42px",
    transition: "all 0.3s ease",
  }}
/>
                <FaSearch
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "16px",
                    pointerEvents: "none",
                  }}
                />
                {searchQuery && (
                  <button
                    className="btn btn-sm position-absolute"
                    onClick={clearSearch}
                    style={{
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      padding: "0",
                      fontSize: "12px",
                    }}
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>

              {/* Résultats de recherche dropdown */}
              {showSearchResults && searchQuery && (
                <div
                  className="position-absolute bg-white rounded-4 shadow-lg mt-2"
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 1050,
                    left: 0,
                  }}
                >
                  {searchResults.length > 0 ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <span
                          className="fw-semibold small"
                          style={{ color: "#0f172a" }}
                        >
                          {searchResults.length} {t.results}
                        </span>
                        <button
                          className="btn btn-sm p-0"
                          onClick={clearSearch}
                          style={{ color: "#4361ee", fontSize: "12px" }}
                        >
                          {t.close}
                        </button>
                      </div>
                      {searchResults.slice(0, 5).map((product, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-3 p-3 border-bottom"
                          style={{
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => handleProductClick(product)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <div
                            style={{
                              width: "45px",
                              height: "45px",
                              backgroundColor: "#f8fafc",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {getProductImage(product) &&
                            !imageErrors[product.title] ? (
                              <img
                                src={getProductImage(product)}
                                alt={product.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={() => handleImageError(product.title)}
                              />
                            ) : (
                              <FaCube
                                style={{ color: "#94a3b8", fontSize: "18px" }}
                              />
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <h6
                              className="fw-semibold mb-1"
                              style={{ color: "#0f172a", fontSize: "0.85rem" }}
                            >
                              {truncateText(product.title, 35)}
                            </h6>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="fw-bold"
                                style={{ color: "#4361ee", fontSize: "0.8rem" }}
                              >
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-muted small">{t.ttc}</span>
                            </div>
                          </div>
                          <FaChevronRight
                            style={{ color: "#cbd5e1", fontSize: "10px", flexShrink: 0 }}
                          />
                        </div>
                      ))}

                      {searchResults.length > 5 && (
                        <div className="text-center p-3">
                          <button
                            className="btn btn-sm w-100 rounded-pill"
                            onClick={() => {
                              document
                                .getElementById("products")
                                ?.scrollIntoView({ behavior: "smooth" });
                              clearSearch();
                            }}
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#4361ee",
                              fontWeight: "500",
                              fontSize: "12px",
                            }}
                          >
                            + {searchResults.length - 5} {t.moreResults}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <FaSearch
                        style={{ color: "#cbd5e1", fontSize: "30px", marginBottom: "8px" }}
                      />
                      <p className="text-muted small mb-0">{t.noResults}</p>
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        "{searchQuery}"
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation au CENTRE (sur desktop) */}
            <div className="d-none d-lg-block">
              <ul className="nav gap-1">
                {[
                  { name: t.home, href: "#home" },
                  { name: t.expertise, href: "#services" },
                  { name: t.products, href: "#products" },
                  { name: t.contactNav, href: "/contact" },
                ].map((item, index) => (
                  <li className="nav-item" key={index}>
                    {item.href.startsWith("/") ? (
                      <Link
                        className="nav-link fw-medium px-3 py-2 rounded-pill"
                        to={item.href}
                        style={{
                          color: "#334155",
                          transition: "all 0.3s ease",
                          fontSize: "0.9rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(67, 97, 238, 0.05)";
                          e.currentTarget.style.color = "#4361ee";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#334155";
                        }}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a
                        className="nav-link fw-medium px-3 py-2 rounded-pill"
                        href={item.href}
                        style={{
                          color: "#334155",
                          transition: "all 0.3s ease",
                          fontSize: "0.9rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(67, 97, 238, 0.05)";
                          e.currentTarget.style.color = "#4361ee";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#334155";
                        }}
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions à DROITE */}
            <div className="d-flex align-items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="btn d-flex align-items-center gap-1 rounded-pill px-3 py-2"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  transition: "all 0.3s ease",
                }}
              >
                <FaGlobe style={{ color: "#4361ee", fontSize: "14px" }} />
                <span className="fw-medium" style={{ fontSize: "13px" }}>
                  {language === "fr" ? "FR" : "EN"}
                </span>
              </button>

              {/* Icône User */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#f8fafc",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                }}
                onClick={handleLoginClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#eef2ff";
                  e.currentTarget.style.borderColor = "#4361ee";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <FaUser style={{ color: "#4361ee", fontSize: "16px" }} />
              </div>

              {/* Icône Panier */}
              <div className="position-relative">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#f8fafc",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: "1px solid transparent",
                  }}
                  onClick={() => navigate("/cart")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#eef2ff";
                    e.currentTarget.style.borderColor = "#4361ee";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <FaShoppingCart style={{ color: "#4361ee", fontSize: "16px" }} />
                </div>
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{
                    backgroundColor: "#f72585",
                    fontSize: "10px",
                    padding: "3px 5px",
                    border: "2px solid white",
                    fontWeight: "600",
                  }}
                >
                  {getCartCount()}
                </span>
              </div>

              {/* Menu mobile button */}
              <button
                className="btn d-lg-none p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  color: "#4361ee",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: "50%",
                }}
              >
                {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div className="d-lg-none mt-3 pb-2" style={{ animation: "slideDown 0.3s ease" }}>
              {/* Barre de recherche dans le menu mobile */}
              <div className="position-relative mb-3">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: "40px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    fontSize: "0.9rem",
                    height: "45px",
                  }}
                />
                <FaSearch
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "16px",
                  }}
                />
                {searchQuery && (
                  <button
                    className="btn btn-sm position-absolute"
                    onClick={() => setSearchQuery("")}
                    style={{
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#94a3b8",
                    }}
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>

              {/* Résultats recherche mobile */}
              {searchQuery && (
                <div
                  className="bg-white rounded-4 shadow-lg mb-3"
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 5).map((product, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center gap-3 p-3 border-bottom"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          handleProductClick(product);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaCube style={{ color: "#94a3b8" }} />
                        </div>
                        <div>
                          <div className="fw-semibold small">
                            {truncateText(product.title, 30)}
                          </div>
                          <div
                            className="fw-bold small"
                            style={{ color: "#4361ee" }}
                          >
                            {formatPrice(product.price)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-muted small mb-0">{t.noResults}</p>
                    </div>
                  )}
                </div>
              )}

              <ul className="nav flex-column">
                {[
                  { name: t.home, href: "#home" },
                  { name: t.expertise, href: "#services" },
                  { name: t.products, href: "#products" },
                  { name: t.contactNav, href: "/contact" },
                ].map((item, index) => (
                  <li className="nav-item" key={index}>
                    {item.href.startsWith("/") ? (
                      <Link
                        className="nav-link py-3"
                        to={item.href}
                        style={{ color: "#334155", borderBottom: "1px solid #e2e8f0" }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a
                        className="nav-link py-3"
                        href={item.href}
                        style={{ color: "#334155", borderBottom: "1px solid #e2e8f0" }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="position-relative overflow-hidden d-flex align-items-center"
        style={{
          minHeight: "70vh",
          background:
            "linear-gradient(145deg, #0b1120 0%, #1a237e 50%, #283593 100%)",
        }}
      >
        <div
          className="position-absolute w-100 h-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(67, 97, 238, 0.15) 0%, transparent 50%)",
            animation: "pulse 8s infinite",
          }}
        ></div>
        <div
          className="position-absolute w-100 h-100"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, rgba(247, 37, 133, 0.1) 0%, transparent 50%)",
            animation: "pulse 12s infinite reverse",
          }}
        ></div>

        <div className="container h-100 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center justify-content-center min-vh-100 py-5">
            <div
              className="col-lg-8 text-center"
              style={{ animation: "fadeInUp 1s ease" }}
            >
              <div className="d-flex align-items-center justify-content-center gap-4 mb-4">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "linear-gradient(145deg, #4361ee, #3a0ca3)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 20px 40px rgba(67, 97, 238, 0.4)",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  <svg
                    width="45"
                    height="45"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9H21L19 20H5L3 9Z"
                      stroke="white"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M7 9L9 3H15L17 9"
                      stroke="white"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="8" cy="13" r="1.5" fill="white" />
                    <circle cx="16" cy="13" r="1.5" fill="white" />
                    <path
                      d="M7 17H17"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 9V17"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18 6C19.5 6 20 7 20 8C20 9 19 9 18 9"
                      stroke="white"
                      strokeWidth="1"
                      fill="none"
                    />
                    <circle cx="19" cy="6" r="1" fill="white" />
                  </svg>
                </div>

                <h1
                  className="fw-bold mb-0"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    lineHeight: "1.1",
                    letterSpacing: "-1px",
                    textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  UniVer
                  <span
                    style={{
                      background:
                        "linear-gradient(120deg, #64b5f6, #c084fc, #f72585)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundSize: "200% auto",
                      animation: "gradient 3s linear infinite",
                      display: "inline-block",
                    }}
                  >
                    Techno
                  </span>
                  +
                </h1>
              </div>

              <p
                className="mb-4 mx-auto"
                style={{
                  fontSize: "1.1rem",
                  color: "rgba(255,255,255,0.8)",
                  maxWidth: "650px",
                  lineHeight: "1.6",
                }}
              >
                {t.heroDescription}
              </p>

              <div className="d-flex flex-wrap gap-3 mb-5 justify-content-center">
                <button
                  className="btn btn-lg px-5 py-3 rounded-pill"
                  onClick={handleContactClick}
                  style={{
                    background: "linear-gradient(120deg, #4361ee, #3a0ca3)",
                    border: "none",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "1rem",
                    boxShadow: "0 20px 40px rgba(67, 97, 238, 0.4)",
                    transition:
                      "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-3px) scale(1.03)";
                    e.currentTarget.style.boxShadow =
                      "0 30px 50px rgba(67, 97, 238, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(67, 97, 238, 0.4)";
                  }}
                >
                  {t.contactUs}
                </button>

                <button
                  className="btn btn-lg px-5 py-3 rounded-pill"
                  onClick={handleLocationClick}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "1rem",
                    transition:
                      "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.transform =
                      "translateY(-3px) scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                  }}
                >
                  <FaMapMarkedAlt className="me-2" style={{ fontSize: "14px" }} />
                  {t.location}
                </button>
              </div>

              <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
                {[
                  {
                    icon: <FaShieldAlt />,
                    label: language === "fr" ? "Certifié ISO" : "ISO Certified",
                  },
                  {
                    icon: <FaAward />,
                    label:
                      language === "fr" ? "15+ ans expertise" : "15+ years expertise",
                  },
                  {
                    icon: <FaHeadset />,
                    label: language === "fr" ? "Support 24/7" : "24/7 Support",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center gap-2"
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}
                  >
                    <span style={{ color: "#4361ee", fontSize: "14px" }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secteurs d'expertise */}
      <section
        id="services"
        className="py-6"
        style={{
          background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <span
              className="badge px-4 py-2 rounded-pill mb-3"
              style={{
                background: "linear-gradient(145deg, #4361ee20, #3a0ca320)",
                color: "#4361ee",
                fontWeight: "600",
              }}
            >
              {t.expertiseBadge}
            </span>
            <h2 className="display-4 fw-bold mb-3" style={{ color: "#0f172a" }}>
              {t.expertiseTitle}
            </h2>
            <p
              className="text-muted"
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "1.1rem",
              }}
            >
              {t.expertiseDescription}
            </p>
          </div>

          <div className="row g-4">
            {expertiseSectors.map((sector, index) => (
              <div key={index} className="col-lg-4">
                <div
                  className="card h-100 border-0 rounded-4 overflow-hidden"
                  style={{
                    background: "white",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.02)",
                    transition:
                      "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    cursor: "pointer",
                    border: "1px solid rgba(67, 97, 238, 0.1)",
                  }}
                  onClick={() => handleSectorClick(sector)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow =
                      "0 40px 80px rgba(67, 97, 238, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(0,0,0,0.02)";
                  }}
                >
                  <div
                    style={{
                      height: "6px",
                      background: sector.gradient,
                      width: "100%",
                    }}
                  ></div>

                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          background: `${sector.color}15`,
                          borderRadius: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: sector.color,
                          fontSize: "30px",
                        }}
                      >
                        {sector.icon}
                      </div>
                      <div>
                        <h4 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
                          {language === "fr"
                            ? sector.displayNameFr
                            : sector.displayNameEn}
                        </h4>
                        <div className="d-flex gap-3">
                          <small style={{ color: "#64748b" }}>
                            <FaChartLine className="me-1" />
                            {sector.stats.projects} {t.projects}
                          </small>
                          <small style={{ color: "#64748b" }}>
                            <FaHeadset className="me-1" />
                            {sector.stats.clients} {t.clients}
                          </small>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
                      {language === "fr"
                        ? sector.descriptionFr
                        : sector.descriptionEn}
                    </p>

                    <div className="mb-4">
                      {(language === "fr"
                        ? sector.featuresFr
                        : sector.featuresEn
                      ).map((feature, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                          <FaCheckCircle
                            style={{ color: sector.color, fontSize: "14px" }}
                          />
                          <small style={{ color: "#334155" }}>{feature}</small>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-medium" style={{ color: sector.color }}>
                        {t.exploreSector}
                      </span>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          background: `${sector.color}15`,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: sector.color,
                          transition: "all 0.3s ease",
                        }}
                      >
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
      <section
        id="products"
        className="py-5"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <span
              className="badge px-4 py-2 rounded-pill mb-3"
              style={{
                background: "linear-gradient(145deg, #4361ee20, #3a0ca320)",
                color: "#4361ee",
                fontWeight: "600",
              }}
            >
              {t.catalogBadge}
            </span>
            <h2 className="display-4 fw-bold mb-3" style={{ color: "#0f172a" }}>
              {t.catalogTitle}
            </h2>
            <p
              className="text-muted"
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "1.1rem",
              }}
            >
              {t.catalogDescription}
            </p>
          </div>

          <div className="row g-4">
            {/* Colonne des filtres */}
            <div className="col-lg-3">
              <div className="sticky-top" style={{ top: "100px", zIndex: 1020 }}>
                <button
                  className="btn d-lg-none w-100 mb-3 rounded-pill"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  style={{
                    backgroundColor: "#4361ee",
                    color: "white",
                    border: "none",
                    padding: "12px",
                  }}
                >
                  {showMobileFilters
                    ? "Masquer les filtres"
                    : "Afficher les filtres"}
                </button>

                <div
                  className={`${showMobileFilters ? "d-block" : "d-none d-lg-block"}`}
                >
                  <div
                    className="card border-0 rounded-4 shadow-sm"
                    style={{
                      background: "white",
                      border: "1px solid rgba(67, 97, 238, 0.1)",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>
                          <FaCogs className="me-2" style={{ color: "#4361ee" }} />
                          {t.categories}
                        </h5>
                        <span
                          className="badge rounded-pill"
                          style={{ backgroundColor: "#eef2ff", color: "#4361ee" }}
                        >
                          {allProducts.length} {t.productsAvailable}
                        </span>
                      </div>

                      <div className="border-bottom mb-3"></div>

                      <div className="nav flex-column nav-pills gap-1">
                        {mainCategories.map((cat) => {
                          const count = getCategoryProductCount(cat);
                          return (
                            <button
                              key={cat}
                              onClick={() => handleCategoryFilter(cat)}
                              className={`nav-link text-start rounded-pill d-flex justify-content-between align-items-center ${
                                selectedCategory === cat ? "active" : ""
                              }`}
                              style={{
                                backgroundColor:
                                  selectedCategory === cat
                                    ? "#4361ee"
                                    : "transparent",
                                color:
                                  selectedCategory === cat ? "white" : "#334155",
                                transition: "all 0.3s ease",
                                padding: "10px 16px",
                              }}
                              onMouseEnter={(e) => {
                                if (selectedCategory !== cat) {
                                  e.currentTarget.style.backgroundColor =
                                    "#f1f5f9";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedCategory !== cat) {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }
                              }}
                            >
                              <span>
                                {cat === "All products" ? t.allProducts : cat}
                              </span>
                              <span
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor:
                                    selectedCategory === cat
                                      ? "rgba(255,255,255,0.2)"
                                      : "#eef2ff",
                                  color:
                                    selectedCategory === cat ? "white" : "#4361ee",
                                }}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne des produits */}
            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <p className="text-muted mb-0">
                    <span className="fw-bold" style={{ color: "#0f172a" }}>
                      {filteredProducts.length}
                    </span>{" "}
                    {t.productsAvailable}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <FaSearch className="text-muted" style={{ marginTop: "10px" }} />
                  <select
                    className="form-select rounded-pill"
                    style={{
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                      padding: "8px 30px 8px 16px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option>{t.sortBy}</option>
                    <option>{t.sortPriceAsc}</option>
                    <option>{t.sortPriceDesc}</option>
                    <option>{t.sortNewest}</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <FaSearch
                    style={{ color: "#cbd5e1", fontSize: "48px", marginBottom: "16px" }}
                  />
                  <h5 className="text-muted">{t.noProducts}</h5>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id || index} className="col-md-6 col-lg-4">
                      <div
                        className="card h-100 border-0 rounded-4 overflow-hidden"
                        style={{
                          background: "white",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                          transition:
                            "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          cursor: "pointer",
                          border: "1px solid rgba(67, 97, 238, 0.08)",
                        }}
                        onClick={() => handleProductClick(product)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow =
                            "0 20px 40px rgba(67, 97, 238, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 10px 30px rgba(0,0,0,0.05)";
                        }}
                      >
                        {index < 3 && (
                          <div
                            className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-pill"
                            style={{
                              background: "linear-gradient(120deg, #f72585, #b5179e)",
                              color: "white",
                              fontSize: "10px",
                              fontWeight: "bold",
                              zIndex: 10,
                            }}
                          >
                            {t.new}
                          </div>
                        )}

                        <div
                          className="d-flex align-items-center justify-content-center p-4"
                          style={{
                            height: "200px",
                            backgroundColor: "#f8fafc",
                            borderBottom: "1px solid rgba(67, 97, 238, 0.05)",
                          }}
                        >
                          {getProductImage(product) &&
                          !imageErrors[product.title] ? (
                            <img
                              src={getProductImage(product)}
                              alt={product.title}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                              }}
                              onError={() => handleImageError(product.title)}
                            />
                          ) : (
                            <FaCube
                              style={{ color: "#cbd5e1", fontSize: "48px" }}
                            />
                          )}
                        </div>

                        <div className="card-body p-4">
                          <div className="mb-2">
                            {renderStars(4 + Math.random() * 1)}
                          </div>

                          <h5
                            className="fw-bold mb-3"
                            style={{
                              color: "#0f172a",
                              fontSize: "1rem",
                              lineHeight: "1.4",
                              minHeight: "45px",
                            }}
                          >
                            {truncateText(product.title, 50)}
                          </h5>

                          <p
                            className="text-muted small mb-3"
                            style={{
                              minHeight: "40px",
                              fontSize: "0.8rem",
                            }}
                          >
                            {product.description
                              ? truncateText(product.description, 60)
                              : "Équipement professionnel de haute qualité"}
                          </p>

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                              <span
                                className="fw-bold"
                                style={{ color: "#4361ee", fontSize: "1.2rem" }}
                              >
                                {formatPrice(product.price)}
                              </span>
                              <small className="text-muted ms-1">{t.ttc}</small>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                onClick={(e) => handleView3D(e, product)}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  backgroundColor: "#eef2ff",
                                  border: "none",
                                  color: "#4361ee",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#4361ee";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#eef2ff";
                                  e.currentTarget.style.color = "#4361ee";
                                }}
                              >
                                <FaCube size={14} />
                              </button>

                              <button
                                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  backgroundColor: "#4361ee",
                                  border: "none",
                                  color: "white",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#3a0ca3";
                                  e.currentTarget.style.transform =
                                    "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#4361ee";
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              >
                                <FaShoppingCart size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ChatBot Component */}
      <ChatBot />

      {/* Section QR Code */}
      <section
        className="py-6"
        style={{ background: "linear-gradient(145deg, #0f172a, #1e293b)" }}
      >
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h3
                className="fw-bold text-white mb-4"
                style={{ fontSize: "1.8rem" }}
              >
                {language === "fr" ? "Nos coordonnées" : "Our contact"}
              </h3>
              <div className="d-flex flex-wrap justify-content-center gap-4">
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <FaMapMarkerAlt
                    style={{ color: "#4361ee", fontSize: "18px" }}
                  />
                  <span>123 Rue de l'Innovation, Tunis</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <FaPhone style={{ color: "#4361ee", fontSize: "18px" }} />
                  <span>+216 71 123 456</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <FaEnvelope style={{ color: "#4361ee", fontSize: "18px" }} />
                  <span>contact@univertechno.tn</span>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-4 text-center">
              <div className="d-inline-block p-4 rounded-4 bg-white shadow-lg">
                <QRCodeSVG
                  value="https://univertechno.netlify.app/home"
                  size={200}
                  fgColor="#4361ee"
                  bgColor="#ffffff"
                  level="H"
                  includeMargin={true}
                />
                <p className="mt-3 mb-1 fw-semibold" style={{ color: "#0f172a" }}>
                  {language === "fr"
                    ? "Scannez pour ouvrir le site"
                    : "Scan to open the site"}
                </p>
                <p className="small text-muted mb-0">univertechno.tn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(67, 97, 238, 0);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .text-white-50 {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 1.8rem !important;
          }

          .navbar {
            padding: 0.5rem 1rem;
          }

          .product-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;