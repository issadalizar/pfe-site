import React from "react";
import { 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaBox,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaStar,
  FaEuroSign,
  FaCube,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

export default function ProductList({ 
  products, 
  onEdit, 
  onDelete,
  onView,
  loading,
  sortConfig,
  onSort,
  selectedProducts = [],
  onSelectProduct,
  onSelectAll 
}) {
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        badge: "danger",
        text: "Rupture",
        icon: <FaTimesCircle className="me-1" />
      };
    }
    if (stock < 5) {
      return {
        badge: "warning",
        text: "Faible",
        icon: <FaCube className="me-1" />
      };
    }
    return {
      badge: "success",
      text: "Disponible",
      icon: <FaCheckCircle className="me-1" />
    };
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  // Composant interne pour charger proprement une image produit
  function ProductImage({ product }) {
    const [currentSrc, setCurrentSrc] = React.useState('');
    const [failed, setFailed] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Fonction pour générer toutes les URLs possibles selon votre structure
      const generateImageUrls = () => {
        const urls = new Set();
        const tryExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
        
        // Obtenir les noms des catégories DIRECTEMENT depuis le produit
        const parentCategory = product.category?.parent?.name || '';
        const subCategory = product.category?.name || '';
        const productName = product.name || '';
        const productModel = product.model || '';
        
        console.log("🔍 Produit info:", {
          name: productName,
          model: productModel,
          category: subCategory,
          parent: parentCategory
        });
        
        // Nettoyer les noms pour les chemins
        const cleanName = (name) => {
          return (name || '')
            .replace(/[<>:"/\\|?*]/g, '') // Enlever les caractères invalides pour les chemins
            .replace(/\s+/g, ' ')
            .trim();
        };
        
        const cleanParent = cleanName(parentCategory);
        const cleanSub = cleanName(subCategory);
        const cleanProduct = cleanName(productName);
        const cleanModel = cleanName(productModel);
        
        // 1. D'abord essayer l'image stockée en base
        if (product.image) {
          urls.add(product.image);
        }
        
        // 2. Générer les noms de fichier exacts pour TOUS les produits CNC EDUCATION
        if (cleanParent.includes('CNC') || cleanParent.includes('EDUCATION') || 
            cleanSub.includes('Turning') || cleanSub.includes('Lathe') || 
            cleanSub.includes('Milling')) {
          
          // TOUS les produits CNC EDUCATION avec leurs noms de fichier exacts
          const cncProducts = {
            // CNC Turning Machine products
            'DTS-011 à DTS-016 – Electrical Training System': 'DTS-011 à DTS-016 – Electrical Training System.png',
            'De8 (iKC8) CNC Turning Machine': 'De8 (iKC8) CNC Turning Machine.png',
            'De4-Pro (iKC4) Bench CNC Lathe': 'De4-Pro (iKC4) Bench CNC Lathe.png',
            'De6 (iKC6S) CNC Turning Machine': 'De6 (iKC6S) CNC Turning Machine.png',
            'De4-Eco (KC4S) Bench CNC Lathe': 'De4-Eco (KC4S) Bench CNC Lathe.png',
            'PC1 Baby CNC Lathe-Mach': 'PC1 Baby CNC Lathe-Mach.png',
            'De2-Ultra Mini CNC Turning Center': 'De2-Ultra Mini CNC Turning Center.png',
            
            // CNC Milling Machine products
            'Fa4-Eco (KX1S) CNC Milling Machine': 'Fa4-Eco (KX1S) CNC Milling Machine.png',
            'PX1 Baby CNC Milling Machine': 'PX1 Baby CNC Milling Machine.png',
            'Fa2-Ultra Mini CNC Milling Center': 'Fa2-Ultra Mini CNC Milling Center.png'
          };
          
          // Chercher le nom exact du fichier pour ce produit
          for (const [prodName, fileName] of Object.entries(cncProducts)) {
            // Recherche plus intelligente pour les correspondances
            const productMatch = cleanProduct.toLowerCase();
            const prodNameLower = prodName.toLowerCase();
            
            // Vérifier plusieurs types de correspondance
            const isMatch = 
              productMatch.includes(prodNameLower.substring(0, 15)) ||
              prodNameLower.includes(productMatch.substring(0, 15)) ||
              cleanProduct.includes(prodName.substring(0, 20)) ||
              prodName.includes(cleanProduct.substring(0, 20));
            
            if (isMatch) {
              console.log(`✅ Match trouvé: ${cleanProduct} -> ${fileName}`);
              
              // Déterminer le bon sous-dossier
              let subFolder = '';
              if (prodName.includes('Turning') || prodName.includes('Lathe')) {
                subFolder = 'CNC Turing Machine';
              } else if (prodName.includes('Milling')) {
                subFolder = 'CNC Milling Machine';
              }
              
              if (subFolder) {
                // Chemin spécifique au sous-dossier
                urls.add(`/images/products/CNC EDUCATION/${subFolder}/${fileName}`);
              }
              
              // Chemin racine CNC EDUCATION
              urls.add(`/images/products/CNC EDUCATION/${fileName}`);
              
              // Ajouter aussi des variantes sans parenthèses
              const fileNameNoParen = fileName.replace(/[()]/g, '');
              if (subFolder) {
                urls.add(`/images/products/CNC EDUCATION/${subFolder}/${fileNameNoParen}`);
              }
              urls.add(`/images/products/CNC EDUCATION/${fileNameNoParen}`);
            }
          }
          
          // Ajouter aussi les chemins génériques pour TOUS les sous-dossiers CNC
          const cncSubFolders = ['CNC Milling Machine', 'CNC Turing Machine'];
          for (const folder of cncSubFolders) {
            for (const ext of tryExtensions) {
              // Produit par nom
              urls.add(`/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanProduct)}${ext}`);
              // Produit par modèle
              urls.add(`/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanModel)}${ext}`);
              // Variante sans parenthèses
              const cleanProductNoParen = cleanProduct.replace(/[()]/g, '');
              urls.add(`/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanProductNoParen)}${ext}`);
              // Variante avec tirets
              const cleanProductDash = cleanProduct.replace(/\s+/g, '-');
              urls.add(`/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanProductDash)}${ext}`);
            }
          }
        }
        
        // 3. DÉTECTION SPÉCIALE POUR LES PRODUITS MCP LAB ELECTRONICS
        // Basé sur les références des produits (PTL, ACL, M21, F1-3, etc.)
        const mcpLabReferences = ['PTL', 'ACL', 'M21', 'F1-3'];
        const isMCPLabProduct = mcpLabReferences.some(ref => 
          cleanProduct.includes(ref) || (cleanModel && cleanModel.includes(ref))
        );
        
        // Vérifier aussi par catégorie
        const isMCPLabByCategory = 
          cleanSub.includes('Accessoires') || 
          cleanSub.includes('EDUCATION EQUIPMENT') ||
          cleanSub.includes('Éducation Equipment') ||
          cleanParent.includes('MCP') ||
          cleanParent.includes('lab') ||
          cleanParent.includes('electronics');
        
        if (isMCPLabProduct || isMCPLabByCategory) {
          console.log("🔬 Produit MCP Lab Electronics détecté:", cleanProduct, "Sous-catégorie:", cleanSub, "Modèle:", cleanModel);
          
          // Dictionnaire complet de tous les produits MCP Lab Electronics avec leurs noms de fichier exacts
          const mcpLabProducts = {
            // Produits ACCESSOIRES
            'Accessoires': {
              'PTL908-2H – High Voltage Safety Test Lead 10kV': 'PTL908-2H – High Voltage Safety Test Lead 10kV.png',
              'PTL970 – Oscilloscope Probe 5kV': 'PTL970 – Oscilloscope Probe 5kV.png',
              'PTL955 – Oscilloscope Probe 40kV': 'PTL955 – Oscilloscope Probe 40kV.png',
              'PTL908-8 – Test Lead 4mm 20A': 'PTL908-8 – Test Lead 4mm 20A.png',
              'PTL940 – Oscilloscope Probe 100MHz': 'PTL940 – Oscilloscope Probe 100MHz.png',
              'PTL960 – Oscilloscope Probe 500MHz': 'PTL960 – Oscilloscope Probe 500MHz.png'
            },
            // Produits EDUCATION EQUIPMENT
            'EDUCATION EQUIPMENT': {
              'ACL-7000 – Analogue Training System': 'ACL-7000 – Analogue Training System.png',
              'M21-7100 – Digital & Analogue Training System': 'M21-7100 – Digital & Analogue Training System.png',
              'F1-3 – Basic Logic Circuit Training System': 'F1-3 – Basic Logic Circuit Training System.png'
            }
          };
          
          // Trouver la sous-catégorie correspondante
          let targetSubCategory = '';
          const cleanSubLower = cleanSub.toLowerCase();
          
          if (cleanSubLower.includes('accessoires') || cleanSubLower.includes('accessoire')) {
            targetSubCategory = 'Accessoires';
          } else if (cleanSubLower.includes('education') || cleanSubLower.includes('equipment') || 
                     cleanSubLower.includes('éducation') || cleanSubLower.includes('équipement')) {
            targetSubCategory = 'EDUCATION EQUIPMENT';
          }
          
          // Si la sous-catégorie n'est pas détectée, essayer de la deviner par le produit
          if (!targetSubCategory) {
            // Produits de type EDUCATION EQUIPMENT
            if (cleanProduct.includes('ACL') || cleanProduct.includes('M21') || cleanProduct.includes('F1-3') ||
                cleanProduct.includes('Training') || cleanProduct.includes('System')) {
              targetSubCategory = 'EDUCATION EQUIPMENT';
            }
            // Produits de type Accessoires
            else if (cleanProduct.includes('PTL') || 
                     cleanProduct.includes('Probe') || 
                     cleanProduct.includes('Test Lead') ||
                     cleanProduct.includes('Lead')) {
              targetSubCategory = 'Accessoires';
            }
          }
          
          console.log(`🎯 Sous-catégorie détectée: ${targetSubCategory} pour ${cleanProduct}`);
          
          // Chercher le nom exact du fichier pour ce produit
          if (targetSubCategory && mcpLabProducts[targetSubCategory]) {
            const subCategoryProducts = mcpLabProducts[targetSubCategory];
            
            for (const [prodName, fileName] of Object.entries(subCategoryProducts)) {
              // Recherche de correspondance améliorée
              const productMatch = cleanProduct.toLowerCase();
              const prodNameLower = prodName.toLowerCase();
              
              // Recherche plus flexible pour détecter les correspondances
              const isMatch = 
                // Correspondance par les premiers caractères
                productMatch.includes(prodNameLower.substring(0, 8)) ||
                prodNameLower.includes(productMatch.substring(0, 8)) ||
                // Correspondance par modèle (référence)
                (cleanModel && prodName.includes(cleanModel)) ||
                (cleanModel && cleanModel.includes(prodName.substring(0, 10))) ||
                // Correspondance par nom complet
                cleanProduct.includes(prodName.substring(0, 15)) ||
                prodName.includes(cleanProduct.substring(0, 15));
              
              if (isMatch) {
                console.log(`✅ Match MCP Lab trouvé: ${cleanProduct} -> ${fileName} (${targetSubCategory})`);
                
                // Chemin spécifique pour la sous-catégorie
                urls.add(`/images/products/MCP lab electronics/${targetSubCategory}/${fileName}`);
                
                // Ajouter aussi les variantes de nom de dossier
                const folderVariants = {
                  'Accessoires': ['Accessoires', 'ACCESSOIRES', 'accessoires'],
                  'EDUCATION EQUIPMENT': ['EDUCATION EQUIPMENT', 'Education Equipment', 'education equipment', 'Éducation Equipment']
                };
                
                if (folderVariants[targetSubCategory]) {
                  for (const folder of folderVariants[targetSubCategory]) {
                    urls.add(`/images/products/MCP lab electronics/${folder}/${fileName}`);
                  }
                }
                
                // Chemin racine MCP lab electronics
                urls.add(`/images/products/MCP lab electronics/${fileName}`);
                
                // Ajouter aussi des variantes avec tirets au lieu d'espaces
                const fileNameWithDash = fileName.replace(/\s+/g, '-');
                urls.add(`/images/products/MCP lab electronics/${targetSubCategory}/${fileNameWithDash}`);
                
                break; // Arrêter après avoir trouvé une correspondance
              }
            }
          }
          
          // Recherche avancée pour les produits qui ne correspondent pas exactement
          // Recherche par modèle (référence)
          if (cleanModel) {
            // Essayer avec toutes les sous-catégories
            const allMCPSubFolders = ['Accessoires', 'EDUCATION EQUIPMENT'];
            
            for (const folder of allMCPSubFolders) {
              for (const ext of tryExtensions) {
                // Essayer avec le modèle exact
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModel)}${ext}`);
                
                // Essayer avec le modèle sans tirets
                const cleanModelNoDash = cleanModel.replace(/-/g, '');
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModelNoDash)}${ext}`);
                
                // Essayer avec le modèle en minuscules
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModel.toLowerCase())}${ext}`);
              }
            }
          }
          
          // Si aucune correspondance exacte n'est trouvée, essayer les chemins génériques
          // Déterminer le dossier cible basé sur la sous-catégorie
          const targetFolder = targetSubCategory || 'Accessoires'; // Par défaut Accessoires
          
          if (targetFolder) {
            // Ajouter les chemins génériques pour tous les sous-dossiers MCP
            const mcpSubFolders = [
              'Accessoires',
              'EDUCATION EQUIPMENT'
            ];
            
            for (const folder of mcpSubFolders) {
              for (const ext of tryExtensions) {
                // Produit par nom
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanProduct)}${ext}`);
                // Produit par modèle
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModel)}${ext}`);
                // Variante avec tirets
                const cleanProductDash = cleanProduct.replace(/\s+/g, '-');
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanProductDash)}${ext}`);
                // Variante sans caractères spéciaux
                const cleanProductSimple = cleanProduct.replace(/[–—]/g, '-').replace(/\s+/g, ' ');
                urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanProductSimple)}${ext}`);
                // Variante avec seulement la référence (ex: PTL908-2H)
                if (cleanModel) {
                  const modelSimple = cleanModel.split(' ')[0]; // Prendre juste la référence
                  urls.add(`/images/products/MCP lab electronics/${folder}/${encodeURIComponent(modelSimple)}${ext}`);
                }
              }
            }
          }
        }
        
        // 4. Générer les URLs pour les produits VOITURES - TOUTES LES SOUS-CATÉGORIES
        if (cleanParent.toLowerCase().includes('voiture') || cleanParent.toLowerCase().includes('voitures') ||
            cleanSub.includes('CAPTEURS') || cleanSub.includes('ACTIONNEURS') ||
            cleanSub.includes('ÉLECTRICITÉ') || cleanSub.includes('ELECTRICITE') ||
            cleanSub.includes('RÉSEAUX') || cleanSub.includes('RESEAUX')) {
          
          console.log("🚗 Produit voiture détecté:", cleanProduct, "Sous-catégorie:", cleanSub);
          
          // Dictionnaire complet de tous les produits voitures avec leurs noms de fichier exacts
          const voituresProducts = {
            // Produits CAPTEURS ET ACTIONNEURS
            'CAPTEURS ET ACTIONNEURS': {
              'DT-M003 – Mesure de Vitesse de Roue': 'DT-M003 – Mesure de Vitesse de Roue.png',
              'DT-M002 – Mesure des Positions': 'DT-M002 – Mesure des Positions.png',
              'DT-M001 – Mesure d\'Angle de Volant': 'DT-M001 – Mesure d\'Angle de Volant.png',
              'DT-E001 – Unité de Contrôle Électronique': 'DT-E001 – Unité de Contrôle Électronique.png'
            },
            // Produits ÉLECTRICITÉ
            'ÉLECTRICITÉ': {
              'DTM7020 – Modules Essuie-Glaces': 'DTM7020 – Modules Essuie-Glaces.png',
              'DTM7000 – Modules Éclairage et Signalisation': 'DTM7000 – Modules Éclairage et Signalisation.png',
              'DT-M005 – Mesure des Courants et des Tensions': 'DT-M005 – Mesure des Courants et des Tensions.png',
              'MI2505 – Contrôleur Charge-Démarrage 12V/500A': 'MI2505 – Contrôleur Charge-Démarrage 12V/500A.png',
              'MT-4002V – Maquette de Charge Démarrage 12V': 'MT-4002V – Maquette de Charge Démarrage 12V.png'
            },
            // Produits RÉSEAUX MULTIPLEXÉS
            'RÉSEAUX MULTIPLEXÉS': {
              'MT-MOTEUR-MECA – Maquette Diagnostic Mécanique Moteur': 'MT-MOTEUR-MECA – Maquette Diagnostic Mécanique Moteur.png',
              'MT-E5000 – Maquette d\'Injection Essence Séquentielle': 'MT-E5000 – Maquette d\'Injection Essence Séquentielle.png',
              'MT-H9000 – Maquette d\'Injection Diesel Common Rail': 'MT-H9000 – Maquette d\'Injection Diesel Common Rail.png'
            }
          };
          
          // Trouver la sous-catégorie correspondante
          let targetSubCategory = '';
          const cleanSubLower = cleanSub.toLowerCase();
          
          if (cleanSubLower.includes('capteurs') || cleanSubLower.includes('actionneurs')) {
            targetSubCategory = 'CAPTEURS ET ACTIONNEURS';
          } else if (cleanSubLower.includes('électricité') || cleanSubLower.includes('electricite')) {
            targetSubCategory = 'ÉLECTRICITÉ';
          } else if (cleanSubLower.includes('réseaux') || cleanSubLower.includes('reseau') || cleanSubLower.includes('multiplex')) {
            targetSubCategory = 'RÉSEAUX MULTIPLEXÉS';
          }
          
          // Chercher le nom exact du fichier pour ce produit
          if (targetSubCategory && voituresProducts[targetSubCategory]) {
            const subCategoryProducts = voituresProducts[targetSubCategory];
            
            for (const [prodName, fileName] of Object.entries(subCategoryProducts)) {
              // Recherche de correspondance améliorée pour les produits voitures
              const productMatch = cleanProduct.toLowerCase();
              const prodNameLower = prodName.toLowerCase();
              
              // Recherche plus flexible pour détecter les correspondances
              const isMatch = 
                // Correspondance par les premiers caractères
                productMatch.includes(prodNameLower.substring(0, 8)) ||
                prodNameLower.includes(productMatch.substring(0, 8)) ||
                // Correspondance par modèle (référence)
                (cleanModel && prodName.includes(cleanModel)) ||
                (cleanModel && cleanModel.includes(prodName.substring(0, 10))) ||
                // Correspondance par nom complet
                cleanProduct.includes(prodName.substring(0, 15)) ||
                prodName.includes(cleanProduct.substring(0, 15));
              
              if (isMatch) {
                console.log(`✅ Match voiture trouvé: ${cleanProduct} -> ${fileName} (${targetSubCategory})`);
                
                // Chemin spécifique pour la sous-catégorie
                urls.add(`/images/products/voitures/${targetSubCategory}/${fileName}`);
                
                // Ajouter aussi les variantes de nom de dossier
                const folderVariants = {
                  'CAPTEURS ET ACTIONNEURS': ['CAPTEURS ET ACTIONNEURS', 'CAPTEURS & ACTIONNEURS', 'CAPTEURS-ET-ACTIONNEURS'],
                  'ÉLECTRICITÉ': ['ÉLECTRICITÉ', 'ELECTRICITE', 'ELECTRICITE'],
                  'RÉSEAUX MULTIPLEXÉS': ['RÉSEAUX MULTIPLEXÉS', 'RESEAUX MULTIPLEXES', 'RESEAUX-MULTIPLEXES']
                };
                
                if (folderVariants[targetSubCategory]) {
                  for (const folder of folderVariants[targetSubCategory]) {
                    urls.add(`/images/products/voitures/${folder}/${fileName}`);
                  }
                }
                
                // Chemin racine voitures
                urls.add(`/images/products/voitures/${fileName}`);
                
                // Ajouter aussi des variantes avec tirets au lieu d'espaces
                const fileNameWithDash = fileName.replace(/\s+/g, '-');
                urls.add(`/images/products/voitures/${targetSubCategory}/${fileNameWithDash}`);
                
                break; // Arrêter après avoir trouvé une correspondance
              }
            }
          }
          
          // Recherche avancée pour les produits qui ne correspondent pas exactement
          // Recherche par modèle (référence)
          if (cleanModel) {
            // Essayer avec toutes les sous-catégories
            const allVoitureSubFolders = ['CAPTEURS ET ACTIONNEURS', 'ÉLECTRICITÉ', 'RÉSEAUX MULTIPLEXÉS'];
            
            for (const folder of allVoitureSubFolders) {
              for (const ext of tryExtensions) {
                // Essayer avec le modèle exact
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanModel)}${ext}`);
                
                // Essayer avec le modèle sans tirets
                const cleanModelNoDash = cleanModel.replace(/-/g, '');
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanModelNoDash)}${ext}`);
                
                // Essayer avec le modèle en minuscules
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanModel.toLowerCase())}${ext}`);
              }
            }
          }
          
          // Si aucune correspondance exacte n'est trouvée, essayer les chemins génériques
          // Déterminer le dossier cible basé sur la sous-catégorie
          const targetFolder = targetSubCategory || cleanSub;
          
          if (targetFolder) {
            // Ajouter les chemins génériques pour tous les sous-dossiers voitures
            const voitureSubFolders = [
              'CAPTEURS ET ACTIONNEURS',
              'ÉLECTRICITÉ',
              'RÉSEAUX MULTIPLEXÉS'
            ];
            
            for (const folder of voitureSubFolders) {
              for (const ext of tryExtensions) {
                // Produit par nom
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanProduct)}${ext}`);
                // Produit par modèle
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanModel)}${ext}`);
                // Variante avec tirets
                const cleanProductDash = cleanProduct.replace(/\s+/g, '-');
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanProductDash)}${ext}`);
                // Variante sans caractères spéciaux
                const cleanProductSimple = cleanProduct.replace(/[–—]/g, '-').replace(/\s+/g, ' ');
                urls.add(`/images/products/voitures/${folder}/${encodeURIComponent(cleanProductSimple)}${ext}`);
              }
            }
          }
        }
        
        // 5. Essayer les URLs directes (comme dans votre structure de dossiers)
        // Structure: /images/products/PARENT/SUBCATEGORY/PRODUCT.extension
        if (cleanParent && cleanSub && cleanProduct) {
          for (const ext of tryExtensions) {
            urls.add(`/images/products/${encodeURIComponent(cleanParent)}/${encodeURIComponent(cleanSub)}/${encodeURIComponent(cleanProduct)}${ext}`);
          }
        }
        
        // 6. Structure alternative: /images/products/PARENT/PRODUCT.extension
        if (cleanParent && cleanProduct) {
          for (const ext of tryExtensions) {
            urls.add(`/images/products/${encodeURIComponent(cleanParent)}/${encodeURIComponent(cleanProduct)}${ext}`);
          }
        }
        
        // 7. Structure avec modèle au lieu du nom
        if (cleanParent && cleanSub && cleanModel) {
          for (const ext of tryExtensions) {
            urls.add(`/images/products/${encodeURIComponent(cleanParent)}/${encodeURIComponent(cleanSub)}/${encodeURIComponent(cleanModel)}${ext}`);
          }
        }
        
        // 8. Recherche par nom de produit seul (dossier racine)
        for (const ext of tryExtensions) {
          urls.add(`/images/products/${encodeURIComponent(cleanProduct)}${ext}`);
          urls.add(`/images/products/${encodeURIComponent(cleanModel)}${ext}`);
        }
        
        console.log("📁 URLs générées pour", cleanProduct, ":", Array.from(urls));
        return Array.from(urls);
      };
      
      const urls = generateImageUrls();
      
      // Fonction pour tester une URL
      const testUrl = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log("✅ Image trouvée:", url);
            resolve({ url, valid: true });
          };
          img.onerror = () => {
            console.log("❌ Image non trouvée:", url);
            resolve({ url, valid: false });
          };
          img.src = url;
        });
      };
      
      // Tester les URLs séquentiellement jusqu'à en trouver une valide
      const findValidImage = async () => {
        setLoading(true);
        
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          try {
            const result = await testUrl(url);
            if (result.valid) {
              setCurrentSrc(url);
              setFailed(false);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.log(`Failed to load image: ${url}`);
          }
        }
        
        // Si aucune URL n'est valide
        setFailed(true);
        setCurrentSrc('');
        setLoading(false);
      };
      
      findValidImage();
    }, [product]);

    if (loading) {
      return (
        <div 
          className="rounded me-3 d-flex align-items-center justify-content-center"
          style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6'
          }}
        >
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      );
    }

    if (failed || !currentSrc) {
      return (
        <div 
          className="rounded me-3 d-flex align-items-center justify-content-center"
          style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6'
          }}
        >
          <FaBox className="text-muted" size={24} />
        </div>
      );
    }

    return (
      <img
        src={currentSrc}
        alt={product.name}
        className="rounded me-3"
        style={{
          width: '60px',
          height: '60px',
          objectFit: 'cover',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}
        onError={() => setFailed(true)}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des produits...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-5">
        <FaBox className="text-muted mb-3" size={48} />
        <h5 className="text-muted">Aucun produit trouvé</h5>
        <p className="text-muted">
          Commencez par créer votre premier produit
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead className="table-light">
          <tr>
            {onSelectProduct && (
              <th width="50">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={onSelectAll}
                  />
                </div>
              </th>
            )}
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('name')}
            >
              <div className="d-flex align-items-center">
                <span>Produit</span>
                <span className="ms-1">{getSortIcon('name')}</span>
              </div>
            </th>
            <th>Catégorie</th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('price')}
            >
              <div className="d-flex align-items-center">
                <FaEuroSign className="me-1" />
                <span>Prix</span>
                <span className="ms-1">{getSortIcon('price')}</span>
              </div>
            </th>
            <th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('stock')}
            >
              <div className="d-flex align-items-center">
                <span>Stock</span>
                <span className="ms-1">{getSortIcon('stock')}</span>
              </div>
            </th>
            <th>Statut</th>
            <th width="150">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock || 0);
            
            return (
              <tr key={product._id} className="align-middle">
                {onSelectProduct && (
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => onSelectProduct(product._id)}
                      />
                    </div>
                  </td>
                )}
                <td>
                  <div className="d-flex align-items-center">
                    <ProductImage product={product} />
                    <div>
                      <strong className="d-block">{product.name}</strong>
                      {product.model && (
                        <small className="text-muted d-block">
                          Ref: {product.model}
                        </small>
                      )}
                      {product.isFeatured && (
                        <small className="text-warning d-block">
                          <FaStar size={12} /> En vedette
                        </small>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">
                    {product.category?.icon} {product.category?.name}
                    {product.category?.parent && (
                      <small className="d-block text-muted">
                        {product.category.parent.name}
                      </small>
                    )}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaEuroSign className="text-muted me-1" />
                    <strong className="text-primary">
                      {typeof product.price === 'number' 
                        ? product.price.toFixed(2) 
                        : '0.00'} €
                    </strong>
                  </div>
                </td>
                <td>
                  <span className="fw-bold">
                    {product.stock || 0}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${stockStatus.badge}`}>{stockStatus.text}</span>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    {onView && (
                      <button
                        className="btn btn-outline-info"
                        onClick={() => onView(product)}
                        title="Voir détails"
                      >
                        <FaEye />
                      </button>
                    )}
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                        title="Ouvrir le lien"
                      >
                        <FaEye />
                      </a>
                    )}
                    {onEdit && (
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => onEdit(product)}
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => onDelete(product._id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}