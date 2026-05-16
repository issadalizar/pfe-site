import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaLeaf,
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
  const [language, setLanguage] = useState("fr"); // 'fr' for French, 'en' for English

  // ========== FONCTION POUR LA NAVIGATION 3D ==========
  const handleView3D = (e, product) => {
    e.stopPropagation(); // Empêcher la propagation au clic sur la carte
    navigate(`/product3d/${encodeURIComponent(product.title)}`);
  };
  // ====================================================

  // Translations
  const translations = {
    fr: {
      // Navigation
      home: "Accueil",
      products: "Produits",
      expertise: "Expertise",
      contactNav: "Contact",
      searchPlaceholder: "Rechercher un produit...",

      // Hero Section
      innovationBadge: "INNOVATION TECHNOLOGIQUE",
      heroTitle1: "Façonnez l'avenir avec",
      heroTitle2: "l'excellence",
      heroTitle3: "technologique",
      heroDescription:
        "Équipements de pointe pour l'éducation et l'industrie. Solutions sur-mesure, support expert et innovation continue.",
      contactUs: "Contactez-nous",
      location: "Localisation",

      // Expertise Section
      expertiseBadge: "NOTRE EXPERTISE",
      expertiseTitle: "Solutions par secteur",
      expertiseDescription:
        "Des solutions complètes et adaptées à chaque domaine d'application",
      projects: "projets",
      clients: "clients",
      exploreSector: "Explorer le secteur",

      // Products Section
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

      // Testimonials Section
      testimonialsBadge: "TÉMOIGNAGES",
      testimonialsTitle: "Ce qu'ils disent de nous",
      testimonialsDescription:
        "La confiance de nos partenaires, notre plus grande fierté",

      // Newsletter Section
      newsletterTitle: "Restez informé des dernières innovations",
      newsletterDescription:
        "Recevez nos actualités, offres exclusives et nouveautés produits",
      newsletterPlaceholder: "Votre adresse email",
      newsletterButton: "S'inscrire",

      // Footer
      footerDescription:
        "Leader dans la fourniture d'équipements technologiques pour l'éducation et l'industrie.",
      quickLinks: "Liens rapides",
      contact: "Contact",
      allRightsReserved: "Tous droits réservés.",

      // Sector names
      cncEducation: "CNC for Education",
      automotive: "Automotive",
      electronicsLab: "Electronics Lab",

      // Category names
      cncTurning: "CNC Turing Machine",
      cncMilling: "CNC Milling Machine",
      sensors: "CAPTEURS ET ACTIONNEURS",
      electricity: "ÉLECTRICITÉ",
      multiplex: "RÉSEAUX MULTIPLEXÉS",
      accessories: "Accessoires",
      education: "EDUCATION EQUIPMENT",

      // Product related
      ttc: "TTC",

      // Messages
      newsletterSuccess: "Merci de votre inscription à notre newsletter !",
    },
    en: {
      // Navigation
      home: "Home",
      products: "Products",
      expertise: "Expertise",
      contactNav: "Contact",
      searchPlaceholder: "Search for a product...",

      // Hero Section
      innovationBadge: "TECHNOLOGICAL INNOVATION",
      heroTitle1: "Shape the future with",
      heroTitle2: "technological",
      heroTitle3: "excellence",
      heroDescription:
        "Cutting-edge equipment for education and industry. Custom solutions, expert support, and continuous innovation.",
      contactUs: "Contact Us",
      location: "Location",

      // Expertise Section
      expertiseBadge: "OUR EXPERTISE",
      expertiseTitle: "Solutions by sector",
      expertiseDescription:
        "Complete solutions adapted to each application domain",
      projects: "projects",
      clients: "clients",
      exploreSector: "Explore sector",

      // Products Section
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

      // Testimonials Section
      testimonialsBadge: "TESTIMONIALS",
      testimonialsTitle: "What they say about us",
      testimonialsDescription: "The trust of our partners, our greatest pride",

      // Newsletter Section
      newsletterTitle: "Stay informed about the latest innovations",
      newsletterDescription:
        "Receive our news, exclusive offers, and new products",
      newsletterPlaceholder: "Your email address",
      newsletterButton: "Subscribe",

      // Footer
      footerDescription:
        "Leader in providing technological equipment for education and industry.",
      quickLinks: "Quick links",
      contact: "Contact",
      allRightsReserved: "All rights reserved.",

      // Sector names
      cncEducation: "CNC for Education",
      automotive: "Automotive",
      electronicsLab: "Electronics Lab",

      // Category names
      cncTurning: "CNC Turing Machine",
      cncMilling: "CNC Milling Machine",
      sensors: "SENSORS AND ACTUATORS",
      electricity: "ELECTRICITY",
      multiplex: "MULTIPLEXED NETWORKS",
      accessories: "Accessories",
      education: "EDUCATION EQUIPMENT",

      // Product related
      ttc: "incl. tax",

      // Messages
      newsletterSuccess: "Thank you for subscribing to our newsletter!",
    },
  };

  const t = translations[language];

  // Catégories principales pour le filtrage du catalogue
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

  // Secteurs d'expertise enrichis
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

  // Témoignages clients
  const testimonials = [
    {
      id: 1,
      name: "Dr. Ahmed Ben Mahmoud",
      positionFr: "Directeur, Institut Supérieur des Études Technologiques",
      positionEn: "Director, Higher Institute of Technological Studies",
      contentFr:
        "UniverTechno+ a équipé nos laboratoires avec des machines CNC de dernière génération. La qualité des équipements et le support technique sont exceptionnels.",
      contentEn:
        "UniverTechno+ equipped our laboratories with state-of-the-art CNC machines. The quality of the equipment and technical support are exceptional.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Sarra Khelifi",
      positionFr: "Responsable R&D, Tunisie Automotive",
      positionEn: "R&D Manager, Tunisia Automotive",
      contentFr:
        "Les solutions de diagnostic automobile nous ont permis d'optimiser nos processus de contrôle qualité. Un partenaire fiable et innovant.",
      contentEn:
        "The automotive diagnostic solutions allowed us to optimize our quality control processes. A reliable and innovative partner.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Mohamed Ali Bouaziz",
      positionFr: "Chef de projet, ENIT",
      positionEn: "Project Manager, ENIT",
      contentFr:
        "La plateforme de simulation électronique a révolutionné notre façon d'enseigner. Les étudiants peuvent maintenant expérimenter en toute sécurité.",
      contentEn:
        "The electronic simulation platform revolutionized our teaching methods. Students can now experiment safely.",
      rating: 4.5,
      image: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ];

  // Statistiques clés
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

    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fonction pour charger toutes les catégories et afficher leurs IDs (pour debug)
  const loadAllCategoriesForDebug = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || response.data || [];
      console.log("📋 Toutes les catégories disponibles:");
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
        mainCategories.length > 0 ? mainCategories : cats.slice(0, 8),
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
    setNewsletterEmail("");
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

  const getFilteredProducts = (
    category = selectedCategory,
    query = searchQuery,
  ) => {
    let filtered = [...allProducts];

    if (selectedCategory && selectedCategory !== "All products") {
      filtered = filtered.filter(
        (p) =>
          p.mainCategory === selectedCategory ||
          p.category === selectedCategory ||
          p.category?.includes(selectedCategory) ||
          p.mainCategory?.includes(selectedCategory),
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  const getCategoryProductCount = (cat) => {
    return allProducts.filter(
      (p) =>
        p.mainCategory === cat ||
        p.category === cat ||
        p.category?.includes(cat) ||
        p.mainCategory?.includes(cat),
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
      "_blank",
    );
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
    <div className="d-flex align-items-center justify-content-between">
      
      {/* Logo à GAUCHE */}
      <div className="d-flex align-items-center">
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
            fontSize: "1.4rem",
            background: "linear-gradient(145deg, #1e293b, #0f172a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            cursor: "pointer",
            letterSpacing: "-0.5px",
          }}
          onClick={scrollToTop}
        >
          UniVer
          <span style={{ color: "#4361ee", WebkitTextFillColor: "#4361ee" }}>
            Techno
          </span>
          +
        </h1>
      </div>

      {/* Navigation au CENTRE */}
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
                  className="nav-link fw-medium px-4 py-2 rounded-pill"
                  to={item.href}
                  style={{
                    color: "#334155",
                    transition: "all 0.3s ease",
                    fontSize: "0.95rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(67, 97, 238, 0.05)";
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
                  className="nav-link fw-medium px-4 py-2 rounded-pill"
                  href={item.href}
                  style={{
                    color: "#334155",
                    transition: "all 0.3s ease",
                    fontSize: "0.95rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(67, 97, 238, 0.05)";
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

    {/* Menu mobile - garder le même */}
    {mobileMenuOpen && (
      <div className="d-lg-none mt-3 pb-2" style={{ animation: "slideDown 0.3s ease" }}>
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

        <div
          className="container h-100 position-relative"
          style={{ zIndex: 2 }}
        >
          <div className="row align-items-center justify-content-center min-vh-100 py-5">
            {/* Centered content - sans la partie droite */}
            <div
              className="col-lg-8 text-center"
              style={{ animation: "fadeInUp 1s ease" }}
            >
              {/* Logo et icône IA côte à côte */}
              <div className="d-flex align-items-center justify-content-center gap-4 mb-4">
                {/* Icône IA / E-commerce */}
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

              {/* Description */}
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

              {/* Boutons */}
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
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 30px 50px rgba(67, 97, 238, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(67, 97, 238, 0.4)";
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
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
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

              {/* Trust indicators */}
              <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap">
                {[
                  { icon: <FaShieldAlt />, label: language === "fr" ? "Certifié ISO" : "ISO Certified" },
                  { icon: <FaAward />, label: language === "fr" ? "15+ ans expertise" : "15+ years expertise" },
                  { icon: <FaHeadset />, label: language === "fr" ? "Support 24/7" : "24/7 Support" },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-2" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                    <span style={{ color: "#4361ee", fontSize: "14px" }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Secteurs d'expertise - DÉPLACÉ ICI (avant les produits) */}
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
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                        <h4
                          className="fw-bold mb-1"
                          style={{ color: "#0f172a" }}
                        >
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

                    <p
                      className="text-muted mb-4"
                      style={{ lineHeight: "1.6" }}
                    >
                      {language === "fr"
                        ? sector.descriptionFr
                        : sector.descriptionEn}
                    </p>

                    <div className="mb-4">
                      {(language === "fr"
                        ? sector.featuresFr
                        : sector.featuresEn
                      ).map((feature, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-2 mb-2"
                        >
                          <FaCheckCircle
                            style={{ color: sector.color, fontSize: "14px" }}
                          />
                          <small style={{ color: "#334155" }}>{feature}</small>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="fw-medium"
                        style={{ color: sector.color }}
                      >
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

     {/* Catalogue produits - SECTION AVEC ID products POUR LE SCROLL */}
<section id="products">
  <ProductData
    t={t}
    mainCategories={mainCategories}
    allProducts={allProducts}
    filteredProducts={filteredProducts}
    selectedCategory={selectedCategory}
    handleCategoryFilter={handleCategoryFilter}
    handleProductClick={handleProductClick}
    handleView3D={handleView3D}
    getCategoryProductCount={getCategoryProductCount}
    formatPrice={formatPrice}
    truncateText={truncateText}
    renderStars={renderStars}
    addToCart={addToCart}
    language={language}
  />
</section>

      

      {/* ChatBot Component */}
      <ChatBot />
           {/* Section QR Code - Télécharger l'app */}
      <section className="py-6" style={{ background: "linear-gradient(145deg, #0f172a, #1e293b)" }}>
        <div className="container">
          {/* Coordonnées de l'entreprise - Au dessus du QR code */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h3 className="fw-bold text-white mb-4" style={{ fontSize: "1.8rem" }}>
                {language === "fr" ? "Nos coordonnées" : "Our contact"}
              </h3>
              <div className="d-flex flex-wrap justify-content-center gap-4">
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <FaMapMarkerAlt style={{ color: "#4361ee", fontSize: "18px" }} />
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

          {/* QR Code centré uniquement - sans texte à gauche */}
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
                  {language === "fr" ? "Scannez pour ouvrir le site" : "Scan to open the site"}
                </p>
                <p className="small text-muted mb-0">
                  univertechno.tn
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styles additionnels */}
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

        .text-white-50 {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        /* Animation pour le bouton 3D */
        .card:hover .btn-3d-float {
          opacity: 1 !important;
          transform: translateY(0) !important;
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
          /* Viewport mobile */
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

  /* Cacher éléments lourds sur mobile */
  .desktop-only {
    display: none !important;
  }
}
      `}</style>
    </div>
  );
};

export default Home;