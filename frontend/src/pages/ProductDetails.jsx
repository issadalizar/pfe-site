// ProductDetails.jsx (version complète avec gestion d'images, bouton 3D et génération PDF)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaStar,
  FaCheck,
  FaCog,
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
  FaChartBar,
  FaArrowRight,
  FaShoppingCart,
  FaCube,
} from "react-icons/fa";
import { getProductDetails } from "../services/productDataService";
import DevisModal from "../components/DevisModal";
import { useCart } from "../context/CartContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ProductDetails = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const { addToCart, notification } = useCart();
  const [productDetails, setProductDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showTextSpecsPage, setShowTextSpecsPage] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  //  FONCTION : Valider si une URL d'image est valide
  const isValidImage = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'];
    const hasValidExtension = validExtensions.some(ext => 
      url.toLowerCase().endsWith(ext)
    );
    
    if (url === '.PNG' || url === '.JPG' || url === '.JPEG' || url.length < 5) {
      return false;
    }
    
    if (!url.startsWith('http') && !url.startsWith('/images')) {
      return false;
    }
    
    return hasValidExtension;
  };

  //  FONCTION : Gérer les erreurs de chargement d'images
  const handleImageError = (imageUrl) => {
    console.warn(` Erreur de chargement d'image: ${imageUrl}`);
    setImageErrors(prev => ({
      ...prev,
      [imageUrl]: true
    }));
  };

  // ========== FONCTION POUR GÉNÉRER LE PDF COMPLET ==========
  // ========== REMPLACE LA FONCTION handleGeneratePDF DANS ProductDetails.jsx ==========
// Copie tout ce bloc et remplace l'ancienne fonction handleGeneratePDF

