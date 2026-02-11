import PropTypes from "prop-types";

const SectorCard = ({ category, index, onClick }) => {
  const colors = ["#0066cc", "#ff9900", "#0099ff", "#666666"];
  const icons = ["🖥️", "🏭", "💾", "🔧"];

  return (
    <div
      className="sector-card card h-100 border-0 text-white position-relative overflow-hidden"
      onClick={() => onClick && onClick(category._id)}
      style={{ cursor: "pointer" }}
    >
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundColor: colors[index % 4],
          zIndex: 0,
        }}
      ></div>
      <div className="card-body position-relative z-1 d-flex flex-column justify-content-end">
        <div style={{ fontSize: "2rem" }} className="mb-2">
          {icons[index % 4]}
        </div>
        <h5 className="card-title fw-bold mb-2">{category.name}</h5>
        <p className="card-text small mb-3">
          {category.description?.substring(0, 70)}
          {category.description?.length > 70 ? "..." : ""}
        </p>
        <a href="#" className="text-white text-decoration-none fw-bold">
          En savoir plus +
        </a>
      </div>
    </div>
  );
};

SectorCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.required,
    name: PropTypes.string.required,
    description: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

export default SectorCard;
