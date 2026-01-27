import { FaUserCircle, FaSearch } from "react-icons/fa";
import "./Header.css";

export default function Header() {
  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher..."
          />
        </div>
        
        <div className="header-actions">
          <button className="header-btn profile-btn" title="Profil">
            <FaUserCircle />
            <span className="profile-name">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
