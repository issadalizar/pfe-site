// ProductCard.jsx - Version corrigée avec route exacte
import { FaStar, FaArrowRight, FaBox } from "react-icons/fa";
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onView }) => {
  const navigate = useNavigate();

  // CORRECTION: Utiliser EXACTEMENT le même nom de paramètre que dans ProductDetails.jsx
  const handleDetailsClick = () => {
    if (onView) {
      onView(product._id);
    }
    // ProductDetails.jsx utilise useParams() avec { productName }
    // Donc la route doit être /product-details/:productName ou /product/:productName
    // D'après votre ProductDetails.jsx, le paramètre s'appelle 'productName'
    navigate(`/product/${encodeURIComponent(product.name)}`);
  };

  // Composant interne pour charger proprement une image produit
  const ProductImage = () => {
    const [currentSrc, setCurrentSrc] = React.useState("");
    const [failed, setFailed] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Fonction pour générer toutes les URLs possibles selon votre structure
      const generateImageUrls = () => {
        const urls = new Set();
        const tryExtensions = [
          ".png",
          ".jpg",
          ".jpeg",
          ".PNG",
          ".JPG",
          ".JPEG",
        ];

        // Obtenir les noms des catégories DIRECTEMENT depuis le produit
        const parentCategory = product.category?.parent?.name || "";
        const subCategory = product.category?.name || "";
        const productName = product.name || "";
        const productModel = product.model || "";

        // Nettoyer les noms pour les chemins
        const cleanName = (name) => {
          return (name || "")
            .replace(/[<>:"/\\|?*]/g, "")
            .replace(/\s+/g, " ")
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
        if (
          cleanParent.includes("CNC") ||
          cleanParent.includes("EDUCATION") ||
          cleanSub.includes("Turning") ||
          cleanSub.includes("Lathe") ||
          cleanSub.includes("Milling")
        ) {
          // CORRECTION: Utiliser des noms de clés UNIQUES pour éviter les doublons
          const cncProducts = {
            "De8 (iKC8) CNC Turning Machine":
              "De8 (iKC8) CNC Turning Machine.png",
            "De4-Pro (iKC4) Bench CNC Lathe":
              "De4-Pro (iKC4) Bench CNC Lathe.png",
            "De6 (iKC6S) CNC Turning Machine":
              "De6 (iKC6S) CNC Turning Machine.png",
            "De4-Eco (KC4S) Bench CNC Lathe":
              "De4-Eco (KC4S) Bench CNC Lathe.png",
            "PC1 Baby CNC Lathe-Mach (Version 1)":
              "PC1 Baby CNC Lathe-Mach.png", // Clé unique
            "De2-Ultra Mini CNC Turning Center":
              "De2-Ultra Mini CNC Turning Center.png",
            "Fa4-Eco (KX1S) CNC Milling Machine":
              "Fa4-Eco (KX1S) CNC Milling Machine.png",
            "PX1 Baby CNC Milling Machine": "PX1 Baby CNC Milling Machine.png",
            "Fa2-Ultra Mini CNC Milling Center":
              "Fa2-Ultra Mini CNC Milling Center.png",
            "PC1 Baby CNC Lathe-Mach (Version 2)":
              "PC2 Baby CNC Lathe-Mach.png", // Clé unique
            "PC1 Baby CNC Lathe-Mach (Version 3)":
              "PC2 Baby CNC Lathe-Mach-2.png", // Clé unique
          };

          for (const [prodName, fileName] of Object.entries(cncProducts)) {
            const productMatch = cleanProduct.toLowerCase();
            const prodNameLower = prodName.toLowerCase();

            const isMatch =
              productMatch.includes(prodNameLower.substring(0, 15)) ||
              prodNameLower.includes(productMatch.substring(0, 15)) ||
              cleanProduct.includes(prodName.substring(0, 20)) ||
              prodName.includes(cleanProduct.substring(0, 20));

            if (isMatch) {
              let subFolder = "";
              if (prodName.includes("Turning") || prodName.includes("Lathe")) {
                subFolder = "CNC Turning Machine";
              } else if (prodName.includes("Milling")) {
                subFolder = "CNC Milling Machine";
              }

              if (subFolder) {
                urls.add(
                  `/images/products/CNC EDUCATION/${subFolder}/${fileName}`,
                );
              }
              urls.add(`/images/products/CNC EDUCATION/${fileName}`);

              const fileNameNoParen = fileName.replace(/[()]/g, "");
              if (subFolder) {
                urls.add(
                  `/images/products/CNC EDUCATION/${subFolder}/${fileNameNoParen}`,
                );
              }
              urls.add(`/images/products/CNC EDUCATION/${fileNameNoParen}`);
            }
          }

          const cncSubFolders = ["CNC Milling Machine", "CNC Turning Machine"];
          for (const folder of cncSubFolders) {
            for (const ext of tryExtensions) {
              urls.add(
                `/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanProduct)}${ext}`,
              );
              urls.add(
                `/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanModel)}${ext}`,
              );
              const cleanProductNoParen = cleanProduct.replace(/[()]/g, "");
              urls.add(
                `/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanProductNoParen)}${ext}`,
              );
              const cleanProductDash = cleanProduct.replace(/\s+/g, "-");
              urls.add(
                `/images/products/CNC EDUCATION/${folder}/${encodeURIComponent(cleanProductDash)}${ext}`,
              );
            }
          }
        }

        // 3. DÉTECTION SPÉCIALE POUR LES PRODUITS MCP LAB ELECTRONICS
        const mcpLabReferences = ["PTL", "ACL", "M21", "F1-3"];
        const isMCPLabProduct = mcpLabReferences.some(
          (ref) =>
            cleanProduct.includes(ref) ||
            (cleanModel && cleanModel.includes(ref)),
        );

        const isMCPLabByCategory =
          cleanSub.includes("Accessoires") ||
          cleanSub.includes("EDUCATION EQUIPMENT") ||
          cleanSub.includes("Éducation Equipment") ||
          cleanParent.includes("MCP") ||
          cleanParent.includes("lab") ||
          cleanParent.includes("electronics");

        if (isMCPLabProduct || isMCPLabByCategory) {
          const mcpLabProducts = {
            Accessoires: {
              "PTL908-2H – High Voltage Safety Test Lead 10kV":
                "PTL908-2H – High Voltage Safety Test Lead 10kV.png",
              "PTL970 – Oscilloscope Probe 5kV":
                "PTL970 – Oscilloscope Probe 5kV.png",
              "PTL955 – Oscilloscope Probe 40kV":
                "PTL955 – Oscilloscope Probe 40kV.png",
              "PTL908-8 – Test Lead 4mm 20A":
                "PTL908-8 – Test Lead 4mm 20A.png",
              "PTL940 – Oscilloscope Probe 100MHz":
                "PTL940 – Oscilloscope Probe 100MHz.png",
              "PTL960 – Oscilloscope Probe 500MHz":
                "PTL960 – Oscilloscope Probe 500MHz.png",
            },
            "EDUCATION EQUIPMENT": {
              "ACL-7000 – Analogue Training System":
                "ACL-7000 – Analogue Training System.png",
              "M21-7100 – Digital & Analogue Training System":
                "M21-7100 – Digital & Analogue Training System.png",
              "F1-3 – Basic Logic Circuit Training System":
                "F1-3 – Basic Logic Circuit Training System.png",
            },
          };

          let targetSubCategory = "";
          const cleanSubLower = cleanSub.toLowerCase();

          if (
            cleanSubLower.includes("accessoires") ||
            cleanSubLower.includes("accessoire")
          ) {
            targetSubCategory = "Accessoires";
          } else if (
            cleanSubLower.includes("education") ||
            cleanSubLower.includes("equipment") ||
            cleanSubLower.includes("éducation") ||
            cleanSubLower.includes("équipement")
          ) {
            targetSubCategory = "EDUCATION EQUIPMENT";
          }

          if (!targetSubCategory) {
            if (
              cleanProduct.includes("ACL") ||
              cleanProduct.includes("M21") ||
              cleanProduct.includes("F1-3") ||
              cleanProduct.includes("Training") ||
              cleanProduct.includes("System")
            ) {
              targetSubCategory = "EDUCATION EQUIPMENT";
            } else if (
              cleanProduct.includes("PTL") ||
              cleanProduct.includes("Probe") ||
              cleanProduct.includes("Test Lead") ||
              cleanProduct.includes("Lead")
            ) {
              targetSubCategory = "Accessoires";
            }
          }

          if (targetSubCategory && mcpLabProducts[targetSubCategory]) {
            const subCategoryProducts = mcpLabProducts[targetSubCategory];

            for (const [prodName, fileName] of Object.entries(
              subCategoryProducts,
            )) {
              const productMatch = cleanProduct.toLowerCase();
              const prodNameLower = prodName.toLowerCase();

              const isMatch =
                productMatch.includes(prodNameLower.substring(0, 8)) ||
                prodNameLower.includes(productMatch.substring(0, 8)) ||
                (cleanModel && prodName.includes(cleanModel)) ||
                (cleanModel &&
                  cleanModel.includes(prodName.substring(0, 10))) ||
                cleanProduct.includes(prodName.substring(0, 15)) ||
                prodName.includes(cleanProduct.substring(0, 15));

              if (isMatch) {
                urls.add(
                  `/images/products/MCP lab electronics/${targetSubCategory}/${fileName}`,
                );

                const folderVariants = {
                  Accessoires: ["Accessoires", "ACCESSOIRES", "accessoires"],
                  "EDUCATION EQUIPMENT": [
                    "EDUCATION EQUIPMENT",
                    "Education Equipment",
                    "education equipment",
                    "Éducation Equipment",
                  ],
                };

                if (folderVariants[targetSubCategory]) {
                  for (const folder of folderVariants[targetSubCategory]) {
                    urls.add(
                      `/images/products/MCP lab electronics/${folder}/${fileName}`,
                    );
                  }
                }

                urls.add(`/images/products/MCP lab electronics/${fileName}`);

                const fileNameWithDash = fileName.replace(/\s+/g, "-");
                urls.add(
                  `/images/products/MCP lab electronics/${targetSubCategory}/${fileNameWithDash}`,
                );

                break;
              }
            }
          }

          if (cleanModel) {
            const allMCPSubFolders = ["Accessoires", "EDUCATION EQUIPMENT"];
            for (const folder of allMCPSubFolders) {
              for (const ext of tryExtensions) {
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModel)}${ext}`,
                );
                const cleanModelNoDash = cleanModel.replace(/-/g, "");
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModelNoDash)}${ext}`,
                );
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModel.toLowerCase())}${ext}`,
                );
              }
            }
          }

          const targetFolder = targetSubCategory || "Accessoires";
          if (targetFolder) {
            const mcpSubFolders = ["Accessoires", "EDUCATION EQUIPMENT"];
            for (const folder of mcpSubFolders) {
              for (const ext of tryExtensions) {
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanProduct)}${ext}`,
                );
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanModel)}${ext}`,
                );
                const cleanProductDash = cleanProduct.replace(/\s+/g, "-");
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanProductDash)}${ext}`,
                );
                const cleanProductSimple = cleanProduct
                  .replace(/[–—]/g, "-")
                  .replace(/\s+/g, " ");
                urls.add(
                  `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(cleanProductSimple)}${ext}`,
                );
                if (cleanModel) {
                  const modelSimple = cleanModel.split(" ")[0];
                  urls.add(
                    `/images/products/MCP lab electronics/${folder}/${encodeURIComponent(modelSimple)}${ext}`,
                  );
                }
              }
            }
          }
        }

        // 4. Générer les URLs pour les produits VOITURES
        if (
          cleanParent.toLowerCase().includes("voiture") ||
          cleanParent.toLowerCase().includes("voitures") ||
          cleanSub.includes("CAPTEURS") ||
          cleanSub.includes("ACTIONNEURS") ||
          cleanSub.includes("ÉLECTRICITÉ") ||
          cleanSub.includes("ELECTRICITE") ||
          cleanSub.includes("RÉSEAUX") ||
          cleanSub.includes("RESEAUX")
        ) {
          const voituresProducts = {
            "CAPTEURS ET ACTIONNEURS": {
              "DT-M002 – Mesure des Positions":
                "DT-M002 – Mesure des Positions.png",
              "DT-M001 – Mesure d'Angle de Volant": "produit2.png",
              "DT-E001 – Unité de Contrôle Électronique":
                "DT-E001 – Unité de Contrôle Électronique.png",
            },
            ÉLECTRICITÉ: {
              "DTM7020 – Modules Essuie-Glaces":
                "DTM7020 – Modules Essuie-Glaces.png",
              "DTM7000 – Modules Éclairage et Signalisation":
                "DTM7000 – Modules Éclairage et Signalisation.png",
              "DT-M005 – Mesure des Courants et des Tensions":
                "DT-M005 – Mesure des Courants et des Tensions.png",
              "MI2505 – Contrôleur Charge-Démarrage 12V/500A":
                "MI2505 – Contrôleur Charge-Démarrage 12V/500A.png",
              "MT-4002V – Maquette de Charge Démarrage 12V":
                "MT-4002V – Maquette de Charge Démarrage 12V.png",
            },
            "RÉSEAUX MULTIPLEXÉS": {
              "MT-MOTEUR-MECA – Maquette Diagnostic Mécanique Moteur":
                "MT-MOTEUR-MECA – Maquette Diagnostic Mécanique Moteur.png",
              "MT-E5000 – Maquette d'Injection Essence Séquentielle":
                "produit1.png",
              "MT-H9000 – Maquette d'Injection Diesel Common Rail":
                "produit2.png",
            },
          };

          let targetSubCategory = "";
          const cleanSubLower = cleanSub.toLowerCase();

          if (
            cleanSubLower.includes("capteurs") ||
            cleanSubLower.includes("actionneurs")
          ) {
            targetSubCategory = "CAPTEURS ET ACTIONNEURS";
          } else if (
            cleanSubLower.includes("électricité") ||
            cleanSubLower.includes("electricite")
          ) {
            targetSubCategory = "ÉLECTRICITÉ";
          } else if (
            cleanSubLower.includes("réseaux") ||
            cleanSubLower.includes("reseau") ||
            cleanSubLower.includes("multiplex")
          ) {
            targetSubCategory = "RÉSEAUX MULTIPLEXÉS";
          }

          if (targetSubCategory && voituresProducts[targetSubCategory]) {
            const subCategoryProducts = voituresProducts[targetSubCategory];

            for (const [prodName, fileName] of Object.entries(
              subCategoryProducts,
            )) {
              const productMatch = cleanProduct.toLowerCase();
              const prodNameLower = prodName.toLowerCase();

              const isMatch =
                productMatch.includes(prodNameLower.substring(0, 8)) ||
                prodNameLower.includes(productMatch.substring(0, 8)) ||
                (cleanModel && prodName.includes(cleanModel)) ||
                (cleanModel &&
                  cleanModel.includes(prodName.substring(0, 10))) ||
                cleanProduct.includes(prodName.substring(0, 15)) ||
                prodName.includes(cleanProduct.substring(0, 15));

              if (isMatch) {
                urls.add(
                  `/images/products/voitures/${targetSubCategory}/${fileName}`,
                );

                const folderVariants = {
                  "CAPTEURS ET ACTIONNEURS": [
                    "CAPTEURS ET ACTIONNEURS",
                    "CAPTEURS & ACTIONNEURS",
                    "CAPTEURS-ET-ACTIONNEURS",
                  ],
                  ÉLECTRICITÉ: ["ÉLECTRICITÉ", "ELECTRICITE", "ELECTRICITE"],
                  "RÉSEAUX MULTIPLEXÉS": [
                    "RÉSEAUX MULTIPLEXÉS",
                    "RESEAUX MULTIPLEXES",
                    "RESEAUX-MULTIPLEXES",
                  ],
                };

                if (folderVariants[targetSubCategory]) {
                  for (const folder of folderVariants[targetSubCategory]) {
                    urls.add(`/images/products/voitures/${folder}/${fileName}`);
                  }
                }

                urls.add(`/images/products/voitures/${fileName}`);

                const fileNameWithDash = fileName.replace(/\s+/g, "-");
                urls.add(
                  `/images/products/voitures/${targetSubCategory}/${fileNameWithDash}`,
                );

                break;
              }
            }
          }

          if (cleanModel) {
            const allVoitureSubFolders = [
              "CAPTEURS ET ACTIONNEURS",
              "ÉLECTRICITÉ",
              "RÉSEAUX MULTIPLEXÉS",
            ];
            for (const folder of allVoitureSubFolders) {
              for (const ext of tryExtensions) {
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanModel)}${ext}`,
                );
                const cleanModelNoDash = cleanModel.replace(/-/g, "");
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanModelNoDash)}${ext}`,
                );
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanModel.toLowerCase())}${ext}`,
                );
              }
            }
          }

          const targetFolder = targetSubCategory || cleanSub;
          if (targetFolder) {
            const voitureSubFolders = [
              "CAPTEURS ET ACTIONNEURS",
              "ÉLECTRICITÉ",
              "RÉSEAUX MULTIPLEXÉS",
            ];
            for (const folder of voitureSubFolders) {
              for (const ext of tryExtensions) {
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanProduct)}${ext}`,
                );
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanModel)}${ext}`,
                );
                const cleanProductDash = cleanProduct.replace(/\s+/g, "-");
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanProductDash)}${ext}`,
                );
                const cleanProductSimple = cleanProduct
                  .replace(/[–—]/g, "-")
                  .replace(/\s+/g, " ");
                urls.add(
                  `/images/products/voitures/${folder}/${encodeURIComponent(cleanProductSimple)}${ext}`,
                );
              }
            }
          }
        }

        // 5. Essayer les URLs directes
        if (cleanParent && cleanSub && cleanProduct) {
          for (const ext of tryExtensions) {
            urls.add(
              `/images/products/${encodeURIComponent(cleanParent)}/${encodeURIComponent(cleanSub)}/${encodeURIComponent(cleanProduct)}${ext}`,
            );
          }
        }

        if (cleanParent && cleanProduct) {
          for (const ext of tryExtensions) {
            urls.add(
              `/images/products/${encodeURIComponent(cleanParent)}/${encodeURIComponent(cleanProduct)}${ext}`,
            );
          }
        }

        if (cleanParent && cleanSub && cleanModel) {
          for (const ext of tryExtensions) {
            urls.add(
              `/images/products/${encodeURIComponent(cleanParent)}/${encodeURIComponent(cleanSub)}/${encodeURIComponent(cleanModel)}${ext}`,
            );
          }
        }

        for (const ext of tryExtensions) {
          urls.add(
            `/images/products/${encodeURIComponent(cleanProduct)}${ext}`,
          );
          urls.add(`/images/products/${encodeURIComponent(cleanModel)}${ext}`);
        }

        // Avant de retourner, s'assurer que toutes les URLs sont correctement encodées
        return Array.from(urls).map((u) => {
          try {
            return encodeURI(u);
          } catch (e) {
            return u;
          }
        });
      };

      const urls = generateImageUrls();

      const testUrl = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ url, valid: true });
          img.onerror = () => resolve({ url, valid: false });
          img.src = url;
        });
      };

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

        setFailed(true);
        setCurrentSrc("");
        setLoading(false);
      };

      findValidImage();
    }, [product]);

    if (loading) {
      return (
        <div
          style={{
            width: "100%",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      );
    }

    if (failed || !currentSrc) {
      return (
        <div
          style={{
            width: "100%",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
          }}
        >
          <FaBox className="text-muted" size={48} />
        </div>
      );
    }

    return (
      <img
        src={currentSrc}
        alt={product.name}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          padding: "20px",
        }}
        onError={() => setFailed(true)}
      />
    );
  };

  const renderStars = (rating = 4.5) => {
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            size={14}
            color={i < Math.floor(rating) ? "#ffc107" : "#ccc"}
          />
        ))}
        <small className="text-muted ms-1">{rating}/5</small>
      </div>
    );
  };

  return (
    <div className="product-card card h-100 border-0 shadow-sm hover-shadow">
      <div className="product-image-wrapper bg-light">
        <ProductImage />
      </div>
      <div className="card-body">
        <h5 className="card-title fw-bold mb-2 text-truncate">
          {product.name}
        </h5>
        <p className="card-text text-muted small mb-3">
          {product.description?.substring(0, 60)}
          {product.description?.length > 60 ? "..." : ""}
        </p>
        <div className="mb-3">{renderStars(product.rating || 4.5)}</div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="h5 mb-0 text-primary fw-bold">
            {product.price || 0}€
          </span>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleDetailsClick}
          >
            Détails{" "}
            <FaArrowRight className="ms-1" style={{ fontSize: "0.8rem" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    rating: PropTypes.number,
    category: PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    model: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
};

export default ProductCard;
