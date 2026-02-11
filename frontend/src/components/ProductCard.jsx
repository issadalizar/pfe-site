import { FaStar, FaArrowRight } from "react-icons/fa";
import PropTypes from "prop-types";

const ProductCard = ({ product, onView }) => {
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
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              padding: "20px",
            }}
          />
        ) : (
          <div style={{ fontSize: "3rem" }}>📦</div>
        )}
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
            onClick={() => onView && onView(product._id)}
          >
            Détails <FaArrowRight className="ms-1" style={{ fontSize: "0.8rem" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.required,
    name: PropTypes.string.required,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    rating: PropTypes.number,
  }).isRequired,
  onView: PropTypes.func,
};

export default ProductCard;
