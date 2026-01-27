import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h4 className="sidebar-logo">
          <FaChartLine className="me-2" />
          StarAdmin
        </h4>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`sidebar-link ${isActive("/dashboard")}`}
        >
          <FaHome className="sidebar-icon" />
          <span>Dashboard</span>
        </Link>
        <Link to="/users" className={`sidebar-link ${isActive("/users")}`}>
          <FaUsers className="sidebar-icon" />
          <span>Clients</span>
        </Link>
        <Link to="/admin" className={`sidebar-link ${isActive("/admin")}`}>
          <FaChartLine className="sidebar-icon" />
          <span>Admin</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <Link to="/logout" className="sidebar-link">
          <FaSignOutAlt className="sidebar-icon" />
          <span>Déconnexion</span>
        </Link>
      </div>
    </aside>
  );
}
