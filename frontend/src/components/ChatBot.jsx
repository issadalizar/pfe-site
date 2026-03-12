import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot, FaUser, FaPaperPlane, FaStar, FaTimes,
  FaPlus, FaArrowLeft, FaFolder, FaFolderOpen,
  FaTrashAlt, FaLanguage, FaChartBar, FaTrophy,
  FaBalanceScale, FaCheck, FaBan, FaComments,
  FaBars, FaHome
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import apiService from "../services/api";

// ─── Palette : blanc + dégradés bleu ──────────────────────────
const C = {
  // Fonds
  appBg:      "linear-gradient(145deg,#f0f4ff 0%,#e8eeff 50%,#eef2ff 100%)",
  sidebarBg:  "#ffffff",
  mainBg:     "#f5f8ff",
  headerBg:   "#ffffff",
  inputBg:    "#ffffff",
  // Bordures
  border:     "rgba(67,97,238,0.12)",
  borderMed:  "rgba(67,97,238,0.22)",
  // Bleus
  primary:    "#4361ee",
  primary2:   "#3a0ca3",
  accent:     "#7c3aed",
  gradPrimary:"linear-gradient(135deg,#4361ee,#3a0ca3)",
  gradAccent: "linear-gradient(135deg,#4361ee,#7c3aed)",
  // Messages
  msgUserBg:  "linear-gradient(135deg,#4361ee,#3a0ca3)",
  msgBotBg:   "#ffffff",
  msgBotBorder:"rgba(67,97,238,0.14)",
  // Texte
  textMain:   "#0f172a",
  textSub:    "#475569",
  textMuted:  "#94a3b8",
  // États
  success:    "#10b981",
  danger:     "#ef4444",
  gold:       "#f59e0b",
  // Chips / boutons légers
  chip:       "rgba(67,97,238,0.07)",
  chipHov:    "rgba(67,97,238,0.13)",
  chipBorder: "rgba(67,97,238,0.18)",
  // Sidebar items actifs
  sideActive: "rgba(67,97,238,0.09)",
  sideActiveBorder: "rgba(67,97,238,0.22)",
};

