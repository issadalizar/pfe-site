import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Button, Spinner, Dropdown, Badge } from "react-bootstrap";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaStar,
  FaTimes,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaFolder,
  FaFolderOpen,
  FaTrashAlt,
  FaLanguage,
  FaChartBar,
  FaTrophy,
  FaBalanceScale,
  FaCheck,
  FaBan
} from "react-icons/fa";
import apiService from "../services/api";

// ─────────────────────────────────────────────
// ComparisonView : affichage riche de comparaison
// ─────────────────────────────────────────────
const ComparisonView = ({ comparison, products, language, criteria, keyword }) => {
  if (!comparison || !products || products.length < 2) return null;

  const t = {
    fr: {
      title: "COMPARAISON DÉTAILLÉE", price: "Prix", stock: "Stock",
      features: "Caractéristiques", specs: "Spécifications",
      orders: "Popularité (commandes)", inStock: "en stock", outOfStock: "Rupture",
      recommendation: "Recommandation", cheapest: "moins cher", popular: "plus commandé",
      winner: "GAGNANT", difference: "Différence", average: "Moyenne",
      noFeature: "non disponible", scores: "Scores"
    },
    en: {
      title: "DETAILED COMPARISON", price: "Price", stock: "Stock",
      features: "Features", specs: "Specifications",
      orders: "Popularity (orders)", inStock: "in stock", outOfStock: "Out of stock",
      recommendation: "Recommendation", cheapest: "cheapest", popular: "most ordered",
      winner: "WINNER", difference: "Difference", average: "Average",
      noFeature: "not available", scores: "Scores"
    },
    ar: {
      title: "مقارنة مفصلة", price: "السعر", stock: "المخزون",
      features: "الميزات", specs: "المواصفات",
      orders: "الشعبية (الطلبات)", inStock: "في المخزون", outOfStock: "غير متوفر",
      recommendation: "توصية", cheapest: "أرخص", popular: "الأكثر طلباً",
      winner: "الفائز", difference: "الفرق", average: "المتوسط",
      noFeature: "غير متاح", scores: "النقاط"
    }
  }[language] || { title: "COMPARAISON" };

  const showSection = (section) => {
    if (!criteria) return true; // tout afficher si pas de critère
    if (criteria === 'prix') return section === 'price';
    if (criteria === 'stock') return section === 'stock';
    if (criteria === 'order') return section === 'orders';
    if (criteria === 'spec') return ['features', 'specs'].includes(section);
    if (criteria === 'feature_keyword') return ['keyword', 'price'].includes(section);
    return true;
  };

  const pc = comparison.price_comparison;
  const sc = comparison.stock_comparison;
  const oc = comparison.orders_comparison;
  const fc = comparison.features_comparison;
  const specsC = comparison.specs_comparison;
  const rec = comparison.recommendation;
  const kf = comparison.keyword_features;
  const ks = comparison.keyword_specs;
  const kt = comparison.keyword_tech_specs;

  return (
    <div className="mt-3 rounded-4 overflow-hidden border border-info"
      style={{ boxShadow: "0 4px 20px rgba(0,120,200,0.12)" }}>
      {/* Header */}
      <div className="d-flex align-items-center px-3 py-2"
        style={{ background: "linear-gradient(90deg,#0d6efd,#0dcaf0)", color: "#fff" }}>
        <FaChartBar className="me-2" />
        <strong style={{ fontSize: 13 }}>
          {keyword ? `📊 Comparaison — « ${keyword} »` : `📊 ${t.title}`}
        </strong>
      </div>

      <div className="bg-white p-3">
        {/* Noms des produits en en-tête */}
        <div className="row mb-3 pb-2 border-bottom">
          <div className="col-4" />
          {products.map((p, i) => (
            <div key={i} className="col text-center">
              <span className="fw-bold text-primary" style={{ fontSize: 12 }}>{p.name}</span>
            </div>
          ))}
        </div>

        {/* ── PRIX ── */}
        {showSection('price') && pc && (
          <div className="mb-3">
            <div className="text-muted fw-semibold mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              💰 {t.price}
            </div>
            <div className="row align-items-center">
              <div className="col-4" />
              {products.map((p, i) => {
                const isCheapest = p.name === pc.cheapest;
                return (
                  <div key={i} className="col text-center">
                    <span className={`fw-bold ${isCheapest ? "text-success" : "text-dark"}`}
                      style={{ fontSize: 15 }}>
                      {p.price} €
                    </span>
                    {isCheapest && (
                      <div><Badge bg="success" style={{ fontSize: 9 }}>{t.cheapest}</Badge></div>
                    )}
                  </div>
                );
              })}
            </div>
            {pc.difference > 0 && (
              <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                {t.difference} : {pc.difference.toFixed(0)} € | {t.average} : {pc.average.toFixed(0)} €
              </div>
            )}
          </div>
        )}

        {/* ── STOCK ── */}
        {showSection('stock') && sc && (
          <div className="mb-3">
            <div className="text-muted fw-semibold mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              📦 {t.stock}
            </div>
            <div className="row">
              <div className="col-4" />
              {products.map((p, i) => {
                const qty = sc[p.name];
                return (
                  <div key={i} className="col text-center">
                    {qty > 0
                      ? <span className="text-success fw-semibold" style={{ fontSize: 13 }}>✓ {qty} {t.inStock}</span>
                      : <span className="text-danger" style={{ fontSize: 13 }}>✗ {t.outOfStock}</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COMMANDES ── */}
        {showSection('orders') && oc && (
          <div className="mb-3">
            <div className="text-muted fw-semibold mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              🛒 {t.orders}
            </div>
            <div className="row">
              <div className="col-4" />
              {products.map((p, i) => {
                const count = oc[p.name];
                const maxOrders = Math.max(...Object.values(oc));
                const isBest = count === maxOrders;
                return (
                  <div key={i} className="col text-center">
                    <span className={`fw-bold ${isBest ? "text-warning" : ""}`} style={{ fontSize: 14 }}>
                      {count}
                    </span>
                    {isBest && <div><Badge bg="warning" text="dark" style={{ fontSize: 9 }}>🔥 {t.popular}</Badge></div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FEATURES (exclusives) ── */}
        {showSection('features') && fc && Object.keys(fc).length > 0 && (
          <div className="mb-3">
            <div className="text-muted fw-semibold mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              ✅ {t.features}
            </div>
            {Object.entries(fc)
              .filter(([, data]) => !Object.values(data).every(Boolean))
              .slice(0, 5)
              .map(([feat, data], idx) => (
                <div key={idx} className="row mb-1 align-items-center">
                  <div className="col-4 text-muted" style={{ fontSize: 11 }}>{feat.slice(0, 40)}</div>
                  {products.map((p, i) => (
                    <div key={i} className="col text-center">
                      {data[p.name]
                        ? <FaCheck className="text-success" size={11} />
                        : <FaBan className="text-danger" size={11} />
                      }
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* ── SPECS TECHNIQUES ── */}
        {showSection('specs') && specsC && Object.keys(specsC).length > 0 && (
          <div className="mb-3">
            <div className="text-muted fw-semibold mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              🔧 {t.specs}
            </div>
            {Object.entries(specsC).slice(0, 6).map(([spec, data], idx) => (
              <div key={idx} className="row mb-1 align-items-start">
                <div className="col-4 text-muted" style={{ fontSize: 10 }}>{spec.replace('[Tech] ', '')}</div>
                {products.map((p, i) => (
                  <div key={i} className="col text-center" style={{ fontSize: 11 }}>
                    {data[p.name] !== undefined ? String(data[p.name]) : 'N/A'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── KEYWORD FEATURES ── */}
        {showSection('keyword') && kf && (
          <div className="mb-3">
            <div className="text-muted fw-semibold mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              🔍 Caractéristiques — « {keyword} »
            </div>
            {products.map((p, i) => {
              const feats = kf[p.name] || [];
              const specs = { ...(ks?.[p.name] || {}), ...(kt?.[p.name] || {}) };
              return (
                <div key={i} className="mb-2">
                  <span className="fw-semibold text-primary" style={{ fontSize: 12 }}>{p.name}</span>
                  {feats.length > 0
                    ? feats.slice(0, 3).map((f, j) => (
                      <div key={j} className="text-success" style={{ fontSize: 11, paddingLeft: 8 }}>✓ {f}</div>
                    ))
                    : <div className="text-muted" style={{ fontSize: 11, paddingLeft: 8 }}>({t.noFeature})</div>
                  }
                  {Object.entries(specs).slice(0, 3).map(([k, v], j) => (
                    <div key={j} style={{ fontSize: 11, paddingLeft: 8, color: '#555' }}>🔧 {k}: {v}</div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── RECOMMANDATION ── */}
        {rec && (
          <div className="rounded-3 p-2 mt-2"
            style={{ background: "linear-gradient(135deg,#f0fff4,#e8f4fd)", border: "1px solid #b7eacc" }}>
            <div className="d-flex align-items-center mb-1">
              <FaTrophy className="text-warning me-2" size={16} />
              <strong style={{ fontSize: 13 }}>🏆 {t.winner} : {rec.best_product}</strong>
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>{rec.explanation}</div>

            {/* Scores visuels */}
            {rec.scores && (
              <div className="mt-2">
                <div className="text-muted" style={{ fontSize: 10, marginBottom: 4 }}>{t.scores}</div>
                {Object.entries(rec.scores).map(([name, score], i) => {
                  const maxScore = Math.max(...Object.values(rec.scores));
                  const pct = (score / maxScore) * 100;
                  const isWinner = name === rec.best_product;
                  return (
                    <div key={i} className="d-flex align-items-center gap-2 mb-1">
                      <span style={{ width: 90, fontSize: 10, fontWeight: isWinner ? 700 : 400, color: isWinner ? '#0d6efd' : '#555' }}>
                        {name.slice(0, 12)}
                      </span>
                      <div className="flex-grow-1 rounded" style={{ background: "#e9ecef", height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: isWinner ? "#0d6efd" : "#adb5bd", borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#555", minWidth: 32 }}>{score.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ProductCard
// ─────────────────────────────────────────────
const ProductCard = ({ product, language }) => {
  const [imgError, setImgError] = useState(false);
  const tStock = language === 'ar' ? 'في المخزون' : language === 'en' ? 'in stock' : 'en stock';
  const tOut = language === 'ar' ? 'غير متوفر' : language === 'en' ? 'Out of stock' : 'Rupture';

  const getImageUrl = () => {
    if (imgError || !product.image) return "https://via.placeholder.com/60x60?text=Produit";
    if (product.image.startsWith('http')) return product.image;
    return product.image.startsWith('/') ? product.image : `/images/${product.image}`;
  };

  return (
    <Card className="mb-2 shadow-sm"
      style={{ transition: "transform 0.15s", cursor: "pointer", borderRadius: 12 }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
      <Card.Body className="p-2">
        <div className="d-flex gap-3">
          <img
            src={getImageUrl()}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 10, backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
          />
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold" style={{ fontSize: 13 }}>{product.name}</h6>
            <div className="d-flex align-items-center gap-3 mb-1">
              <span className="text-primary fw-bold">{product.price} €</span>
              <div className="d-flex align-items-center">
                <FaStar className="text-warning me-1" size={11} />
                <span style={{ fontSize: 11 }}>{product.rating || 4.5}</span>
              </div>
            </div>
            <small className={product.stock > 0 ? "text-success" : "text-danger"} style={{ fontSize: 11 }}>
              {product.stock > 0 ? `✓ ${product.stock} ${tStock}` : `✗ ${tOut}`}
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// ─────────────────────────────────────────────
// CategoryButtons : boutons de catégories
// ─────────────────────────────────────────────
const CategoryButtons = ({ categories, onCategoryClick, level, parentName, language }) => {
  const label = {
    fr: { main: "Catégories principales", sub: `Sous-catégories de ${parentName || ''}` },
    en: { main: "Main categories", sub: `Subcategories of ${parentName || ''}` },
    ar: { main: "الفئات الرئيسية", sub: `فئات فرعية لـ ${parentName || ''}` }
  }[language] || { main: "Catégories", sub: "Sous-catégories" };

  return (
    <div className="mt-2 mb-3">
      <div className="text-muted fw-semibold mb-2" style={{ fontSize: 12, letterSpacing: 0.5 }}>
        {level === 1 ? "🗂️ " + label.main : "📂 " + label.sub}
      </div>
      <div className="d-flex flex-column gap-2">
        {categories.map((cat, i) => (
          <Button
            key={i}
            variant={level === 1 ? "outline-primary" : "outline-success"}
            onClick={() => onCategoryClick(cat)}
            className="d-flex align-items-center justify-content-between w-100 text-start"
            style={{ borderRadius: 10, padding: "10px 14px", borderWidth: 1.5, transition: "all 0.15s" }}
          >
            <span className="fw-medium" style={{ fontSize: 13 }}>
              {level === 1 ? <FaFolder className="me-2" size={12} /> : <FaFolderOpen className="me-2" size={12} />}
              {cat.name}
            </span>
            <Badge bg={level === 1 ? "primary" : "success"} className="rounded-pill" style={{ fontSize: 10 }}>
              {cat.count}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CHATBOT PRINCIPAL
// ─────────────────────────────────────────────
const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! 👋 Je suis votre assistant UniverTechno+.", products: [], comparison: null, action: null }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Navigation catégories — état dédié, indépendant des messages
  const [currentCategories, setCurrentCategories] = useState([]);
  const [currentParent, setCurrentParent] = useState(null);
  const [navigationLevel, setNavigationLevel] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  // catégories actives à afficher sous les messages (séparées du flux messages)
  const [activeCategoryPanel, setActiveCategoryPanel] = useState(null);
  // { categories: [...], level: 1|2, parentName: string|null }

  const [language, setLanguage] = useState("fr");
  const [conversations, setConversations] = useState([{ id: 1, name: "Conversation 1" }]);

  const messagesEndRef = useRef(null);
  // userId stable sur la durée de vie du composant
  const userIdRef = useRef("user_" + Math.random().toString(36).substr(2, 9));

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Traductions ──
  const translations = {
    fr: {
      placeholder: "Écrivez votre message...",
      back: "Retour aux catégories",
      clear: "Effacer la conversation",
      newChat: "Nouvelle conversation",
      categories: "Catégories",
      subcategories: "Sous-catégories",
      list: "liste",
      help: "aide",
      compare: "Comparer",
      bestProduct: "Meilleur produit"
    },
    en: {
      placeholder: "Type your message...",
      back: "Back to categories",
      clear: "Clear conversation",
      newChat: "New chat",
      categories: "Categories",
      subcategories: "Subcategories",
      list: "list",
      help: "help",
      compare: "Compare",
      bestProduct: "Best product"
    },
    ar: {
      placeholder: "اكتب رسالتك...",
      back: "العودة للفئات",
      clear: "مسح المحادثة",
      newChat: "محادثة جديدة",
      categories: "الفئات",
      subcategories: "الفئات الفرعية",
      list: "قائمة",
      help: "مساعدة",
      compare: "مقارنة",
      bestProduct: "أفضل منتج"
    }
  };
  const t = translations[language] || translations.fr;

  const getWelcomeMessage = (lang = language) => ({
    fr: "Bonjour ! 👋 Je suis votre assistant UniverTechno+. Tapez **'liste'** pour voir les catégories ou posez directement votre question.",
    en: "Hello! 👋 I am your UniverTechno+ assistant. Type **'list'** to see categories or ask directly.",
    ar: "مرحبًا! 👋 أنا مساعد UniverTechno+. اكتب **'قائمة'** لرؤية الفئات أو اطرح سؤالك مباشرة."
  }[lang] || "Bonjour !");

  // ── Envoi de message ──
  const handleSendMessage = async (overrideMessage) => {
    const userMessage = (overrideMessage !== undefined ? overrideMessage : inputMessage).trim();
    if (!userMessage) return;

    setInputMessage("");
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: userMessage, products: [], comparison: null }]);

    try {
      const response = await apiService.sendMessage(userMessage, userIdRef.current);

      if (response.success) {
        const newMsg = {
          role: "assistant",
          content: response.response,
          products: response.products || [],
          action: response.action || 'chat',
          comparison: response.comparison || null,
          comparison_criteria: response.comparison_criteria || null,
          comparison_keyword: response.comparison_keyword || null,
        };
        setMessages(prev => [...prev, newMsg]);

        // ── Gestion panel catégories ──
        if (response.categories && response.categories.length > 0) {
          setActiveCategoryPanel({ categories: response.categories, level: 1, parentName: null });
          setCurrentCategories(response.categories);
          setNavigationLevel(1);
          setCurrentParent(null);
          setShowCategories(true);
        } else if (response.action === 'show_products') {
          // On affiche des produits → on cache les boutons catégories
          setActiveCategoryPanel(null);
          setShowCategories(false);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Erreur de connexion au serveur.",
        products: [], comparison: null, action: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Clic sur une catégorie ──
  const handleCategoryClick = async (cat) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: cat.name, products: [], comparison: null }]);

    try {
      const query = `tous les produits de ${cat.raw_name || cat.name}`;
      const response = await apiService.sendMessage(query, userIdRef.current);

      if (response.success) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: response.response || `Voici les produits de **${cat.name}** :`,
          products: response.products || [],
          action: response.action || 'show_products',
          comparison: null,
        }]);

        if (response.categories && response.categories.length > 0) {
          // Sous-catégories → niveau 2
          setActiveCategoryPanel({ categories: response.categories, level: 2, parentName: cat.name });
          setCurrentCategories(response.categories);
          setCurrentParent(cat);
          setNavigationLevel(2);
          setShowCategories(true);
        } else {
          // Produits affichés, on garde le panel "retour" visible
          setActiveCategoryPanel(null);
          setShowCategories(true);
          setNavigationLevel(3);
        }
      }
    } catch (error) {
      console.error("Erreur catégorie:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Retour en arrière ──
  const handleBack = async () => {
    if (navigationLevel === 2) {
      // Retour aux catégories globales
      await handleSendMessage("liste des catégories");
    } else if (navigationLevel === 3 && currentParent) {
      // Retour à la catégorie parente
      await handleCategoryClick(currentParent);
    } else {
      setShowCategories(false);
      setNavigationLevel(0);
    }
  };

  // ── Comparer les produits du dernier message ──
  const handleCompareLastProducts = async (criteria = '') => {
    const query = criteria
      ? `comparer selon ${criteria}`
      : "comparer ces deux produits";
    await handleSendMessage(query);
  };

  // ── Effacer ──
  const handleClearConversation = () => {
    setMessages([{ role: "assistant", content: getWelcomeMessage(), products: [], comparison: null, action: null }]);
    setCurrentCategories([]);
    setShowCategories(false);
    setNavigationLevel(0);
    setCurrentParent(null);
    setActiveCategoryPanel(null);
  };

  // ── Nouvelle conversation ──
  const handleNewConversation = () => {
    const newId = conversations.length + 1;
    setConversations(prev => [...prev, { id: newId, name: `Conversation ${newId}` }]);
    userIdRef.current = "user_" + Math.random().toString(36).substr(2, 9);
    handleClearConversation();
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setMessages(prev => {
      const msgs = [...prev];
      if (msgs[0]?.role === "assistant") msgs[0].content = getWelcomeMessage(lang);
      return msgs;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ── Trouver le dernier message assistant avec produits (pour le bouton compare) ──
  const getLastProductsMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant' && m.products && m.products.length >= 2 && m.action === 'show_products') {
        return m;
      }
    }
    return null;
  };

  const lastProductMsg = getLastProductsMessage();
  const canCompare = !!lastProductMsg;

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, width: isMinimized ? "auto" : 460, transition: "all 0.3s ease" }}>
      <Card className="shadow-lg border-0" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 15px 50px rgba(0,0,0,0.25)" }}>

        {/* ── HEADER ── */}
        <Card.Header className="py-3"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderBottom: "none" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <img src="/chatbot.png" alt="Bot"
                style={{ width: 35, height: 35, borderRadius: "50%", border: "2px solid white" }} />
              <div>
                <h6 className="mb-0 fw-bold text-white">UniverTechno+</h6>
                <small className="text-white opacity-75" style={{ fontSize: 11 }}>Assistant intelligent</small>
              </div>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-white p-0 border-0">
                  <FaLanguage size={18} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleLanguageChange('fr')} active={language === 'fr'}>🇫🇷 Français</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleLanguageChange('en')} active={language === 'en'}>🇬🇧 English</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleLanguageChange('ar')} active={language === 'ar'}>🇹🇳 العربية</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button variant="link" className="text-white p-0" onClick={handleNewConversation} title={t.newChat}><FaPlus size={16} /></Button>
              <Button variant="link" className="text-white p-0" onClick={handleClearConversation} title={t.clear}><FaTrashAlt size={15} /></Button>
              <Button variant="link" className="text-white p-0" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <FaPlus size={15} /> : <FaMinus size={15} />}
              </Button>
              <Button variant="link" className="text-white p-0" onClick={onClose}><FaTimes size={17} /></Button>
            </div>
          </div>
        </Card.Header>

        {!isMinimized && (
          <>
            {/* ── MESSAGES ── */}
            <Card.Body style={{ height: 490, overflowY: "auto", backgroundColor: "#f4f6fb", padding: "1rem" }}>

              {messages.map((msg, index) => (
                <div key={index}>
                  {/* Bulle message */}
                  <div
                    className={`mb-3 d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                    style={{ animation: "fadeIn 0.25s" }}
                  >
                    <div className={`d-flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`} style={{ maxWidth: "88%" }}>
                      {/* Avatar */}
                      <div className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                        style={{ width: 36, height: 36, minWidth: 36, backgroundColor: msg.role === "user" ? "#4f5bd5" : "#6c757d", border: "2px solid white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                        {msg.role === "user"
                          ? <FaUser color="white" size={14} />
                          : <img src="/chatbot.png" alt="Bot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        }
                      </div>
                      {/* Texte */}
                      <div className={`mx-2 ${msg.role === "user" ? "me-2" : "ms-2"}`}>
                        <div
                          className={`p-3 rounded-4 ${msg.role === "user" ? "bg-primary text-white" : "bg-white"}`}
                          style={{ fontSize: 13, whiteSpace: "pre-line", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", maxWidth: "100%", wordBreak: "break-word" }}
                        >
                          {msg.content}
                        </div>

                        {/* Produits */}
                        {msg.products && msg.products.length > 0 && msg.action !== 'show_comparison' && (
                          <div className="mt-2">
                            {msg.products.map((product, idx) => (
                              <ProductCard key={idx} product={product} language={language} />
                            ))}

                            {/* Boutons de comparaison rapide — seulement si ≥ 2 produits */}
                            {msg.products.length >= 2 && msg.action === 'show_products' && (
                              <div className="mt-2 p-2 rounded-3" style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
                                <div className="text-muted mb-1" style={{ fontSize: 11 }}>
                                  <FaBalanceScale className="me-1" size={10} />
                                  Comparer ces produits :
                                </div>
                                <div className="d-flex flex-wrap gap-1">
                                  <Button size="sm" variant="outline-primary"
                                    style={{ fontSize: 11, borderRadius: 20, padding: "3px 10px" }}
                                    onClick={() => handleCompareLastProducts('')}>
                                    📊 Comparaison complète
                                  </Button>
                                  <Button size="sm" variant="outline-success"
                                    style={{ fontSize: 11, borderRadius: 20, padding: "3px 10px" }}
                                    onClick={() => handleCompareLastProducts('prix')}>
                                    💰 Par prix
                                  </Button>
                                  <Button size="sm" variant="outline-info"
                                    style={{ fontSize: 11, borderRadius: 20, padding: "3px 10px" }}
                                    onClick={() => handleCompareLastProducts('stock')}>
                                    📦 Par stock
                                  </Button>
                                  <Button size="sm" variant="outline-warning"
                                    style={{ fontSize: 11, borderRadius: 20, padding: "3px 10px" }}
                                    onClick={() => handleCompareLastProducts('commandes')}>
                                    🔥 Par popularité
                                  </Button>
                                  <Button size="sm" variant="outline-secondary"
                                    style={{ fontSize: 11, borderRadius: 20, padding: "3px 10px" }}
                                    onClick={() => handleCompareLastProducts('caractéristiques')}>
                                    ✅ Par caractéristiques
                                  </Button>
                                  <Button size="sm" variant="outline-dark"
                                    style={{ fontSize: 11, borderRadius: 20, padding: "3px 10px" }}
                                    onClick={() => handleCompareLastProducts('spécifications')}>
                                    🔧 Par specs
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comparaison détaillée */}
                        {msg.action === 'show_comparison' && msg.comparison && (
                          <ComparisonView
                            comparison={msg.comparison}
                            products={msg.products}
                            language={language}
                            criteria={msg.comparison_criteria}
                            keyword={msg.comparison_keyword}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── PANEL CATÉGORIES (hors boucle, toujours visible et à jour) ── */}
              {activeCategoryPanel && activeCategoryPanel.categories.length > 0 && (
                <div className="mb-2">
                  <CategoryButtons
                    categories={activeCategoryPanel.categories}
                    onCategoryClick={handleCategoryClick}
                    level={activeCategoryPanel.level}
                    parentName={activeCategoryPanel.parentName}
                    language={language}
                  />
                </div>
              )}

              {/* Bouton retour */}
              {showCategories && navigationLevel >= 2 && (
                <div className="d-flex justify-content-start mb-3">
                  <Button size="sm" variant="outline-secondary" onClick={handleBack}
                    className="d-flex align-items-center gap-1 rounded-pill px-3" style={{ fontSize: 12 }}>
                    <FaArrowLeft size={10} /> {t.back}
                  </Button>
                </div>
              )}

              {/* Spinner chargement */}
              {isLoading && (
                <div className="text-center my-3">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <span className="ms-2 text-muted" style={{ fontSize: 12 }}>Chargement...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </Card.Body>

            {/* ── FOOTER ── */}
            <Card.Footer className="bg-white p-3 border-top">
              <Form.Group className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder={t.placeholder}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="rounded-pill border-2"
                  style={{ backgroundColor: "#f8f9fa", fontSize: 13 }}
                />
                <Button variant="primary" className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 42, height: 42, flexShrink: 0 }}
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}>
                  <FaPaperPlane size={14} />
                </Button>
              </Form.Group>

              {/* Suggestions rapides */}
              <div className="d-flex gap-2 mt-2 flex-wrap">
                <Button size="sm" variant="light" className="rounded-pill"
                  style={{ fontSize: 11 }} onClick={() => handleSendMessage("liste des catégories")}>
                  📋 Catégories
                </Button>
                <Button size="sm" variant="light" className="rounded-pill"
                  style={{ fontSize: 11 }} onClick={() => handleSendMessage("aide")}>
                  ❓ Aide
                </Button>
                {canCompare && (
                  <Button size="sm" variant="outline-primary" className="rounded-pill"
                    style={{ fontSize: 11 }} onClick={() => handleCompareLastProducts('')}>
                    📊 Comparer
                  </Button>
                )}
                <Button size="sm" variant="light" className="rounded-pill"
                  style={{ fontSize: 11 }} onClick={() => handleSendMessage("meilleur produit")}>
                  🏆 Meilleur produit
                </Button>
                <Button size="sm" variant="light" className="rounded-pill"
                  style={{ fontSize: 11 }} onClick={() => handleSendMessage("produits en stock")}>
                  📦 En stock
                </Button>
              </div>

              {/* Exemples */}
              <div className="mt-2" style={{ fontSize: 11, color: "#888" }}>
                💡
                <span className="badge bg-light text-dark mx-1" style={{ cursor: "pointer" }}
                  onClick={() => setInputMessage("tour CNC pas cher")}>tour CNC pas cher</span>
                <span className="badge bg-light text-dark mx-1" style={{ cursor: "pointer" }}
                  onClick={() => setInputMessage("comparer selon la vitesse")}>comparer selon la vitesse</span>
                <span className="badge bg-light text-dark mx-1" style={{ cursor: "pointer" }}
                  onClick={() => setInputMessage("produits moins de 5000€")}>moins de 5000€</span>
              </div>
            </Card.Footer>
          </>
        )}
      </Card>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #bbb; border-radius: 5px; }
      `}</style>
    </div>
  );
};

export default ChatBot;