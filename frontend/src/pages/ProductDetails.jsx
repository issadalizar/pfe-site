// ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaStar, 
  FaCheck, 
  FaCog, 
  FaCube, 
  FaRuler, 
  FaTachometerAlt, 
  FaWrench,
  FaIndustry,
  FaShieldAlt,
  FaMicrochip,
  FaBox,
  FaDownload,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaUser,
  FaFilePdf,
  FaImage,
  FaEye,
  FaChartBar
} from 'react-icons/fa';
import { getProductDetails } from './productData';

const ProductDetails = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [useFallbackImages, setUseFallbackImages] = useState({});
  
  // Formulaire de devis
  const [quoteForm, setQuoteForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    message: '',
    productTitle: ''
  });

  // Décoder le nom du produit depuis l'URL
  const decodedProductName = decodeURIComponent(productName);
  
  // Récupérer les détails du produit
  const productDetails = getProductDetails(decodedProductName);
  
  // Fonction pour corriger le chemin d'image
  const fixImagePath = (originalPath) => {
    if (!originalPath) return '';
    
    // Si c'est déjà une image valide ou qu'on a déjà essayé de la corriger
    if (useFallbackImages[originalPath]) {
      return useFallbackImages[originalPath];
    }
    
    let correctedPath = originalPath;
    
    // CORRECTION 1: Remplacer "CNC Turing Machine" par "CNC Turning Machine" (orthographe correcte)
    if (correctedPath.includes('CNC Turing Machine')) {
      correctedPath = correctedPath.replace(/CNC Turing Machine/g, 'CNC Turning Machine');
    }
    
    // CORRECTION 2: Remplacer "CNC Turning Machine" par "CNC Turning" (si le dossier s'appelle différemment)
    if (correctedPath.includes('CNC Turning Machine')) {
      correctedPath = correctedPath.replace(/CNC Turning Machine/g, 'CNC Turning');
    }
    
    // CORRECTION 3: Normaliser les noms de fichiers pour les produits CNC
    const cncProducts = {
      'De2-Ultra Mini CNC Turning Center': 'De2-Ultra Mini CNC Turning Center',
      'PC1 Baby CNC Lathe-Mach': 'PC1 Baby CNC Lathe-Mach',
      'De4-Eco (KC4S) Bench CNC Lathe': 'De4-Eco (KC4S) Bench CNC Lathe',
      'De6 (iKC6S) CNC Turning Machine': 'De6 (iKC6S) CNC Turning Machine',
      'De4-Pro (iKC4) Bench CNC Lathe': 'De4-Pro (iKC4) Bench CNC Lathe',
      'De8 (iKC8) CNC Turning Machine': 'De8 (iKC8) CNC Turning Machine',
      'Fa2-Ultra Mini CNC Milling Center': 'Fa2-Ultra Mini CNC Milling Center',
      'PX1 Baby CNC Milling Machine': 'PX1 Baby CNC Milling Machine',
      'Fa4-Eco (KX1S) CNC Milling Machine': 'Fa4-Eco (KX1S) CNC Milling Machine'
    };
    
    // Pour les produits CNC, extraire le nom du fichier du chemin
    for (const [productKey, fileName] of Object.entries(cncProducts)) {
      if (originalPath.includes(fileName)) {
        // Essayer différentes extensions et formats
        const baseName = fileName;
        const possiblePaths = [
          `/images/products/CNC EDUCATION/CNC Turning/${baseName}.png`,
          `/images/products/CNC EDUCATION/CNC Turning/${baseName}.jpg`,
          `/images/products/CNC EDUCATION/CNC Turning Machine/${baseName}.png`,
          `/images/products/CNC EDUCATION/CNC Turing Machine/${baseName}.png`,
          `/images/products/CNC EDUCATION/CNC Milling Machine/${baseName}.png`,
        ];
        
        // Pour les images avec suffixes (-2, -3, etc.)
        if (originalPath.includes('-2') || originalPath.includes('-3') || originalPath.includes('.jpg')) {
          const match = originalPath.match(/(.+)(-\d+)?\.(png|jpg)/);
          if (match) {
            const mainName = match[1];
            const suffix = match[2] || '';
            const ext = match[3];
            
            return `/images/products/CNC EDUCATION/CNC Turning/${mainName}${suffix}.${ext}`;
          }
        }
        
        // Retourner le premier chemin possible pour ce produit
        return possiblePaths[0];
      }
    }
    
    // CORRECTION 4: Pour les produits Voitures avec des placeholders (produit1.png, produit2.png)
    if (originalPath.includes('produit1.png') || originalPath.includes('produit2.png')) {
      // Extraire le nom du produit du chemin ou utiliser le titre
      const productTitle = productDetails?.title || '';
      
      // Créer un nom de fichier à partir du titre du produit
      const fileName = productTitle
        .replace(/[^\w\s-]/g, '') // Enlever les caractères spéciaux
        .replace(/\s+/g, ' ') // Normaliser les espaces
        .trim()
        .replace(/\s+/g, '-'); // Remplacer espaces par tirets
      
      return `/images/products/voitures/${fileName}.png`;
    }
    
    // CORRECTION 5: Pour les produits MCP lab electronics
    if (originalPath.includes('MCP lab electronics')) {
      // Extraire la référence du produit (ex: PTL908-2H)
      const refMatch = productDetails?.title?.match(/([A-Z]{2,4}\d{3,4}-[A-Z0-9]+)/);
      if (refMatch) {
        const reference = refMatch[0];
        const category = originalPath.includes('Accessoires') ? 'Accessoires' : 'EDUCATION EQUIPMENT';
        return `/images/products/MCP lab electronics/${category}/${reference}.png`;
      }
    }
    
    return correctedPath;
  };

  // Fonction pour obtenir une image de remplacement
  const getFallbackImage = (originalPath) => {
    // Si on a déjà un fallback pour ce chemin, l'utiliser
    if (useFallbackImages[originalPath]) {
      return useFallbackImages[originalPath];
    }
    
    // Essayer de corriger le chemin
    const correctedPath = fixImagePath(originalPath);
    
    // Stocker le chemin corrigé pour les futures tentatives
    if (correctedPath !== originalPath) {
      setUseFallbackImages(prev => ({
        ...prev,
        [originalPath]: correctedPath
      }));
      return correctedPath;
    }
    
    return originalPath;
  };

  // Fonction pour gérer les erreurs de chargement d'images
  const handleImageError = (imagePath) => {
    console.log(`Erreur de chargement: ${imagePath}`);
    
    // Marquer cette image comme en erreur
    setImageErrors(prev => ({
      ...prev,
      [imagePath]: true
    }));
    
    // Si on n'a pas encore essayé de fallback pour cette image
    if (!useFallbackImages[imagePath]) {
      const fallbackPath = getFallbackImage(imagePath);
      
      // Si on a trouvé un chemin de fallback différent
      if (fallbackPath !== imagePath) {
        console.log(`Tentative avec chemin corrigé: ${fallbackPath}`);
        
        // Utiliser le chemin corrigé pour cette image
        setUseFallbackImages(prev => ({
          ...prev,
          [imagePath]: fallbackPath
        }));
        
        // Réinitialiser l'erreur pour ce chemin
        setImageErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[imagePath];
          return newErrors;
        });
        
        // Si c'est l'image sélectionnée, mettre à jour la sélection
        if (selectedImage === imagePath) {
          setSelectedImage(fallbackPath);
        }
      }
    }
  };

  // Vérifier si une image est valide
  const isValidImage = (imagePath) => {
    if (!imagePath) return false;
    
    // Vérifier si on a un fallback pour ce chemin
    const pathToCheck = useFallbackImages[imagePath] || imagePath;
    
    // Vérifier si ce chemin n'est pas en erreur
    return !imageErrors[pathToCheck] && !imageErrors[imagePath];
  };

  // Obtenir le chemin d'image à afficher
  const getImagePath = (originalPath) => {
    if (!originalPath) return '';
    
    // Si on a un fallback, l'utiliser
    if (useFallbackImages[originalPath]) {
      return useFallbackImages[originalPath];
    }
    
    return originalPath;
  };

  useEffect(() => {
    if (productDetails) {
      // Réinitialiser les erreurs d'images pour ce produit
      setImageErrors({});
      
      // Préparer les images avec corrections si nécessaire
      const processedImages = (productDetails.images || []).map(img => getImagePath(img));
      
      // Trouver la première image valide
      let firstValidImage = '';
      for (const img of processedImages) {
        if (!imageErrors[img]) {
          firstValidImage = img;
          break;
        }
      }
      
      setSelectedImage(firstValidImage || processedImages[0] || '');
      setLoading(false);
      
      // Pré-remplir le formulaire avec le titre du produit
      setQuoteForm(prev => ({
        ...prev,
        productTitle: productDetails.title
      }));
    } else {
      setLoading(false);
    }
  }, [productDetails]);

  // Fonction pour gérer l'ouverture du formulaire de devis
  const handleRequestQuote = () => {
    setShowQuoteForm(true);
    document.body.style.overflow = 'hidden';
  };

  // Fonction pour fermer le formulaire de devis
  const handleCloseQuoteForm = () => {
    setShowQuoteForm(false);
    document.body.style.overflow = 'auto';
  };

  // Fonctions pour la modale des spécifications
  const handleOpenSpecsModal = () => {
    setShowSpecsModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseSpecsModal = () => {
    setShowSpecsModal(false);
    document.body.style.overflow = 'auto';
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour soumettre la demande de devis
  const handleSubmitQuote = (e) => {
    e.preventDefault();
    
    console.log('Demande de devis envoyée:', quoteForm);
    
    setQuoteSubmitted(true);
    
    setTimeout(() => {
      setShowQuoteForm(false);
      setQuoteSubmitted(false);
      document.body.style.overflow = 'auto';
      setQuoteForm(prev => ({
        ...prev,
        company: '',
        name: '',
        email: '',
        phone: '',
        quantity: 1,
        message: ''
      }));
    }, 3000);
  };

  // Fonction pour générer un PDF (simulation)
  const handleGeneratePDF = () => {
    alert(`Génération du PDF pour ${productDetails.title}\n\nCette fonctionnalité sera bientôt disponible.`);
  };

  // Fonction pour obtenir l'icône selon le type de spécification
  const getSpecIcon = (specKey) => {
    if (specKey.includes('Moteur') || specKey.includes('broche') || specKey.includes('Vitesse')) 
      return <FaTachometerAlt className="text-primary me-2" />;
    if (specKey.includes('Vis') || specKey.includes('Guide') || specKey.includes('Rail') || specKey.includes('Course'))
      return <FaRuler className="text-success me-2" />;
    if (specKey.includes('Changeur') || specKey.includes('Magasin') || specKey.includes('Porte-outils'))
      return <FaWrench className="text-warning me-2" />;
    if (specKey.includes('Structure') || specKey.includes('Bâti') || specKey.includes('Banc'))
      return <FaIndustry className="text-secondary me-2" />;
    if (specKey.includes('Certification') || specKey.includes('Sécurité'))
      return <FaShieldAlt className="text-info me-2" />;
    if (specKey.includes('Système') || specKey.includes('Interface') || specKey.includes('Compatibilité'))
      return <FaMicrochip className="text-danger me-2" />;
    return <FaCog className="text-dark me-2" />;
  };

  const renderStars = (rating = 4.8) => {
    return (
      <div className="d-flex align-items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            size={18}
            color={i < Math.floor(rating) ? "#ffc107" : "#e4e5e9"}
          />
        ))}
        <span className="ms-2 text-dark fw-bold">{rating}/5</span>
        <span className="text-muted ms-2">(12 avis)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3">Chargement des détails du produit...</p>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>Produit non trouvé</h4>
          <p>Les détails pour "{decodedProductName}" ne sont pas encore disponibles.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Navigation */}
      <div className="bg-light border-bottom">
        <div className="container py-3">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-dark p-0 me-3" 
              onClick={() => navigate(-1)}
              style={{ textDecoration: 'none' }}
            >
              <FaArrowLeft size={20} />
            </button>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/home" className="text-decoration-none">Accueil</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/shop" className="text-decoration-none">{productDetails.mainCategory}</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={`/shop/${productDetails.category}`} className="text-decoration-none">
                    {productDetails.category}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {productDetails.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Colonne gauche - Images */}
          <div className="col-lg-6">
            <div className="product-gallery">
              {/* Image principale */}
              <div className="main-image-container bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center" 
                   style={{ height: '400px', border: '1px solid #dee2e6' }}>
                {selectedImage && isValidImage(selectedImage) ? (
                  <img 
                    src={getImagePath(selectedImage)}
                    alt={productDetails.title}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain',
                      padding: '20px'
                    }}
                    onError={() => handleImageError(selectedImage)}
                    key={selectedImage} // Forcer le re-rendu quand l'image change
                  />
                ) : (
                  <div className="text-center p-4">
                    <FaImage size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">{productDetails.title}</h5>
                    <p className="text-muted small">Image non disponible</p>
                  </div>
                )}
              </div>
              
              {/* Miniatures */}
              {productDetails.images && productDetails.images.length > 0 && (
                <div className="thumbnail-row d-flex gap-2 overflow-auto pb-2">
                  {productDetails.images.map((img, index) => {
                    const imagePath = getImagePath(img);
                    const isValid = isValidImage(img);
                    
                    return (
                      <div 
                        key={index}
                        className={`thumbnail-item border rounded-3 d-flex align-items-center justify-content-center ${selectedImage === img && isValid ? 'border-primary border-2' : ''}`}
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          cursor: isValid ? 'pointer' : 'default',
                          background: '#f8f9fa',
                          opacity: isValid ? 1 : 0.5
                        }}
                        onClick={() => isValid && setSelectedImage(img)}
                      >
                        {isValid ? (
                          <img 
                            src={imagePath}
                            alt={`${productDetails.title} - ${index + 1}`}
                            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                            onError={() => handleImageError(img)}
                          />
                        ) : (
                          <FaImage size={30} className="text-muted" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Informations produit */}
          <div className="col-lg-6">
            <div className="product-info">
              {/* Catégorie et badge */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-primary">{productDetails.category}</span>
                <span className="badge bg-secondary">{productDetails.mainCategory}</span>
                <span className="badge bg-success">En stock</span>
              </div>
              
              {/* Titre */}
              <h1 className="display-6 fw-bold mb-3">{productDetails.title}</h1>
              
              {/* Évaluation */}
              {renderStars(4.8)}
              
              {/* Description courte */}
              <p className="lead mb-4">
                {productDetails.fullDescription}
              </p>
              
              {/* Caractéristiques principales */}
              <div className="features-section bg-light p-4 rounded-3 mb-4">
                <h5 className="fw-bold mb-3">
                  <FaCheck className="text-success me-2" />
                  Caractéristiques principales
                </h5>
                <ul className="list-unstyled mb-0">
                  {productDetails.features.map((feature, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <FaCheck size={16} className="text-success me-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Prix et actions */}
              <div className="pricing-section bg-white p-4 rounded-3 border mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted text-decoration-line-through me-2">
                      {productDetails.price ? `${Math.round(productDetails.price * 1.2)}€` : 'Sur devis'}
                    </span>
                    <span className="display-6 fw-bold text-primary">
                      {productDetails.price ? `${productDetails.price}€` : 'Prix sur demande'}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleGeneratePDF}
                      title="Télécharger la fiche technique PDF"
                    >
                      <FaFilePdf size={20} />
                    </button>
                    <button 
                      className="btn btn-primary btn-lg px-5"
                      onClick={handleRequestQuote}
                    >
                      Demander un devis
                    </button>
                  </div>
                </div>
                <p className="text-muted small mt-3 mb-0">
                  <FaShieldAlt className="me-1" />
                  Garantie 2 ans • Livraison express • Support technique inclus
                </p>
              </div>
              
              {/* Documents techniques */}
              <div className="d-flex gap-3">
                <button className="btn btn-outline-secondary">
                  <FaDownload className="me-2" />
                  Fiche technique
                </button>
                <button className="btn btn-outline-secondary">
                  <FaDownload className="me-2" />
                  Manuel d'utilisation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description détaillée avec bouton Voir spécifications */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="description-section bg-white p-4 rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Description détaillée</h4>
                <button 
                  className="btn btn-primary"
                  onClick={handleOpenSpecsModal}
                >
                  <FaEye className="me-2" />
                  Voir spécifications techniques
                </button>
              </div>
              
              <h6 className="fw-bold mb-2">À propos de {productDetails.title}</h6>
              <p className="mb-4">{productDetails.fullDescription}</p>
              
              <h6 className="fw-bold mb-2">Applications pédagogiques</h6>
              <ul className="mb-4">
                <li>Formation initiale aux techniques d'usinage CNC</li>
                <li>Programmation avancée et optimisation des trajectoires</li>
                <li>Maintenance et dépannage des systèmes CNC</li>
                <li>Projets de fabrication numérique et prototypage</li>
              </ul>
              
              <h6 className="fw-bold mb-2">Avantages pour l'enseignement</h6>
              <ul className="mb-0">
                <li>Interface intuitive adaptée aux étudiants</li>
                <li>Documentation pédagogique complète incluse</li>
                <li>Support technique et formation des formateurs</li>
                <li>Conforme aux programmes d'enseignement technique</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section des produits similaires */}
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="fw-bold mb-4">Produits similaires</h3>
            <div className="row g-4">
              <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <FaCube size={48} className="text-primary mb-3" />
                    <h6 className="fw-bold">De4-Pro (iKC4)</h6>
                    <p className="small text-muted">Bench CNC Lathe</p>
                    <button className="btn btn-sm btn-outline-primary mt-2">Voir</button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <FaCube size={48} className="text-primary mb-3" />
                    <h6 className="fw-bold">De6 (iKC6S)</h6>
                    <p className="small text-muted">CNC Turning Machine</p>
                    <button className="btn btn-sm btn-outline-primary mt-2">Voir</button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <FaCube size={48} className="text-primary mb-3" />
                    <h6 className="fw-bold">Fa4 (iKX1)</h6>
                    <p className="small text-muted">CNC Milling Center</p>
                    <button className="btn btn-sm btn-outline-primary mt-2">Voir</button>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <FaCube size={48} className="text-primary mb-3" />
                    <h6 className="fw-bold">ECO1</h6>
                    <p className="small text-muted">5-axis Milling Machine</p>
                    <button className="btn btn-sm btn-outline-primary mt-2">Voir</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DES SPÉCIFICATIONS TECHNIQUES */}
      {showSpecsModal && (
        <div className="specs-modal-overlay" onClick={handleCloseSpecsModal}>
          <div className="specs-modal" onClick={(e) => e.stopPropagation()}>
            <button className="specs-modal-close" onClick={handleCloseSpecsModal}>
              <FaTimes />
            </button>
            
            <div className="specs-modal-header">
              <h2>
                <FaChartBar className="me-2" />
                Spécifications techniques
              </h2>
              <p className="text-muted">{productDetails.title}</p>
            </div>
            
            <div className="specs-modal-body">
              {/* Spécifications générales */}
              {productDetails.specifications && Object.keys(productDetails.specifications).length > 0 && (
                <div className="specs-section mb-4">
                  <h5 className="fw-bold mb-3 pb-2 border-bottom">Spécifications générales</h5>
                  <div className="specs-grid">
                    {Object.entries(productDetails.specifications).map(([key, value], index) => (
                      <div key={index} className="specs-item">
                        <div className="specs-key">
                          {getSpecIcon(key)}
                          <span>{key}</span>
                        </div>
                        <div className="specs-value">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Spécifications techniques avancées */}
              {productDetails.technicalSpecs && Object.keys(productDetails.technicalSpecs).length > 0 && (
                <div className="specs-section mb-4">
                  <h5 className="fw-bold mb-3 pb-2 border-bottom">Spécifications techniques avancées</h5>
                  <div className="specs-grid">
                    {Object.entries(productDetails.technicalSpecs).map(([key, value], index) => (
                      <div key={index} className="specs-item">
                        <div className="specs-key">
                          {getSpecIcon(key)}
                          <span>{key}</span>
                        </div>
                        <div className="specs-value">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Caractéristiques principales */}
              {productDetails.features && productDetails.features.length > 0 && (
                <div className="specs-section">
                  <h5 className="fw-bold mb-3 pb-2 border-bottom">Caractéristiques principales</h5>
                  <ul className="specs-features-list">
                    {productDetails.features.map((feature, index) => (
                      <li key={index}>
                        <FaCheck className="text-success me-2" size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DEMANDE DE DEVIS */}
      {showQuoteForm && (
        <div className="quote-modal-overlay">
          <div className="quote-modal">
            <button className="quote-modal-close" onClick={handleCloseQuoteForm}>
              <FaTimes />
            </button>
            
            {quoteSubmitted ? (
              <div className="quote-modal-success">
                <div className="success-icon">
                  <FaCheck size={48} />
                </div>
                <h3>Demande envoyée avec succès !</h3>
                <p>Votre demande de devis pour <strong>{productDetails.title}</strong> a bien été reçue.</p>
                <p className="text-muted">Notre équipe commerciale vous contactera sous 24h ouvrées.</p>
              </div>
            ) : (
              <>
                <div className="quote-modal-header">
                  <h2>Demande de devis personnalisé</h2>
                  <p className="text-muted">Pour : <strong>{productDetails.title}</strong></p>
                </div>
                
                <form onSubmit={handleSubmitQuote} className="quote-modal-form">
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
                        value={`${productDetails.price || 'Sur devis'}€`}
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
                        onClick={handleCloseQuoteForm}
                      >
                        Annuler
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Envoyer la demande
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS additionnel */}
      <style jsx>{`
        .product-details-page .breadcrumb {
          background: transparent;
        }
        .product-details-page .thumbnail-item {
          transition: all 0.2s;
        }
        .product-details-page .thumbnail-item:hover {
          border-color: #0d6efd !important;
          transform: scale(1.05);
        }
        
        /* Styles pour la modale de spécifications */
        .specs-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }
        
        .specs-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .specs-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          color: #6c757d;
          cursor: pointer;
          padding: 5px;
          line-height: 1;
          transition: color 0.2s;
          z-index: 1;
        }
        
        .specs-modal-close:hover {
          color: #dc3545;
        }
        
        .specs-modal-header {
          margin-bottom: 25px;
          padding-right: 30px;
          border-bottom: 2px solid #f1f1f1;
          padding-bottom: 15px;
        }
        
        .specs-modal-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }
        
        .specs-modal-body {
          padding: 10px 0;
        }
        
        .specs-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .specs-section h5 {
          color: #0d6efd;
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .specs-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .specs-key {
          display: flex;
          align-items: center;
          color: #495057;
          font-weight: 500;
          flex: 1;
        }
        
        .specs-key span {
          margin-left: 8px;
        }
        
        .specs-value {
          font-weight: 600;
          color: #212529;
          text-align: right;
        }
        
        .specs-features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }
        
        .specs-features-list li {
          background: white;
          padding: 10px 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        .specs-modal-footer {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .specs-modal-footer .btn {
          padding: 10px 25px;
          border-radius: 8px;
        }
        
        /* Styles pour le modal de devis */
        .quote-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1060;
          padding: 20px;
        }
        
        .quote-modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .quote-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          color: #6c757d;
          cursor: pointer;
          padding: 5px;
          line-height: 1;
          transition: color 0.2s;
        }
        
        .quote-modal-close:hover {
          color: #dc3545;
        }
        
        .quote-modal-header {
          margin-bottom: 25px;
          padding-right: 30px;
        }
        
        .quote-modal-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
          margin-bottom: 5px;
        }
        
        .quote-modal-form .form-label {
          font-weight: 600;
          color: #495057;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }
        
        .quote-modal-form .form-control {
          border-radius: 8px;
          border: 1px solid #ced4da;
          padding: 10px 15px;
        }
        
        .quote-modal-form .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.25);
        }
        
        .quote-modal-footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .quote-modal-info {
          color: #6c757d;
          max-width: 60%;
        }
        
        .quote-modal-actions .btn {
          padding: 10px 25px;
          border-radius: 8px;
        }
        
        .quote-modal-success {
          text-align: center;
          padding: 40px 20px;
        }
        
        .quote-modal-success .success-icon {
          width: 80px;
          height: 80px;
          background: #28a745;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        
        @media (max-width: 768px) {
          .specs-grid {
            grid-template-columns: 1fr;
          }
          
          .specs-features-list {
            grid-template-columns: 1fr;
          }
          
          .specs-modal-footer {
            flex-direction: column;
          }
          
          .specs-modal-footer .btn {
            width: 100%;
          }
          
          .quote-modal {
            padding: 20px;
          }
          
          .quote-modal-footer {
            flex-direction: column;
            gap: 15px;
          }
          
          .quote-modal-info {
            max-width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;