const handleGeneratePDF = async () => {
    if (!productDetails) return;

    setPdfGenerating(true);

    try {
        // Toast de chargement
        const loadingToast = document.createElement("div");
        loadingToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="spinner-border spinner-border-sm" role="status"></div>
                <span>Génération du PDF en cours...</span>
            </div>
        `;
        loadingToast.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            color: white; padding: 12px 24px; border-radius: 12px;
            z-index: 10000; font-weight: 500;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(loadingToast);

        // Données produit
        const productName_    = productDetails.title || '';
        const productCategory = productDetails.category || '';
        const productMainCat  = productDetails.mainCategory || '';
        const productDesc     = productDetails.fullDescription || '';
        const productFeatures = productDetails.features || [];
        const specifications  = productDetails.specifications || {};
        const technicalSpecs  = productDetails.technicalSpecs || {};

        // Images valides (max 3 pour la ligne du haut)
        const validImages = (productDetails.images || [])
            .filter(img => isValidImage(img) && !imageErrors[img])
            .slice(0, 3);

        const escapeHtml = (text) => {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        };

        // Construction du HTML — une seule page A4
        const el = document.createElement("div");
        el.style.cssText = `
            position: absolute; top: -10000px; left: 0;
            width: 960px; background: white;
            padding: 30px 36px; font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 13px; line-height: 1.5; color: #333;
        `;

        el.innerHTML = `
            <!-- EN-TÊTE : nom à gauche, images à droite -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start;
                        border-bottom: 3px solid #4361ee; padding-bottom: 18px; margin-bottom: 20px;">
                <div style="flex:1; padding-right:20px;">
                    <div style="font-size:11px; color:#888; letter-spacing:1px; margin-bottom:6px; text-transform:uppercase;">
                        ${escapeHtml(productMainCat)} › ${escapeHtml(productCategory)}
                    </div>
                    <h1 style="color:#4361ee; font-size:24px; margin:0 0 8px 0; line-height:1.2;">
                        ${escapeHtml(productName_)}
                    </h1>
                    <p style="margin:0; color:#555; font-size:12.5px;">
                        ${escapeHtml(productDesc)}
                    </p>
                </div>

                <!-- Images à droite du titre -->
                ${validImages.length > 0 ? `
                <div style="display:flex; gap:8px; flex-shrink:0;">
                    ${validImages.map((img, i) => `
                        <div style="width:${validImages.length === 1 ? '160px' : '110px'};
                                    height:${validImages.length === 1 ? '160px' : '110px'};
                                    border:1px solid #e0e0e0; border-radius:10px;
                                    padding:6px; background:#f8f9fa;
                                    display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            <img src="${img}" alt="Vue ${i+1}" crossorigin="anonymous"
                                 style="max-width:100%; max-height:100%; object-fit:contain;" />
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>

            <!-- CORPS : tableaux l'un sous l'autre -->

            <!-- Caractéristiques principales -->
            ${productFeatures.length > 0 ? `
            <div style="margin-bottom:16px;">
                <div style="background:linear-gradient(135deg,#4361ee,#3a0ca3); color:white;
                            padding:8px 14px; border-radius:8px; font-size:13px;
                            font-weight:700; margin-bottom:10px;">
                    ✓ Caractéristiques principales
                </div>
                <div style="background:#f8f9fa; border-radius:8px; padding:12px;">
                    ${productFeatures.map(f => `
                        <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:5px;">
                            <span style="color:#28a745; font-weight:bold; flex-shrink:0;">✓</span>
                            <span style="font-size:12px;">${escapeHtml(f)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Spécifications générales -->
            ${Object.keys(specifications).length > 0 ? `
            <div style="margin-bottom:16px;">
                <div style="background:linear-gradient(135deg,#667eea,#764ba2); color:white;
                            padding:8px 14px; border-radius:8px; font-size:13px;
                            font-weight:700; margin-bottom:10px;">
                    ⚙ Spécifications générales
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    ${Object.entries(specifications).map(([k,v]) => `
                        <tr>
                            <td style="padding:5px 8px; background:#f8f9fa; font-weight:600;
                                       border:1px solid #dee2e6; width:35%;">${escapeHtml(k)}</td>
                            <td style="padding:5px 8px; border:1px solid #dee2e6;">${escapeHtml(String(v))}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            ` : ''}

            <!-- Spécifications techniques avancées -->
            ${Object.keys(technicalSpecs).length > 0 ? `
            <div style="margin-bottom:16px;">
                <div style="background:linear-gradient(135deg,#667eea,#764ba2); color:white;
                            padding:8px 14px; border-radius:8px; font-size:13px;
                            font-weight:700; margin-bottom:10px;">
                    🔧 Spécifications techniques avancées
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    ${Object.entries(technicalSpecs).map(([k,v]) => `
                        <tr>
                            <td style="padding:5px 8px; background:#f8f9fa; font-weight:600;
                                       border:1px solid #dee2e6; width:35%;">${escapeHtml(k)}</td>
                            <td style="padding:5px 8px; border:1px solid #dee2e6;">${escapeHtml(String(v))}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            ` : ''}

            <!-- FOOTER -->
            <div style="margin-top:20px; text-align:center; font-size:10px; color:#999;
                        border-top:1px solid #dee2e6; padding-top:12px;">
                Fiche technique générée le ${new Date().toLocaleDateString('fr-FR')} 
                à ${new Date().toLocaleTimeString('fr-FR')} — ${window.location.origin}
            </div>
        `;

        document.body.appendChild(el);

        // Attendre le chargement des images
        const imgs = el.querySelectorAll('img');
        await Promise.all(Array.from(imgs).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));

        await new Promise(resolve => setTimeout(resolve, 400));

        // Capture html2canvas
        const canvas = await html2canvas(el, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
        });

        // Génération PDF une seule page
        const imgData  = canvas.toDataURL('image/png');
        const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Si le contenu dépasse une page A4 (297mm), on le scale pour tenir
        const pageHeight = 297;
        if (imgHeight <= pageHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
            // Scale down pour tenir sur une page
            const scale    = pageHeight / imgHeight;
            const newWidth = imgWidth * scale;
            const xOffset  = (imgWidth - newWidth) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, 0, newWidth, pageHeight);
        }

        const safeFileName = productName_.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        pdf.save(`${safeFileName}_Fiche_Technique.pdf`);

        // Nettoyage
        document.body.removeChild(el);
        document.body.removeChild(loadingToast);

    } catch (error) {
        console.error("Erreur PDF:", error);
        alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
        document.querySelectorAll('[style*="Génération du PDF"]').forEach(el => el.remove());
    } finally {
        setPdfGenerating(false);
    }
};
  // ========== FONCTION: Navigation vers la vue 3D ==========
  const handleView3D = () => {
    navigate(`/product3d/${encodeURIComponent(decodedProductName)}`);
  };

  // Décoder le nom du produit depuis l'URL
  const decodedProductName = decodeURIComponent(productName);

  // Récupérer les détails du produit de façon asynchrone
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const details = await getProductDetails(decodedProductName);
        setProductDetails(details);
        if (details) {
          const validImage = details.images?.find(img => isValidImage(img));
          setSelectedImage(validImage || "");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        setProductDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (decodedProductName) {
      fetchProductDetails();
    }
  }, [decodedProductName]);

  const handleRequestQuote = () => {
    setShowQuoteForm(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseQuoteForm = () => {
    setShowQuoteForm(false);
    document.body.style.overflow = "auto";
  };

  const handleOpenSpecsPage = () => {
    setShowTextSpecsPage(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseSpecsPage = () => {
    setShowTextSpecsPage(false);
    document.body.style.overflow = "auto";
  };

  const getSpecIcon = (specKey) => {
    if (
      specKey.includes("Moteur") ||
      specKey.includes("broche") ||
      specKey.includes("Vitesse")
    )
      return <FaTachometerAlt className="text-primary me-2" />;
    if (
      specKey.includes("Vis") ||
      specKey.includes("Guide") ||
      specKey.includes("Rail") ||
      specKey.includes("Course")
    )
      return <FaRuler className="text-success me-2" />;
    if (
      specKey.includes("Changeur") ||
      specKey.includes("Magasin") ||
      specKey.includes("Porte-outils")
    )
      return <FaWrench className="text-warning me-2" />;
    if (
      specKey.includes("Structure") ||
      specKey.includes("Bâti") ||
      specKey.includes("Banc")
    )
      return <FaIndustry className="text-secondary me-2" />;
    if (specKey.includes("Certification") || specKey.includes("Sécurité"))
      return <FaShieldAlt className="text-info me-2" />;
    if (
      specKey.includes("Système") ||
      specKey.includes("Interface") ||
      specKey.includes("Compatibilité")
    )
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
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
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
          <p>
            Les détails pour "{decodedProductName}" ne sont pas encore
            disponibles.
          </p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
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
            <FaCheck size={16} />
            {notification}
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="bg-light border-bottom">
        <div className="container py-3">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-dark p-0 me-3"
              onClick={() => navigate(-1)}
              style={{ textDecoration: "none" }}
            >
              <FaArrowLeft size={20} />
            </button>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/home" className="text-decoration-none">
                    Accueil
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/shop" className="text-decoration-none">
                    {productDetails.mainCategory}
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link
                    to={`/shop/${productDetails.category}`}
                    className="text-decoration-none"
                  >
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
              <div
                className="main-image-container bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center"
                style={{ height: "400px", border: "1px solid #dee2e6" }}
              >
                {selectedImage && isValidImage(selectedImage) && !imageErrors[selectedImage] ? (
                  <img
                    src={selectedImage}
                    alt={productDetails.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      padding: "20px",
                    }}
                    onError={() => handleImageError(selectedImage)}
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
                    const isValid = isValidImage(img) && !imageErrors[img];

                    return (
                      <div
                        key={index}
                        className={`thumbnail-item border rounded-3 d-flex align-items-center justify-content-center ${selectedImage === img && isValid ? "border-primary border-2" : ""}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          cursor: isValid ? "pointer" : "default",
                          background: "#f8f9fa",
                          opacity: isValid ? 1 : 0.5,
                        }}
                        onClick={() => isValid && setSelectedImage(img)}
                      >
                        {isValid ? (
                          <img
                            src={img}
                            alt={`${productDetails.title} - ${index + 1}`}
                            style={{
                              maxWidth: "90%",
                              maxHeight: "90%",
                              objectFit: "contain",
                            }}
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
                <span className="badge bg-primary">
                  {productDetails.category}
                </span>
                <span className="badge bg-secondary">
                  {productDetails.mainCategory}
                </span>
                <span className="badge bg-success">En stock</span>
              </div>

              {/* Titre */}
              <h1 className="display-6 fw-bold mb-3">{productDetails.title}</h1>

              {/* Évaluation */}
              {renderStars(4.8)}

              {/* Description courte */}
              <p className="lead mb-4">{productDetails.fullDescription}</p>

              {/* Bouton Voir en 3D */}
              <div className="mb-4">
                <button 
                  onClick={handleView3D}
                  className="btn btn-3d-view w-100"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    padding: '15px 20px',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <FaCube size={24} />
                  Visualisation 3D Interactive
                  <FaArrowRight size={20} />
                </button>
              </div>

              {/* Caractéristiques principales */}
              <div className="features-section bg-light p-4 rounded-3 mb-4">
                <h5 className="fw-bold mb-3">
                  <FaCheck className="text-success me-2" />
                  Caractéristiques principales
                </h5>
                <ul className="list-unstyled mb-0">
                  {productDetails.features.map((feature, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <FaCheck
                        size={16}
                        className="text-success me-2 mt-1 flex-shrink-0"
                      />
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
                      {productDetails.price
                        ? `${Math.round(productDetails.price * 1.2)}€`
                        : "Sur devis"}
                    </span>
                    <span className="display-6 fw-bold text-primary">
                      {productDetails.price
                        ? `${productDetails.price}€`
                        : "Prix sur demande"}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleGeneratePDF}
                      disabled={pdfGenerating}
                      title="Télécharger la fiche technique PDF"
                    >
                      {pdfGenerating ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                      ) : (
                        <FaFilePdf size={20} />
                      )}
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
              <div className="d-flex gap-3 flex-wrap">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleGeneratePDF}
                  disabled={pdfGenerating}
                >
                  <FaDownload className="me-2" />
                  {pdfGenerating ? "Génération..." : "Fiche technique"}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => addToCart(productDetails)}
                >
                  <FaShoppingCart className="me-2" />
                  Ajout panier
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
                  onClick={handleOpenSpecsPage}
                >
                  <FaEye className="me-2" />
                  Voir spécifications techniques
                </button>
              </div>

              <h6 className="fw-bold mb-2">
                À propos de {productDetails.title}
              </h6>
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
      </div>

      {/* PAGE DE SPÉCIFICATIONS TEXTUELLES */}
      {showTextSpecsPage && (
        <div className="specs-page-overlay" onClick={handleCloseSpecsPage}>
          <div className="specs-page" onClick={(e) => e.stopPropagation()}>
            <button className="specs-page-close" onClick={handleCloseSpecsPage}>
              <FaTimes />
            </button>

            <div className="specs-page-header">
              <h2>
                <FaChartBar className="me-2" />
                Spécifications techniques
              </h2>
              <p className="text-muted">{productDetails.title}</p>
            </div>

            <div className="specs-page-body">
              {/* SECTION 1: Spécifications générales */}
              {productDetails.specifications &&
                Object.keys(productDetails.specifications).length > 0 && (
                  <div className="specs-text-section mb-4">
                    <h4 className="fw-bold text-primary mb-3">
                      <FaArrowRight className="me-2" size={18} />
                      Spécifications générales
                    </h4>
                    <div className="specs-text-content p-3 bg-light rounded-3">
                      {Object.entries(productDetails.specifications).map(
                        ([key, value], index) => (
                          <div
                            key={index}
                            className="mb-2 pb-2 border-bottom border-secondary border-opacity-10"
                          >
                            <strong>{key} :</strong> {value}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* SECTION 2: Spécifications techniques avancées */}
              {productDetails.technicalSpecs &&
                Object.keys(productDetails.technicalSpecs).length > 0 && (
                  <div className="specs-text-section mb-4">
                    <h4 className="fw-bold text-primary mb-3">
                      <FaArrowRight className="me-2" size={18} />
                      Spécifications techniques avancées
                    </h4>
                    <div className="specs-text-content p-3 bg-light rounded-3">
                      {Object.entries(productDetails.technicalSpecs).map(
                        ([key, value], index) => (
                          <div
                            key={index}
                            className="mb-2 pb-2 border-bottom border-secondary border-opacity-10"
                          >
                            <strong>{key} :</strong> {value}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* SECTION 3: Caractéristiques principales */}
              {productDetails.features &&
                productDetails.features.length > 0 && (
                  <div className="specs-text-section mb-4">
                    <h4 className="fw-bold text-primary mb-3">
                      <FaArrowRight className="me-2" size={18} />
                      Caractéristiques principales
                    </h4>
                    <div className="specs-text-content p-3 bg-light rounded-3">
                      <ul className="mb-0">
                        {productDetails.features.map((feature, index) => (
                          <li key={index} className="mb-2">
                            <FaCheck className="text-success me-2" size={14} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DEMANDE DE DEVIS */}
      <DevisModal
        product={productDetails}
        isOpen={showQuoteForm}
        onClose={handleCloseQuoteForm}
      />

      {/* Styles */}
      <style>{`
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

        /* Styles pour le bouton 3D */
        .btn-3d-view {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          50% {
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.8);
          }
          100% {
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
        }

        /* STYLES POUR LA PAGE DE SPÉCIFICATIONS TEXTUELLES */
        .specs-page-overlay {
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

        .specs-page {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .specs-page-close {
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

        .specs-page-close:hover {
          color: #dc3545;
        }

        .specs-page-header {
          margin-bottom: 25px;
          padding-right: 30px;
          border-bottom: 2px solid #f1f1f1;
          padding-bottom: 15px;
        }

        .specs-page-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }

        .specs-page-body {
          padding: 10px 0;
        }

        .specs-text-section {
          margin-bottom: 25px;
        }

        .specs-text-section h4 {
          font-size: 18px;
          display: flex;
          align-items: center;
        }

        .specs-text-content {
          background: #f8f9fa;
          border-radius: 8px;
          line-height: 1.6;
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
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
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
          .specs-page {
            padding: 20px;
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