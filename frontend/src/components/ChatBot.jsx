import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Button, Spinner, Dropdown } from "react-bootstrap";
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
  FaLanguage
} from "react-icons/fa";
import apiService from "../services/api";

const ChatBot = ({ isOpen, onClose }) => {
  // États principaux
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! 👋 Je suis votre assistant UniverTechno+.",
      products: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // États pour la navigation
  const [currentCategories, setCurrentCategories] = useState([]);
  const [currentParent, setCurrentParent] = useState(null);
  const [navigationLevel, setNavigationLevel] = useState(0);
  const [showCategories, setShowCategories] = useState(false); // Nouvel état
  
  // États pour les nouvelles fonctionnalités
  const [conversations, setConversations] = useState([
    { id: 1, name: "Conversation 1", messages: [], active: true }
  ]);
  const [activeConversation, setActiveConversation] = useState(1);
  const [language, setLanguage] = useState("fr");
  
  const messagesEndRef = useRef(null);
  const userId = "user_" + Math.random().toString(36).substr(2, 9);

  // Images
  const botAvatar = "/chatbot.png";
  const userAvatar = "https://via.placeholder.com/40/007bff/ffffff?text=User";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fonction pour afficher les catégories (appelée manuellement)
  const handleShowCategories = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.sendMessage("liste", userId);
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            products: [],
          },
        ]);
        if (response.categories) {
          setCurrentCategories(response.categories);
          setNavigationLevel(1);
          setShowCategories(true);
        }
      }
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, products: [] },
    ]);

    try {
      const response = await apiService.sendMessage(userMessage, userId);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            products: response.products || [],
          },
        ]);
        
        // Vérifier si la réponse contient des catégories
        if (response.categories && response.categories.length > 0) {
          setCurrentCategories(response.categories);
          setShowCategories(true);
          if (response.parent_category) {
            setCurrentParent(response.parent_category);
            setNavigationLevel(2);
          } else {
            setNavigationLevel(1);
          }
        } else {
          // Cacher les catégories si la réponse n'en contient pas
          setShowCategories(false);
          setNavigationLevel(0);
        }

        // Vérifier si la réponse contient des produits
        if (response.products && response.products.length > 0) {
          setShowCategories(false);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erreur de connexion au serveur.",
          products: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: category.name, products: [] },
    ]);

    try {
      const response = await apiService.sendMessage(category.name, userId);
      
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            products: response.products || [],
          },
        ]);
        
        if (response.categories && response.categories.length > 0) {
          setCurrentCategories(response.categories);
          setCurrentParent({ name: category.name, id: category.id });
          setNavigationLevel(2);
          setShowCategories(true);
        } else {
          setShowCategories(false);
          setNavigationLevel(3);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    setIsLoading(true);
    
    if (navigationLevel === 2 && currentParent) {
      try {
        const response = await apiService.sendMessage("liste", userId);
        if (response.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: response.response,
              products: [],
            },
          ]);
          if (response.categories) {
            setCurrentCategories(response.categories);
            setCurrentParent(null);
            setNavigationLevel(1);
            setShowCategories(true);
          }
        }
      } catch (error) {
        console.error("Erreur retour:", error);
      }
    } else if (navigationLevel === 3) {
      if (currentParent) {
        await handleCategoryClick(currentParent);
      } else {
        await handleBack();
      }
    } else {
      setShowCategories(false);
    }
    
    setIsLoading(false);
  };

  // Effacer la conversation
  const handleClearConversation = () => {
    setMessages([
      {
        role: "assistant",
        content: getWelcomeMessage(),
        products: [],
      },
    ]);
    setCurrentCategories([]);
    setShowCategories(false);
    setNavigationLevel(0);
  };

  // Nouvelle conversation
  const handleNewConversation = () => {
    const newId = conversations.length + 1;
    const newConversation = {
      id: newId,
      name: `Conversation ${newId}`,
      messages: [],
      active: true
    };
    
    const updatedConversations = conversations.map(conv => ({
      ...conv,
      active: false
    }));
    
    setConversations([...updatedConversations, newConversation]);
    setActiveConversation(newId);
    
    setMessages([
      {
        role: "assistant",
        content: getWelcomeMessage(),
        products: [],
      },
    ]);
    setCurrentCategories([]);
    setShowCategories(false);
    setNavigationLevel(0);
  };

  // Changer de langue
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[0] && newMessages[0].role === "assistant") {
        newMessages[0].content = getWelcomeMessage(lang);
      }
      return newMessages;
    });
  };

  // Message d'accueil selon la langue
  const getWelcomeMessage = (lang = language) => {
    const messages = {
      fr: "Bonjour ! 👋 Je suis votre assistant UniverTechno+. Tapez **'liste'** pour voir les catégories ou **'aide'** pour plus d'options.",
      en: "Hello! 👋 I am your UniverTechno+ assistant. Type **'list'** to see categories or **'help'** for more options.",
      ar: "مرحبًا! 👋 أنا مساعد UniverTechno+ الخاص بك. اكتب **'قائمة'** لرؤية الفئات أو **'مساعدة'** لمزيد من الخيارات."
    };
    return messages[lang] || messages.fr;
  };

  // Traductions pour l'interface
  const translations = {
    fr: {
      placeholder: "Écrivez votre message...",
      back: "Retour",
      clear: "Effacer la conversation",
      newChat: "Nouvelle conversation",
      language: "Langue",
      stock: "en stock",
      outOfStock: "Rupture",
      categories: "Catégories principales",
      chooseCategory: "Choisissez une catégorie",
      subcategories: "Sous-catégories",
      products: "Produits",
      list: "liste",
      help: "aide"
    },
    en: {
      placeholder: "Type your message...",
      back: "Back",
      clear: "Clear conversation",
      newChat: "New chat",
      language: "Language",
      stock: "in stock",
      outOfStock: "Out of stock",
      categories: "Main categories",
      chooseCategory: "Choose a category",
      subcategories: "Subcategories",
      products: "Products",
      list: "list",
      help: "help"
    },
    ar: {
      placeholder: "اكتب رسالتك...",
      back: "رجوع",
      clear: "مسح المحادثة",
      newChat: "محادثة جديدة",
      language: "اللغة",
      stock: "في المخزون",
      outOfStock: "غير متوفر",
      categories: "الفئات الرئيسية",
      chooseCategory: "اختر فئة",
      subcategories: "الفئات الفرعية",
      products: "المنتجات",
      list: "قائمة",
      help: "مساعدة"
    }
  };

  const t = translations[language];

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ProductCard = ({ product }) => {
    const [imgError, setImgError] = useState(false);
    
    const handleImageError = () => setImgError(true);
    
    const getImageUrl = () => {
      if (imgError || !product.image) return "https://via.placeholder.com/60x60?text=Produit";
      if (product.image.startsWith('http')) return product.image;
      return product.image.startsWith('/') ? product.image : `/images/${product.image}`;
    };

    return (
      <Card className="mb-2 shadow-sm hover-shadow" style={{ transition: "all 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
        <Card.Body className="p-2">
          <div className="d-flex gap-3">
            <img
              src={getImageUrl()}
              alt={product.name}
              onError={handleImageError}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "10px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef"
              }}
            />
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-bold">{product.name}</h6>
              <div className="d-flex align-items-center gap-3 mb-1">
                <span className="text-primary fw-bold">
                  {product.price} €
                </span>
                <div className="d-flex align-items-center">
                  <FaStar className="text-warning me-1" size={12} />
                  <span className="small">{product.rating || 4.5}</span>
                </div>
              </div>
              <small className={product.stock > 0 ? "text-success" : "text-danger"}>
                {product.stock > 0 ? `✓ ${product.stock} ${t.stock}` : `✗ ${t.outOfStock}`}
              </small>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        width: isMinimized ? "auto" : "400px",
        transition: "all 0.3s ease",
      }}
    >
      <Card
        className="shadow-lg border-0"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 15px 50px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header amélioré */}
        <Card.Header 
          className="bg-primary text-white py-3"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderBottom: "none"
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <img 
                src={botAvatar} 
                alt="Bot" 
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  border: "2px solid white"
                }}
              />
              <div>
                <h6 className="mb-0 fw-bold">UniverTechno+</h6>
                <small className="opacity-75">Assistant virtuel</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              {/* Bouton langue */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-white p-0 border-0">
                  <FaLanguage size={18} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleLanguageChange('fr')} active={language === 'fr'}>
                    🇫🇷 Français
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleLanguageChange('en')} active={language === 'en'}>
                    🇬🇧 English
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleLanguageChange('ar')} active={language === 'ar'}>
                    🇹🇳 العربية (تونسي)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* Bouton nouvelle conversation */}
              <Button 
                variant="link" 
                className="text-white p-0"
                onClick={handleNewConversation}
                title={t.newChat}
              >
                <FaPlus size={18} />
              </Button>

              {/* Bouton effacer */}
              <Button 
                variant="link" 
                className="text-white p-0"
                onClick={handleClearConversation}
                title={t.clear}
              >
                <FaTrashAlt size={16} />
              </Button>

              {/* Bouton minimiser */}
              <Button 
                variant="link" 
                className="text-white p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <FaPlus size={16} /> : <FaMinus size={16} />}
              </Button>

              {/* Bouton fermer */}
              <Button 
                variant="link" 
                className="text-white p-0"
                onClick={onClose}
              >
                <FaTimes size={18} />
              </Button>
            </div>
          </div>
        </Card.Header>

        {!isMinimized && (
          <>
            {/* Messages */}
            <Card.Body
              style={{
                height: "500px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
                padding: "1rem"
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
                  style={{ animation: "fadeIn 0.3s" }}
                >
                  <div
                    className={`d-flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    style={{ maxWidth: "85%" }}
                  >
                    {/* Avatar */}
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center overflow-hidden`}
                      style={{
                        width: "40px",
                        height: "40px",
                        minWidth: "40px",
                        backgroundColor: msg.role === "user" ? "#007bff" : "#6c757d",
                        border: "2px solid white",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                      }}
                    >
                      {msg.role === "user" ? (
                        <img src={userAvatar} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <img src={botAvatar} alt="Bot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>

                    {/* Message */}
                    <div className={`mx-2 ${msg.role === "user" ? "me-2" : "ms-2"}`}>
                      <div
                        className={`p-3 rounded-4 ${
                          msg.role === "user" 
                            ? "bg-primary text-white" 
                            : "bg-white"
                        }`}
                        style={{
                          fontSize: "14px",
                          whiteSpace: "pre-line",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                          maxWidth: "100%",
                          wordBreak: "break-word"
                        }}
                      >
                        <p className="mb-0">{msg.content}</p>
                      </div>

                      {/* Produits */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-2">
                          {msg.products.map((product, idx) => (
                            <ProductCard key={idx} product={product} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bouton de retour - affiché seulement si on est dans les catégories */}
              {showCategories && navigationLevel > 1 && (
                <div className="d-flex justify-content-start mb-3">
                  <Button 
                    size="sm" 
                    variant="outline-secondary" 
                    onClick={handleBack}
                    className="d-flex align-items-center gap-1 rounded-pill px-3"
                  >
                    <FaArrowLeft size={10} /> {t.back}
                  </Button>
                </div>
              )}

              {/* Boutons des catégories - affichés seulement si showCategories est true */}
              {showCategories && currentCategories.length > 0 && (
                <div className="d-flex flex-column gap-2 my-3">
                  <h6 className="text-muted mb-2">
                    {navigationLevel === 1 ? t.categories : t.subcategories}
                  </h6>
                  {currentCategories.map((cat, i) => (
                    <Button
                      key={i}
                      variant={cat.level === 1 ? "outline-primary" : "outline-success"}
                      onClick={() => handleCategoryClick(cat)}
                      className="d-flex align-items-center justify-content-between w-100 text-start rounded-3"
                      style={{ 
                        padding: "12px",
                        transition: "all 0.2s",
                        borderWidth: "2px"
                      }}
                    >
                      <span className="fw-medium">
                        {cat.level === 1 ? <FaFolder className="me-2" /> : <FaFolderOpen className="me-2" />}
                        {cat.name}
                      </span>
                      <span className="badge bg-secondary rounded-pill px-3 py-1">{cat.count}</span>
                    </Button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted small">Chargement...</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </Card.Body>

            {/* Input amélioré */}
            <Card.Footer className="bg-white p-3 border-top">
              <Form.Group className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder={t.placeholder}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="rounded-pill border-2"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
                <Button 
                  variant="primary" 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "45px", height: "45px" }}
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <FaPaperPlane />
                </Button>
              </Form.Group>

              {/* Suggestions rapides */}
              <div className="d-flex gap-2 mt-2 overflow-auto" style={{ scrollbarWidth: "none" }}>
                <Button 
                  size="sm" 
                  variant="light" 
                  className="rounded-pill" 
                  onClick={() => setInputMessage(t.list)}
                >
                  📋 {t.list}
                </Button>
                <Button 
                  size="sm" 
                  variant="light" 
                  className="rounded-pill" 
                  onClick={() => setInputMessage(t.help)}
                >
                  ❓ {t.help}
                </Button>
                <Button 
                  size="sm" 
                  variant="light" 
                  className="rounded-pill" 
                  onClick={handleShowCategories}
                >
                  🏷️ Catégories
                </Button>
                <Button 
                 size="sm" 
                     variant="info" 
                     className="rounded-pill" 
                     onClick={() => setInputMessage("aide")}
                >               
                📖 Guide
                </Button>
              </div>
            </Card.Footer>
          </>
        )}
      </Card>

      {/* Style CSS pour les animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hover-shadow:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
        }
        
        ::-webkit-scrollbar {
          width: 5px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;