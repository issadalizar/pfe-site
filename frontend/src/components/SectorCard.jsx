import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SectorCard = ({ category, index }) => {
  const navigate = useNavigate();
  const colors = ["#0066cc", "#ff9900", "#0099ff", "#666666"];
  
  // Fonction pour obtenir l'icône basée sur le nom de la catégorie
  const getSectorIcon = () => {
    if (category.name === "CNC for Education") {
      return "⚙️";
    }
    if (category.name === "Voiture") {
      return "🚗";
    }
    if (category.name === "MCP lab electronics") {
      return "🔬";
    }
    return "🖥️";
  };

  // Fonction pour obtenir l'image du secteur
  const getSectorImage = () => {
    if (category.name === "CNC for Education") {
      return '/education.png';
    }
    if (category.name === "Voiture") {
      return '/voiture.png';
    }
    if (category.name === "MCP lab electronics") {
      return '/electricite.jpg';
    }
    return null;
  };

  const sectorImage = getSectorImage();
  const sectorIcon = getSectorIcon();
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    console.log("🖱️ Clic sur carte - Catégorie:", category.name);
    console.log("🆔 ID:", category._id);
    console.log("🔗 Navigation vers:", `/category/${category._id}`);
    
    // Navigation vers la page de catégorie
    navigate(`/category/${category._id}`);
  };

  const handleLearnMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔗 En savoir plus - Catégorie:", category.name);
    console.log("🆔 ID:", category._id);
    navigate(`/category/${category._id}`);
  };

  return (
    <div className="sector-card-wrapper h-100 d-flex flex-column">
      {/* Cadre avec l'image uniquement */}
      <div
        className="sector-card card border-0 position-relative overflow-hidden"
        onClick={handleCardClick}
        style={{ 
          cursor: "pointer",
          height: "180px",
          width: "100%",
          backgroundColor: "transparent",
          borderBottomLeftRadius: "0",
          borderBottomRightRadius: "0"
        }}
      >
        {/* Image de fond avec transparence */}
        {sectorImage && !imageError ? (
          <div
            className="position-absolute w-100 h-100"
            style={{
              backgroundImage: `url(${sectorImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            }}
          >
            <img 
              src={sectorImage} 
              alt={category.name}
              style={{ display: 'none' }}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div
            className="position-absolute w-100 h-100"
            style={{
              backgroundColor: colors[index % 4],
              zIndex: 0,
            }}
          ></div>
        )}
      </div>

      {/* Informations à l'extérieur du cadre */}
      <div 
        className="sector-info p-3"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderTop: "none"
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ fontSize: "1.8rem" }}>
            {sectorIcon}
          </div>
          <h5 className="fw-bold mb-0" style={{ color: "#333333" }}>{category.name}</h5>
        </div>
        <p className="card-text small mb-2" style={{ color: "#666666" }}>
          {category.description?.substring(0, 70)}
          {category.description?.length > 70 ? "..." : ""}
        </p>
        <a 
          href="#" 
          className="text-decoration-none fw-bold d-inline-flex align-items-center"
          style={{ color: "#0066cc" }}
          onClick={handleLearnMoreClick}
        >
          En savoir plus +
        </a>
      </div>
    </div>
  );
};

SectorCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default SectorCard;