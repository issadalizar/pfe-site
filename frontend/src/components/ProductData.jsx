import { FaArrowRight, FaCube, FaShoppingCart } from "react-icons/fa";

const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='%23e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%234361ee' font-size='14'>Produit</text></svg>`;

const ProductData = ({
  t,
  mainCategories,
  allProducts,
  filteredProducts,
  selectedCategory,
  handleCategoryFilter,
  handleProductClick,
  handleView3D,
  getCategoryProductCount,
  formatPrice,
  truncateText,
  renderStars,
  addToCart,
  language,
}) => {
  return (
    <section id="products" className="py-6">
      <div className="container">
        <div className="text-center mb-5">
          <span
            className="badge px-4 py-2 rounded-pill mb-3"
            style={{
              background: "linear-gradient(145deg, #f7258520, #b5179e20)",
              color: "#f72585",
              fontWeight: "600",
            }}
          >
            {t.catalogBadge}
          </span>
          <h2 className="display-4 fw-bold mb-3" style={{ color: "#0f172a" }}>
            {t.catalogTitle}
          </h2>
          <p
            className="text-muted"
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              fontSize: "1.1rem",
            }}
          >
            {t.catalogDescription}
          </p>
        </div>

        <div className="row mb-5">
          <div className="col-lg-3 mb-4 mb-lg-0">
            <div
              className="bg-white p-4 rounded-4 border"
              style={{
                borderColor: "rgba(67, 97, 238, 0.1) !important",
                boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
              }}
            >
              <div className="mb-4">
                <div
                  className="d-flex align-items-center justify-content-between p-3 rounded-3"
                  style={{
                    cursor: "pointer",
                    background:
                      selectedCategory === "All products"
                        ? "linear-gradient(145deg, #4361ee, #3a0ca3)"
                        : "#f8fafc",
                    color:
                      selectedCategory === "All products" ? "white" : "#334155",
                    transition: "all 0.3s ease",
                    border:
                      selectedCategory === "All products"
                        ? "none"
                        : "1px solid #e2e8f0",
                  }}
                  onClick={() => handleCategoryFilter("All products")}
                >
                  <span className="fw-medium">{t.allProducts}</span>
                  <span
                    className="badge"
                    style={{
                      background:
                        selectedCategory === "All products"
                          ? "rgba(255,255,255,0.2)"
                          : "#e9ecef",
                      color:
                        selectedCategory === "All products"
                          ? "white"
                          : "#334155",
                      padding: "6px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {allProducts.length}
                  </span>
                </div>
              </div>

              <div>
                <h6 className="fw-bold mb-3" style={{ color: "#0f172a" }}>
                  {t.categories}
                </h6>
                <div className="d-flex flex-column gap-2">
                  {mainCategories.map((cat, index) => {
                    if (cat === "All products") return null;
                    const count = getCategoryProductCount(cat);
                    let displayCat = cat;
                    if (language === "en") {
                      const catMap = {
                        "CNC Turning Machine": "CNC Turning Machine",
                        "CNC Milling Machine": "CNC Milling Machine",
                        "CAPTEURS ET ACTIONNEURS": "SENSORS AND ACTUATORS",
                        ÉLECTRICITÉ: "ELECTRICITY",
                        "RÉSEAUX MULTIPLEXÉS": "MULTIPLEXED NETWORKS",
                        Accessoires: "Accessories",
                        "EDUCATION EQUIPMENT": "EDUCATION EQUIPMENT",
                      };
                      displayCat = catMap[cat] || cat;
                    }
                    return (
                      <a
                        key={index}
                        href="#"
                        className="text-decoration-none d-flex align-items-center justify-content-between p-3 rounded-3"
                        style={{
                          color:
                            selectedCategory === cat ? "#4361ee" : "#64748b",
                          background:
                            selectedCategory === cat
                              ? "#eef2ff"
                              : "transparent",
                          transition: "all 0.3s ease",
                          border: "1px solid",
                          borderColor:
                            selectedCategory === cat
                              ? "#4361ee"
                              : "transparent",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategoryFilter(cat);
                        }}
                      >
                        <span className="small fw-medium">{displayCat}</span>
                        <small
                          style={{
                            color:
                              selectedCategory === cat ? "#4361ee" : "#94a3b8",
                          }}
                        >
                          ({count})
                        </small>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
                  {selectedCategory === "All products"
                    ? t.allProducts
                    : language === "en" &&
                        mainCategories.includes(selectedCategory)
                      ? selectedCategory === "CAPTEURS ET ACTIONNEURS"
                        ? "SENSORS AND ACTUATORS"
                        : selectedCategory === "ÉLECTRICITÉ"
                          ? "ELECTRICITY"
                          : selectedCategory === "RÉSEAUX MULTIPLEXÉS"
                            ? "MULTIPLEXED NETWORKS"
                            : selectedCategory === "Accessoires"
                              ? "Accessories"
                              : selectedCategory === "EDUCATION EQUIPMENT"
                                ? "EDUCATION EQUIPMENT"
                                : selectedCategory
                      : selectedCategory}
                </h4>
                <small className="text-muted">
                  {filteredProducts.length} {t.productsAvailable}
                </small>
              </div>
              <select
                className="form-select w-auto rounded-pill"
                style={{
                  borderColor: "#e2e8f0",
                  padding: "0.6rem 2rem 0.6rem 1rem",
                  fontSize: "0.95rem",
                }}
              >
                <option>{t.sortBy}</option>
                <option>{t.sortPriceAsc}</option>
                <option>{t.sortPriceDesc}</option>
                <option>{t.sortNewest}</option>
              </select>
            </div>

            <div className="row g-4">
              {filteredProducts.slice(0, 12).map((product, index) => (
                <div key={index} className="col-md-6 col-xl-4">
                  <div
                    className="card h-100 border-0 rounded-4 overflow-hidden position-relative"
                    onClick={() => handleProductClick(product)}
                    style={{
                      cursor: "pointer",
                      background: "white",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      border: "1px solid rgba(67, 97, 238, 0.1)",
                    }}
                  >
                    <button
                      onClick={(e) => handleView3D(e, product)}
                      className="btn-3d-float"
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                        transition: "all 0.3s ease",
                        zIndex: 10,
                        opacity: 0,
                        transform: "translateY(-5px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1.1) translateY(0)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1) translateY(0)";
                      }}
                      title="Voir en 3D"
                    >
                      <FaCube size={18} />
                    </button>

                    <div className="position-relative">
                      <div
                        className="product-image p-4 text-center"
                        style={{
                          background:
                            "linear-gradient(145deg, #f8fafc, #f1f5f9)",
                          height: "200px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={product.images?.[0] || PLACEHOLDER_SVG}
                          alt={product.title}
                          className="img-fluid"
                          style={{
                            height: "150px",
                            objectFit: "contain",
                            transition: "transform 0.3s ease",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER_SVG;
                          }}
                        />
                      </div>

                      {index < 2 && (
                        <span
                          className="position-absolute top-0 end-0 m-3 badge rounded-pill"
                          style={{
                            background:
                              "linear-gradient(145deg, #f72585, #b5179e)",
                            padding: "6px 12px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {t.new}
                        </span>
                      )}
                    </div>

                    <div className="card-body p-4">
                      <h6
                        className="fw-bold mb-2"
                        title={product.title}
                        style={{
                          color: "#0f172a",
                          fontSize: "1rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {truncateText(product.title, 35)}
                      </h6>

                      <p
                        className="small text-muted mb-3"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.description ||
                          product.category ||
                          product.mainCategory}
                      </p>

                      <div className="mb-3">{renderStars()}</div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span
                            className="fw-bold h5 mb-0"
                            style={{ color: "#4361ee" }}
                          >
                            {formatPrice(product.price)}
                          </span>
                          <small className="text-muted ms-1">{t.ttc}</small>
                        </div>
                        <button
                          className="btn btn-sm rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            background: "#eef2ff",
                            color: "#4361ee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            transition: "all 0.3s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <FaShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">{t.noProducts}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductData;
