import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaUsers, 
  FaChartLine, 
  FaSignOutAlt,
  FaBuilding,
  FaUserCircle,
  FaChartBar
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "active text-white" : "text-light";

  return (
    <aside
      className="d-flex flex-column vh-100 position-fixed start-0 top-0 shadow"
      style={{ 
        width: "250px",
        zIndex: 1000,
        background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)" // Nouveau dégradé bleu
      }}
    >
      {/* Header */}
      <div className="p-4 border-bottom border-light" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
        <h4 className="text-white fw-bold d-flex align-items-center justify-content-center mb-0">
          <FaChartLine className="me-2" />
          <span style={{ color: "#4dc0ff" }}>Espace </span>
          <span style={{ color: "#ffffff" }}>Admin</span>
        </h4>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 nav nav-pills flex-column gap-2 p-3">
        <Link
          to="/dashboard"
          className={`nav-link d-flex align-items-center ${isActive("/dashboard")}`}
          style={{ 
            borderRadius: "8px",
            transition: "all 0.3s",
            backgroundColor: location.pathname === "/dashboard" 
              ? "rgba(77, 192, 255, 0.2)" 
              : "transparent",
            border: location.pathname === "/dashboard" 
              ? "1px solid #4dc0ff" 
              : "1px solid transparent"
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== "/dashboard") {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/dashboard") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <FaHome className="me-2" style={{ color: "#4dc0ff" }} />
          Dashboard
        </Link>

        <Link
          to="/users"
          className={`nav-link d-flex align-items-center ${isActive("/users")}`}
          style={{ 
            borderRadius: "8px",
            transition: "all 0.3s",
            backgroundColor: location.pathname === "/users" 
              ? "rgba(77, 192, 255, 0.2)" 
              : "transparent",
            border: location.pathname === "/users" 
              ? "1px solid #4dc0ff" 
              : "1px solid transparent"
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== "/users") {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/users") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <FaUserCircle className="me-2" style={{ color: "#4dc0ff" }} />
          Clients
        </Link>

        <Link
          to="/admin"
          className={`nav-link d-flex align-items-center ${isActive("/admin")}`}
          style={{ 
            borderRadius: "8px",
            transition: "all 0.3s",
            backgroundColor: location.pathname === "/admin" 
              ? "rgba(77, 192, 255, 0.2)" 
              : "transparent",
            border: location.pathname === "/admin" 
              ? "1px solid #4dc0ff" 
              : "1px solid transparent"
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== "/admin") {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/admin") {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <FaBuilding className="me-2" style={{ color: "#4dc0ff" }} />
          Admin
        </Link>

        {/* Nouvelles options optionnelles - Vous pouvez les activer si besoin */}
        {false && ( // Mettez à true si vous voulez ajouter ces options
          <>
            <Link
              to="/properties"
              className={`nav-link d-flex align-items-center ${isActive("/properties")}`}
            >
              <FaBuilding className="me-2" />
              Properties
            </Link>
            
            <Link
              to="/leads"
              className={`nav-link d-flex align-items-center ${isActive("/leads")}`}
            >
              <FaChartBar className="me-2" />
              Leads Statistics
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-top" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
        <Link
          to="/logout"
          className="nav-link d-flex align-items-center"
          style={{ 
            color: "#4dc0ff",
            borderRadius: "8px",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 107, 107, 0.1)";
            e.currentTarget.style.paddingLeft = "15px";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.paddingLeft = "12px";
          }}
        >
          <FaSignOutAlt className="me-2" />
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}