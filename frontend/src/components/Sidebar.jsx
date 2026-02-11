import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaUsers, 
  FaChartLine, 
  FaSignOutAlt,
  FaBuilding,
  FaUserCircle,
  FaChartBar,
  FaBox,
  FaTags,
  FaBell
} from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const menuItems = [
    { 
      path: "/dashboard", 
      icon: <FaHome className="me-2" style={{ color: "#4dc0ff" }} />, 
      label: "Dashboard" 
    },
    { 
      path: "/categories", 
      icon: <FaTags className="me-2" style={{ color: "#4dc0ff" }} />, 
      label: "Categories" 
    },
    { 
      path: "/products", 
      icon: <FaBox className="me-2" style={{ color: "#4dc0ff" }} />, 
      label: "Products" 
    },
    { 
      path: "/admin", 
      icon: <FaBuilding className="me-2" style={{ color: "#4dc0ff" }} />, 
      label: " Accounts " 
    },
  ];

  return (
    <aside
      className="d-flex flex-column vh-100 position-fixed start-0 top-0 shadow"
      style={{ 
        width: "250px",
        zIndex: 1000,
        background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)"
      }}
    >
      {/* Header avec notification */}
      <div className="p-4 border-bottom" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
        <div className="d-flex flex-column">
          <h4 className="text-white fw-bold d-flex align-items-center justify-content-center mb-0">
            <FaChartLine className="me-2" />
            <span style={{ color: "#4dc0ff" }}>Administration  </span>
            <span style={{ color: "#ffffff" }}>Space</span>
          </h4>
          
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 nav nav-pills flex-column gap-2 p-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link d-flex align-items-center ${isActive(item.path)}`}
            style={{ 
              borderRadius: "8px",
              transition: "all 0.3s",
              backgroundColor: location.pathname === item.path 
                ? "rgba(77, 192, 255, 0.2)" 
                : "transparent",
              border: location.pathname === item.path 
                ? "1px solid #4dc0ff" 
                : "1px solid transparent",
              color: location.pathname === item.path ? "white" : "#e9ecef"
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
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