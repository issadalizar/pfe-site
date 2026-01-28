import React from "react";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function Header() {
  return (
    <nav className="navbar navbar-light bg-light px-4 shadow-sm">
      
      {/* Search - recherche */}
      <form className="d-flex align-items-center w-50">
        <FaSearch className="me-2 text-secondary" />
        <input
          className="form-control"
          type="search"
          placeholder="Rechercher..."
          aria-label="Search"
        />
      </form>

      {/* Profile - profil l'admin */}
      <div>
        <button className="btn btn-outline-primary d-flex align-items-center gap-2">
          <FaUserCircle size={22} />
          <span>Admin</span>
        </button>
      </div>

    </nav>
  );
}

export default Header;