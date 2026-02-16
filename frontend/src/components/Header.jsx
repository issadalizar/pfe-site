//composant hetha l'header mta3 l'admin, fih profil mta3ou w logo mta3ou
import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function Header() {
  return (
    <nav className="navbar navbar-light bg-light px-4 shadow-sm">
      {/* Profile - profil l'admin */}
      <div className="ms-auto"> {/* ms-auto pour pousser à droite */}
        <button className="btn btn-outline-primary d-flex align-items-center gap-2">
          <FaUserCircle size={22} />
          <span>Admin</span>
        </button>
      </div>
    </nav>
  );
}

export default Header;