// ─────────────────────────────────────────────────────────────
// ComparisonView
// ─────────────────────────────────────────────────────────────
const ComparisonView = ({ comparison, products, language, criteria, keyword }) => {
  if (!comparison || !products || products.length < 2) return null;

  const t = {
    fr: { title:"COMPARAISON DÉTAILLÉE", price:"Prix", stock:"Stock", features:"Caractéristiques", specs:"Spécifications", orders:"Popularité", inStock:"en stock", outOfStock:"Rupture", recommendation:"Recommandation", cheapest:"moins cher", popular:"plus commandé", winner:"GAGNANT", difference:"Différence", average:"Moyenne", noFeature:"non disponible", scores:"Scores" },
    en: { title:"DETAILED COMPARISON", price:"Price", stock:"Stock", features:"Features", specs:"Specifications", orders:"Popularity", inStock:"in stock", outOfStock:"Out of stock", recommendation:"Recommendation", cheapest:"cheapest", popular:"most ordered", winner:"WINNER", difference:"Difference", average:"Average", noFeature:"not available", scores:"Scores" },
    ar: { title:"مقارنة مفصلة", price:"السعر", stock:"المخزون", features:"الميزات", specs:"المواصفات", orders:"الشعبية", inStock:"في المخزون", outOfStock:"غير متوفر", recommendation:"توصية", cheapest:"أرخص", popular:"الأكثر طلباً", winner:"الفائز", difference:"الفرق", average:"المتوسط", noFeature:"غير متاح", scores:"النقاط" }
  }[language] || { title:"COMPARAISON" };

  const showSection = (s) => {
    if (!criteria) return true;
    if (criteria === 'prix') return s === 'price';
    if (criteria === 'stock') return s === 'stock';
    if (criteria === 'order') return s === 'orders';
    if (criteria === 'spec') return ['features','specs'].includes(s);
    if (criteria === 'feature_keyword') return ['keyword','price'].includes(s);
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
    <div style={{ marginTop:12, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, background:"#fff", boxShadow:"0 4px 24px rgba(67,97,238,0.08)" }}>
      {/* En-tête dégradé bleu */}
      <div style={{ background:C.gradAccent, padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <FaChartBar size={13} color="white"/>
        <span style={{ color:"white", fontWeight:700, fontSize:12, letterSpacing:0.5 }}>
          {keyword ? `Comparaison — « ${keyword} »` : t.title}
        </span>
      </div>

      <div style={{ padding:"14px 16px" }}>
        {/* Header produits */}
        <div style={{ display:"grid", gridTemplateColumns:`140px repeat(${products.length},1fr)`, gap:8, marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${C.border}` }}>
          <div/>
          {products.map((p,i) => (
            <div key={i} style={{ textAlign:"center", color:C.primary, fontWeight:700, fontSize:11 }}>{p.name}</div>
          ))}
        </div>

        {/* Prix */}
        {showSection('price') && pc && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>💰 {t.price}</div>
            <div style={{ display:"grid", gridTemplateColumns:`140px repeat(${products.length},1fr)`, gap:8, alignItems:"center" }}>
              <div/>
              {products.map((p,i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <span style={{ fontWeight:800, fontSize:15, color:p.name===pc.cheapest ? C.success : C.textMain }}>{p.price} €</span>
                  {p.name===pc.cheapest && <div style={{ fontSize:9, color:C.success, marginTop:2 }}>{t.cheapest} ✓</div>}
                </div>
              ))}
            </div>
            {pc.difference>0 && <div style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>{t.difference}: {pc.difference.toFixed(0)}€ · {t.average}: {pc.average.toFixed(0)}€</div>}
          </div>
        )}

        {/* Stock */}
        {showSection('stock') && sc && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>📦 {t.stock}</div>
            <div style={{ display:"grid", gridTemplateColumns:`140px repeat(${products.length},1fr)`, gap:8 }}>
              <div/>
              {products.map((p,i) => {
                const q = sc[p.name];
                return (
                  <div key={i} style={{ textAlign:"center", fontSize:11, fontWeight:600, color:q>0?C.success:C.danger }}>
                    {q>0 ? `✓ ${q} ${t.inStock}` : `✗ ${t.outOfStock}`}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Commandes */}
        {showSection('orders') && oc && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>🛒 {t.orders}</div>
            <div style={{ display:"grid", gridTemplateColumns:`140px repeat(${products.length},1fr)`, gap:8 }}>
              <div/>
              {products.map((p,i) => {
                const count = oc[p.name];
                const maxO = Math.max(...Object.values(oc));
                const isBest = count===maxO;
                return (
                  <div key={i} style={{ textAlign:"center", fontWeight:700, fontSize:13, color:isBest?C.gold:C.textSub }}>
                    {count} {isBest && <span style={{ fontSize:9, display:"block", color:C.gold }}>🔥 {t.popular}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Features */}
        {showSection('features') && fc && Object.keys(fc).length>0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>✅ {t.features}</div>
            {Object.entries(fc).filter(([,d])=>!Object.values(d).every(Boolean)).slice(0,5).map(([feat,data],idx) => (
              <div key={idx} style={{ display:"grid", gridTemplateColumns:`140px repeat(${products.length},1fr)`, gap:8, marginBottom:4, alignItems:"center" }}>
                <div style={{ fontSize:10, color:C.textSub }}>{feat.slice(0,35)}</div>
                {products.map((p,i) => (
                  <div key={i} style={{ textAlign:"center" }}>
                    {data[p.name] ? <FaCheck size={10} color={C.success}/> : <FaBan size={10} color={C.danger}/>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Specs */}
        {showSection('specs') && specsC && Object.keys(specsC).length>0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>🔧 {t.specs}</div>
            {Object.entries(specsC).slice(0,6).map(([spec,data],idx) => (
              <div key={idx} style={{ display:"grid", gridTemplateColumns:`140px repeat(${products.length},1fr)`, gap:8, marginBottom:4 }}>
                <div style={{ fontSize:10, color:C.textMuted }}>{spec.replace('[Tech] ','')}</div>
                {products.map((p,i) => (
                  <div key={i} style={{ textAlign:"center", fontSize:11, color:C.textMain }}>
                    {data[p.name]!==undefined ? String(data[p.name]) : 'N/A'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Keyword */}
        {showSection('keyword') && kf && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>🔍 « {keyword} »</div>
            {products.map((p,i) => {
              const feats = kf[p.name]||[];
              const specs = {...(ks?.[p.name]||{}),...(kt?.[p.name]||{})};
              return (
                <div key={i} style={{ marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.primary }}>{p.name}</span>
                  {feats.length>0 ? feats.slice(0,3).map((f,j) => (
                    <div key={j} style={{ fontSize:10, color:C.success, paddingLeft:8 }}>✓ {f}</div>
                  )) : <div style={{ fontSize:10, color:C.textMuted, paddingLeft:8 }}>({t.noFeature})</div>}
                  {Object.entries(specs).slice(0,2).map(([k,v],j) => (
                    <div key={j} style={{ fontSize:10, paddingLeft:8, color:C.textSub }}>🔧 {k}: {v}</div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Recommandation */}
        {rec && (
          <div style={{ background:"linear-gradient(135deg,rgba(67,97,238,0.06),rgba(124,58,237,0.06))", border:`1px solid rgba(67,97,238,0.15)`, borderRadius:12, padding:"12px 14px", marginTop:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <FaTrophy color={C.gold} size={14}/>
              <strong style={{ color:C.primary2, fontSize:12 }}>🏆 {t.winner} : {rec.best_product}</strong>
            </div>
            <div style={{ fontSize:11, color:C.textSub }}>{rec.explanation}</div>
            {rec.scores && (
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:9, color:C.textMuted, marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>{t.scores}</div>
                {Object.entries(rec.scores).map(([name,score],i) => {
                  const maxS = Math.max(...Object.values(rec.scores));
                  const pct = (score/maxS)*100;
                  const isW = name===rec.best_product;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ width:80, fontSize:9, fontWeight:isW?700:400, color:isW?C.primary:C.textMuted }}>{name.slice(0,12)}</span>
                      <div style={{ flexGrow:1, background:"rgba(67,97,238,0.08)", borderRadius:4, height:6, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:isW?C.gradPrimary:"#cbd5e1", borderRadius:4, transition:"width 0.6s ease" }}/>
                      </div>
                      <span style={{ fontSize:9, color:C.textMuted, minWidth:28 }}>{score.toFixed(1)}</span>
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

// ─────────────────────────────────────────────────────────────
// ProductCard
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, language }) => {
  const [imgError, setImgError] = useState(false);
  const tStock = language==='ar'?'في المخزون':language==='en'?'in stock':'en stock';
  const tOut   = language==='ar'?'غير متوفر':language==='en'?'Out of stock':'Rupture';

  const getImageUrl = () => {
    if (imgError||!product.image) return "https://via.placeholder.com/52x52/e0e7ff/4361ee?text=P";
    if (product.image.startsWith('http')) return product.image;
    return product.image.startsWith('/')?product.image:`/images/${product.image}`;
  };

  return (
    <div style={{ display:"flex", gap:12, padding:"10px 12px", borderRadius:12, background:"#f8faff", border:`1px solid ${C.border}`, marginBottom:8, cursor:"pointer", transition:"all 0.15s" }}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(67,97,238,0.05)";e.currentTarget.style.borderColor=C.borderMed;e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 14px rgba(67,97,238,0.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="#f8faff";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
      <img src={getImageUrl()} alt={product.name} onError={()=>setImgError(true)}
        style={{ width:52, height:52, objectFit:"cover", borderRadius:10, background:"#e0e7ff", flexShrink:0, border:`1px solid ${C.border}` }}/>
      <div style={{ flexGrow:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:12, color:C.textMain, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{product.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:C.primary, fontWeight:800, fontSize:13 }}>{product.price} €</span>
          <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:C.gold }}>
            <FaStar size={9}/> {product.rating||4.5}
          </span>
        </div>
        <div style={{ fontSize:10, marginTop:3, color:product.stock>0?C.success:C.danger, fontWeight:500 }}>
          {product.stock>0?`✓ ${product.stock} ${tStock}`:`✗ ${tOut}`}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CategoryButtons
// ─────────────────────────────────────────────────────────────
const CategoryButtons = ({ categories, onCategoryClick, level, parentName, language }) => {
  const label = {
    fr: { main:"Catégories", sub:`Sous-catégories de ${parentName||''}` },
    en: { main:"Categories", sub:`Subcategories of ${parentName||''}` },
    ar: { main:"الفئات", sub:`فئات فرعية لـ ${parentName||''}` }
  }[language]||{ main:"Catégories", sub:"Sous-catégories" };

  return (
    <div style={{ marginTop:10, marginBottom:6 }}>
      <div style={{ fontSize:10, color:C.textMuted, marginBottom:8, textTransform:"uppercase", letterSpacing:0.8, fontWeight:600 }}>
        {level===1?"🗂️ "+label.main:"📂 "+label.sub}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {categories.map((cat,i) => (
          <button key={i} onClick={()=>onCategoryClick(cat)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 14px", borderRadius:10, background:C.chip, border:`1px solid ${C.chipBorder}`, color:C.primary, cursor:"pointer", transition:"all 0.15s", textAlign:"left", fontSize:12, fontWeight:500 }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.chipHov;e.currentTarget.style.boxShadow="0 2px 10px rgba(67,97,238,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.chip;e.currentTarget.style.boxShadow="none";}}>
            <span style={{ display:"flex", alignItems:"center", gap:8 }}>
              {level===1?<FaFolder size={11}/>:<FaFolderOpen size={11}/>}
              {cat.name}
            </span>
            <span style={{ background:"rgba(67,97,238,0.12)", color:C.primary, borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:700 }}>{cat.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MessageContent
// ─────────────────────────────────────────────────────────────
const MessageContent = ({ content, isUser }) => {
  const renderText = (text) => {
    return text.split('\n').map((line,i,arr) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part,j) => {
            if (part.startsWith('**')&&part.endsWith('**'))
              return <strong key={j} style={{ color:isUser?"white":C.textMain }}>{part.slice(2,-2)}</strong>;
            return <span key={j}>{part}</span>;
          })}
          {i<arr.length-1&&<br/>}
        </span>
      );
    });
  };
  return <>{renderText(content)}</>;
};

// ─────────────────────────────────────────────────────────────
// TypingIndicator
// ─────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display:"flex", gap:4, padding:"10px 14px", alignItems:"center" }}>
    {[0,0.2,0.4].map((delay,i) => (
      <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.primary, animation:`cb-bounce 1.2s ${delay}s infinite ease-in-out` }}/>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// CHATBOT PRINCIPAL
// ─────────────────────────────────────────────────────────────
const ChatBot = () => {
  const navigate = useNavigate();
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Bonjour ! 👋 Je suis votre assistant UniverTechno+. Posez-moi n'importe quelle question sur nos produits.", products:[], comparison:null, action:null }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentCategories, setCurrentCategories] = useState([]);
  const [currentParent, setCurrentParent] = useState(null);
  const [navigationLevel, setNavigationLevel] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategoryPanel, setActiveCategoryPanel] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [conversations, setConversations] = useState([
    { id:1, name:"Conversation 1", active:true }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userIdRef = useRef("user_"+Math.random().toString(36).substr(2,9));

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages,isLoading]);
  useEffect(()=>{ if(isFullOpen) inputRef.current?.focus(); },[isFullOpen]);

  const translations = {
    fr: { placeholder:"Envoyer un message...", back:"Retour", clear:"Effacer", newChat:"Nouvelle conversation", home:"Retour à l'accueil" },
    en: { placeholder:"Send a message...", back:"Back", clear:"Clear", newChat:"New conversation", home:"Back to home" },
    ar: { placeholder:"أرسل رسالة...", back:"رجوع", clear:"مسح", newChat:"محادثة جديدة", home:"العودة للرئيسية" }
  };
  const t = translations[language]||translations.fr;

  const getWelcomeMessage = (lang=language) => ({
    fr:"Bonjour ! 👋 Je suis votre assistant UniverTechno+. Posez-moi n'importe quelle question sur nos produits.",
    en:"Hello! 👋 I'm your UniverTechno+ assistant. Ask me anything about our products.",
    ar:"مرحبًا! 👋 أنا مساعد UniverTechno+. اسألني أي شيء عن منتجاتنا."
  }[lang]);

  const handleSendMessage = async (overrideMessage) => {
    const userMessage = (overrideMessage!==undefined?overrideMessage:inputMessage).trim();
    if (!userMessage) return;
    setInputMessage("");
    setIsLoading(true);
    setMessages(prev=>[...prev,{ role:"user", content:userMessage, products:[], comparison:null }]);
    try {
      const response = await apiService.sendMessage(userMessage, userIdRef.current);
      if (response.success) {
        setMessages(prev=>[...prev,{
          role:"assistant", content:response.response,
          products:response.products||[], action:response.action||'chat',
          comparison:response.comparison||null,
          comparison_criteria:response.comparison_criteria||null,
          comparison_keyword:response.comparison_keyword||null,
        }]);
        if (response.categories&&response.categories.length>0) {
          setActiveCategoryPanel({ categories:response.categories, level:1, parentName:null });
          setCurrentCategories(response.categories); setNavigationLevel(1); setCurrentParent(null); setShowCategories(true);
        } else if (response.action==='show_products') {
          setActiveCategoryPanel(null); setShowCategories(false);
        }
      }
    } catch {
      setMessages(prev=>[...prev,{ role:"assistant", content:"Erreur de connexion. Réessayez.", products:[], comparison:null, action:null }]);
    } finally { setIsLoading(false); }
  };

  const handleCategoryClick = async (cat) => {
    setIsLoading(true);
    setMessages(prev=>[...prev,{ role:"user", content:cat.name, products:[], comparison:null }]);
    try {
      const response = await apiService.sendMessage(`tous les produits de ${cat.raw_name||cat.name}`, userIdRef.current);
      if (response.success) {
        setMessages(prev=>[...prev,{ role:"assistant", content:response.response||`Voici les produits de ${cat.name} :`, products:response.products||[], action:response.action||'show_products', comparison:null }]);
        if (response.categories&&response.categories.length>0) {
          setActiveCategoryPanel({ categories:response.categories, level:2, parentName:cat.name });
          setCurrentCategories(response.categories); setCurrentParent(cat); setNavigationLevel(2); setShowCategories(true);
        } else { setActiveCategoryPanel(null); setShowCategories(true); setNavigationLevel(3); }
      }
    } catch(e){ console.error(e); } finally { setIsLoading(false); }
  };

  const handleBack = async () => {
    if (navigationLevel===2) await handleSendMessage("liste des catégories");
    else if (navigationLevel===3&&currentParent) await handleCategoryClick(currentParent);
    else { setShowCategories(false); setNavigationLevel(0); }
  };

  const handleCompareLastProducts = async (criteria='') => {
    await handleSendMessage(criteria?`comparer selon ${criteria}`:"comparer ces produits");
  };

  const handleClearConversation = () => {
    setMessages([{ role:"assistant", content:getWelcomeMessage(), products:[], comparison:null, action:null }]);
    setCurrentCategories([]); setShowCategories(false); setNavigationLevel(0); setCurrentParent(null); setActiveCategoryPanel(null);
  };

  const handleNewConversation = () => {
    const newId = conversations.length+1;
    setConversations(prev=>[...prev.map(c=>({...c,active:false})),{ id:newId, name:`Conversation ${newId}`, active:true }]);
    userIdRef.current = "user_"+Math.random().toString(36).substr(2,9);
    handleClearConversation();
  };

  const handleGoHome = () => { setIsFullOpen(false); navigate("/"); };

  const canCompare = (() => {
    for (let i=messages.length-1;i>=0;i--) {
      const m=messages[i];
      if (m.role==='assistant'&&m.products?.length>=2&&m.action==='show_products') return true;
    }
    return false;
  })();

  const handleKeyDown = (e) => {
    if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSendMessage(); }
  };

  // ── Bouton flottant ────────────────────────────────────────
  if (!isFullOpen) {
    return (
      <>
        <button onClick={()=>setIsFullOpen(true)}
          style={{ position:"fixed", bottom:28, right:28, zIndex:9999, width:62, height:62, borderRadius:"50%", background:C.gradPrimary, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 28px rgba(67,97,238,0.45)", animation:"cb-pulse 2.5s infinite", transition:"transform 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <img src="/chatbot.png" alt="Chat"
            style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover" }}
            onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
          <FaComments size={24} color="white" style={{ display:"none" }}/>
          <div style={{ position:"absolute", top:3, right:3, width:13, height:13, background:C.success, borderRadius:"50%", border:"2px solid white", animation:"cb-blink 2s infinite" }}/>
        </button>
        <style>{`
          @keyframes cb-pulse{0%,100%{box-shadow:0 8px 28px rgba(67,97,238,0.45),0 0 0 0 rgba(67,97,238,0.3)}50%{box-shadow:0 8px 28px rgba(67,97,238,0.45),0 0 0 12px rgba(67,97,238,0)}}
          @keyframes cb-blink{0%,100%{opacity:1}50%{opacity:0.4}}
        `}</style>
      </>
    );
  }

  // ── Interface plein écran ──────────────────────────────────
  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", fontFamily:"'DM Sans','Segoe UI',sans-serif", background:C.appBg }}>

        {/* ══ SIDEBAR ══════════════════════════════════════════ */}
        <div style={{ width:sidebarOpen?265:0, minWidth:sidebarOpen?265:0, background:C.sidebarBg, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden", transition:"all 0.3s ease", boxShadow:sidebarOpen?"3px 0 20px rgba(67,97,238,0.07)":"none" }}>

          {/* Logo + actions */}
          <div style={{ padding:"18px 14px 14px", background:"linear-gradient(160deg,#eef2ff,#f5f3ff)", borderBottom:`1px solid ${C.border}` }}>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:C.gradPrimary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 14px rgba(67,97,238,0.3)" }}>
                <IoSparkles size={17} color="white"/>
              </div>
              <div>
                <div style={{ color:C.textMain, fontWeight:800, fontSize:14, letterSpacing:-0.3 }}>UniverTechno+</div>
                <div style={{ color:C.textMuted, fontSize:10 }}>Assistant IA</div>
              </div>
            </div>

            {/* 🏠 Bouton Retour accueil */}
            <button onClick={handleGoHome}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 13px", width:"100%", borderRadius:10, background:"white", border:`1px solid ${C.chipBorder}`, color:C.primary, cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.2s", marginBottom:8, boxShadow:"0 2px 8px rgba(67,97,238,0.08)" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.chip;e.currentTarget.style.borderColor=C.borderMed;e.currentTarget.style.boxShadow="0 4px 14px rgba(67,97,238,0.14)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.borderColor=C.chipBorder;e.currentTarget.style.boxShadow="0 2px 8px rgba(67,97,238,0.08)";}}>
              <FaHome size={12} color={C.primary}/>
              {t.home}
            </button>

            {/* Nouvelle conversation */}
            <button onClick={handleNewConversation}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 13px", width:"100%", borderRadius:10, background:C.gradPrimary, border:"none", color:"white", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.2s", boxShadow:"0 4px 14px rgba(67,97,238,0.28)" }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <FaPlus size={11}/> {t.newChat}
            </button>
          </div>

          {/* Historique conversations */}
          <div style={{ flexGrow:1, overflowY:"auto", padding:"12px 10px" }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8, paddingLeft:6, fontWeight:600 }}>Récent</div>
            {conversations.map((conv) => (
              <div key={conv.id}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:9, background:conv.active?C.sideActive:"transparent", color:conv.active?C.primary:C.textSub, cursor:"pointer", fontSize:12, marginBottom:3, transition:"all 0.15s", border:conv.active?`1px solid ${C.sideActiveBorder}`:"1px solid transparent" }}
                onMouseEnter={e=>{ if(!conv.active) e.currentTarget.style.background="rgba(67,97,238,0.04)"; }}
                onMouseLeave={e=>{ if(!conv.active) e.currentTarget.style.background="transparent"; }}>
                <FaComments size={11}/>
                <span style={{ flexGrow:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{conv.name}</span>
              </div>
            ))}
          </div>

          {/* Sélecteur langue */}
          <div style={{ padding:"12px 12px", borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
              <FaLanguage size={11}/> Langue
            </div>
            <div style={{ display:"flex", gap:5 }}>
              {[['fr','🇫🇷 FR'],['en','🇬🇧 EN'],['ar','🇹🇳 AR']].map(([code,label]) => (
                <button key={code} onClick={()=>setLanguage(code)}
                  style={{ flex:1, padding:"6px 4px", borderRadius:8, background:language===code?C.gradPrimary:"transparent", border:language===code?"none":`1px solid ${C.border}`, color:language===code?"white":C.textSub, cursor:"pointer", fontSize:10, fontWeight:600, transition:"all 0.15s", boxShadow:language===code?"0 2px 8px rgba(67,97,238,0.25)":"none" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ZONE PRINCIPALE ══════════════════════════════════ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:`1px solid ${C.border}`, background:C.headerBg, flexShrink:0, boxShadow:"0 2px 14px rgba(67,97,238,0.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {/* Toggle sidebar */}
              <button onClick={()=>setSidebarOpen(!sidebarOpen)}
                style={{ width:36, height:36, borderRadius:10, background:C.chip, border:`1px solid ${C.border}`, color:C.textSub, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.chipHov;e.currentTarget.style.color=C.primary;}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.chip;e.currentTarget.style.color=C.textSub;}}>
                <FaBars size={13}/>
              </button>

              {/* Avatar + statut */}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", overflow:"hidden", border:`2px solid rgba(67,97,238,0.25)`, background:"#e0e7ff", flexShrink:0 }}>
                  <img src="/chatbot.png" alt="Bot" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display='none'}/>
                </div>
                <div>
                  <div style={{ color:C.textMain, fontWeight:700, fontSize:13 }}>Assistant UniverTechno+</div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:1 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:C.success }}/>
                    <span style={{ color:C.success, fontSize:10, fontWeight:500 }}>En ligne</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions header */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* 🏠 Lien accueil dans le header */}
              <button onClick={handleGoHome}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, background:C.chip, border:`1px solid ${C.chipBorder}`, color:C.primary, cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.chipHov;e.currentTarget.style.boxShadow="0 2px 10px rgba(67,97,238,0.13)";}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.chip;e.currentTarget.style.boxShadow="none";}}>
                <FaHome size={11}/> Accueil
              </button>

              <button onClick={handleClearConversation}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:9, background:"transparent", border:`1px solid ${C.border}`, color:C.textMuted, cursor:"pointer", fontSize:11, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#fff5f5";e.currentTarget.style.color=C.danger;e.currentTarget.style.borderColor="rgba(239,68,68,0.3)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMuted;e.currentTarget.style.borderColor=C.border;}}>
                <FaTrashAlt size={10}/> {t.clear}
              </button>

              <button onClick={()=>setIsFullOpen(false)}
                style={{ width:36, height:36, borderRadius:10, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)", color:C.danger, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.15)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.07)"}>
                <FaTimes size={13}/>
              </button>
            </div>
          </div>

          {/* ── Zone messages ─────────────────────────────────── */}
          <div style={{ flex:1, overflowY:"auto", padding:"28px 0", background:C.mainBg }}>
            <div style={{ maxWidth:800, margin:"0 auto", padding:"0 24px" }}>

              {messages.map((msg,index) => (
                <div key={index} style={{ marginBottom:24, animation:"cb-msgIn 0.25s ease" }}>
                  {msg.role==="user" ? (
                    /* ── Message utilisateur ── */
                    <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                      <div style={{ maxWidth:"72%", background:C.msgUserBg, borderRadius:"18px 18px 4px 18px", padding:"12px 16px", color:"white", fontSize:13, lineHeight:1.6, boxShadow:"0 4px 18px rgba(67,97,238,0.25)" }}>
                        <MessageContent content={msg.content} isUser={true}/>
                      </div>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:C.msgUserBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(67,97,238,0.3)" }}>
                        <FaUser size={13} color="white"/>
                      </div>
                    </div>
                  ) : (
                    /* ── Message assistant ── */
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", overflow:"hidden", flexShrink:0, border:`2px solid rgba(67,97,238,0.22)`, background:"#e0e7ff" }}>
                        <img src="/chatbot.png" alt="Bot" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display='none'}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        {/* Bulle message */}
                        <div style={{ background:C.msgBotBg, border:`1px solid ${C.msgBotBorder}`, borderRadius:"4px 18px 18px 18px", padding:"13px 16px", color:C.textMain, fontSize:13, lineHeight:1.7, boxShadow:"0 2px 12px rgba(67,97,238,0.06)" }}>
                          <MessageContent content={msg.content} isUser={false}/>
                        </div>

                        {/* Produits */}
                        {msg.products&&msg.products.length>0&&msg.action!=='show_comparison'&&(
                          <div style={{ marginTop:10 }}>
                            {msg.products.map((product,idx)=>(
                              <ProductCard key={idx} product={product} language={language}/>
                            ))}
                            {/* Boutons comparaison rapide */}
                            {msg.products.length>=2&&msg.action==='show_products'&&(
                              <div style={{ marginTop:10, padding:"12px 14px", borderRadius:12, background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", border:`1px solid rgba(67,97,238,0.14)` }}>
                                <div style={{ fontSize:10, color:C.textMuted, marginBottom:8, display:"flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:0.5, fontWeight:600 }}>
                                  <FaBalanceScale size={9}/> Comparer ces produits
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                                  {[
                                    { label:"📊 Complet", val:"" },
                                    { label:"💰 Prix", val:"prix" },
                                    { label:"📦 Stock", val:"stock" },
                                    { label:"🔥 Popularité", val:"commandes" },
                                    { label:"✅ Caractéristiques", val:"caractéristiques" },
                                    { label:"🔧 Specs", val:"spécifications" },
                                  ].map((btn,i)=>(
                                    <button key={i} onClick={()=>handleCompareLastProducts(btn.val)}
                                      style={{ padding:"5px 11px", borderRadius:20, background:"white", border:`1px solid ${C.chipBorder}`, color:C.primary, cursor:"pointer", fontSize:11, fontWeight:500, transition:"all 0.15s", boxShadow:"0 1px 4px rgba(67,97,238,0.08)" }}
                                      onMouseEnter={e=>{e.currentTarget.style.background=C.chip;e.currentTarget.style.boxShadow="0 2px 8px rgba(67,97,238,0.14)";}}
                                      onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.boxShadow="0 1px 4px rgba(67,97,238,0.08)";}}>
                                      {btn.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Vue comparaison */}
                        {msg.action==='show_comparison'&&msg.comparison&&(
                          <ComparisonView comparison={msg.comparison} products={msg.products} language={language} criteria={msg.comparison_criteria} keyword={msg.comparison_keyword}/>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Catégories */}
              {activeCategoryPanel&&activeCategoryPanel.categories.length>0&&(
                <div style={{ marginLeft:48, marginBottom:16 }}>
                  <CategoryButtons categories={activeCategoryPanel.categories} onCategoryClick={handleCategoryClick} level={activeCategoryPanel.level} parentName={activeCategoryPanel.parentName} language={language}/>
                </div>
              )}

              {/* Bouton retour */}
              {showCategories&&navigationLevel>=2&&(
                <div style={{ marginLeft:48, marginBottom:16 }}>
                  <button onClick={handleBack}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:20, background:"white", border:`1px solid ${C.border}`, color:C.textSub, cursor:"pointer", fontSize:11, transition:"all 0.15s", boxShadow:"0 1px 4px rgba(67,97,238,0.06)" }}
                    onMouseEnter={e=>{e.currentTarget.style.color=C.primary;e.currentTarget.style.borderColor=C.borderMed;}}
                    onMouseLeave={e=>{e.currentTarget.style.color=C.textSub;e.currentTarget.style.borderColor=C.border;}}>
                    <FaArrowLeft size={10}/> {t.back}
                  </button>
                </div>
              )}

              {/* Typing */}
              {isLoading&&(
                <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:24 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:C.gradPrimary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(67,97,238,0.28)" }}>
                    <IoSparkles size={14} color="white"/>
                  </div>
                  <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:"4px 18px 18px 18px", boxShadow:"0 2px 10px rgba(67,97,238,0.06)" }}>
                    <TypingIndicator/>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>
          </div>

          {/* ── Input ──────────────────────────────────────────── */}
          <div style={{ flexShrink:0, padding:"14px 20px 18px", background:C.headerBg, borderTop:`1px solid ${C.border}`, boxShadow:"0 -2px 14px rgba(67,97,238,0.04)" }}>
            <div style={{ maxWidth:800, margin:"0 auto" }}>

              {/* Suggestions */}
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {[
                  { label:"📋 Catégories", msg:"liste des catégories" },
                  { label:"💰 Pas chers", msg:"produits pas chers" },
                  { label:"🏆 Meilleur", msg:"meilleur produit" },
                  { label:"📦 En stock", msg:"produits en stock" },
                  ...(canCompare?[{ label:"📊 Comparer", msg:"comparer ces produits" }]:[]),
                ].map((s,i)=>(
                  <button key={i} onClick={()=>handleSendMessage(s.msg)}
                    style={{ padding:"5px 12px", borderRadius:20, background:C.chip, border:`1px solid ${C.chipBorder}`, color:C.textSub, cursor:"pointer", fontSize:11, transition:"all 0.15s", whiteSpace:"nowrap" }}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.chipHov;e.currentTarget.style.color=C.primary;e.currentTarget.style.borderColor=C.borderMed;e.currentTarget.style.boxShadow="0 2px 6px rgba(67,97,238,0.1)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background=C.chip;e.currentTarget.style.color=C.textSub;e.currentTarget.style.borderColor=C.chipBorder;e.currentTarget.style.boxShadow="none";}}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Zone saisie */}
              <div style={{ display:"flex", alignItems:"flex-end", gap:10, background:C.inputBg, border:`1.5px solid ${C.border}`, borderRadius:16, padding:"10px 12px", transition:"border-color 0.2s, box-shadow 0.2s", boxShadow:"0 2px 12px rgba(67,97,238,0.05)" }}
                onFocusCapture={e=>{e.currentTarget.style.borderColor="rgba(67,97,238,0.45)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(67,97,238,0.09)";}}
                onBlurCapture={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="0 2px 12px rgba(67,97,238,0.05)";}}>
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={e=>{ setInputMessage(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'; }}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  rows={1}
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", color:C.textMain, fontSize:13, lineHeight:1.6, resize:"none", fontFamily:"inherit", overflowY:"auto", minHeight:22, maxHeight:120, padding:0 }}
                />
                <button onClick={()=>handleSendMessage()}
                  disabled={isLoading||!inputMessage.trim()}
                  style={{ width:38, height:38, borderRadius:11, background:inputMessage.trim()?C.gradPrimary:"#e2e8f0", border:"none", cursor:inputMessage.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", boxShadow:inputMessage.trim()?"0 4px 12px rgba(67,97,238,0.3)":"none", opacity:inputMessage.trim()?1:0.5 }}>
                  <FaPaperPlane size={13} color={inputMessage.trim()?"white":C.textMuted}/>
                </button>
              </div>

              <div style={{ textAlign:"center", marginTop:7, fontSize:10, color:C.textMuted }}>
                Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cb-msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes cb-pulse{0%,100%{box-shadow:0 8px 28px rgba(67,97,238,0.45),0 0 0 0 rgba(67,97,238,0.3)}50%{box-shadow:0 8px 28px rgba(67,97,238,0.45),0 0 0 12px rgba(67,97,238,0)}}
        @keyframes cb-blink{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(67,97,238,0.18);border-radius:10px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(67,97,238,0.32)}
        *{box-sizing:border-box}
      `}</style>
    </>
  );
};

export default ChatBot;