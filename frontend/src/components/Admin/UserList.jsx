import { useState, useEffect, useCallback, useMemo } from "react";
import { getAllUsers, toggleUserStatus } from "../../services/userService";
import "bootstrap/dist/css/bootstrap.min.css";

// Composant de chargement
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
    <div className="text-center">
      <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
      <p className="mt-3 text-muted">Chargement des clients…</p>
    </div>
  </div>
);

// Composant d'alerte
const AlertMessage = ({ type, message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible fade show mb-4`} role="alert">
      <i className={`bi bi-${type === "danger" ? "exclamation-triangle-fill" : "check-circle-fill"} me-2`}></i>
      <strong>{type === "danger" ? "Erreur :" : "Succès :"}</strong> {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
};

// Composant de carte statistique
const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="col-6 col-md-3">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3 py-3">
        <div className={`rounded-circle bg-${color} bg-opacity-10 p-3 flex-shrink-0`}>
          <i className={`bi ${icon} fs-4 text-${color}`}></i>
        </div>
        <div>
          <p className="text-muted small mb-0">{label}</p>
          <h3 className={`fw-bold text-${color} mb-0`}>{value}</h3>
          {sub && <small className="text-muted">{sub}</small>}
        </div>
      </div>
    </div>
  </div>
);

// Composant de filtres
const FilterBar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onReset, hasActiveFilters }) => (
  <div className="card border-0 shadow-sm mb-4">
    <div className="card-body py-3 px-4">
      <div className="row g-3 align-items-end">
        {/* Recherche */}
        <div className="col-md-6">
          <label className="form-label fw-semibold small mb-1">
            <i className="bi bi-search me-1 text-primary"></i>Recherche
          </label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-1"
              placeholder="Nom, code client, email, téléphone, adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchTerm("")}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filtre statut */}
        <div className="col-md-4">
          <label className="form-label fw-semibold small mb-1">
            <i className="bi bi-funnel me-1 text-primary"></i>Filtre par statut
          </label>
          <div className="d-flex gap-2">
            {[
              { key: "all", label: "Tous", cls: "btn-primary", outCls: "btn-outline-primary" },
              { key: "active", label: "Actifs", cls: "btn-success", outCls: "btn-outline-success" },
              { key: "inactive", label: "Inactifs", cls: "btn-danger", outCls: "btn-outline-danger" },
            ].map(({ key, label, cls, outCls }) => (
              <button
                key={key}
                className={`btn btn-sm flex-fill ${statusFilter === key ? cls : outCls}`}
                onClick={() => setStatusFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Réinitialiser */}
        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-sm btn-outline-secondary w-100"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
          </button>
        </div>
      </div>

      {/* Tags filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
          <span className="text-muted small">
            <i className="bi bi-bar-chart me-1"></i>
            <strong>Filtres appliqués</strong> —
          </span>
          {searchTerm && (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
              <i className="bi bi-search me-1"></i>"{searchTerm}"
            </span>
          )}
          {statusFilter !== "all" && (
            <span className={`badge small ${statusFilter === "active" ? "bg-success" : "bg-danger"}`}>
              {statusFilter === "active" ? "Actifs seulement" : "Inactifs seulement"}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

// Composant de ligne de tableau
const UserTableRow = ({ user, isActive, updating, formatDate, onToggleStatus }) => (
  <tr className={!isActive ? "table-secondary" : ""} style={updating === user._id ? { opacity: 0.6 } : {}}>
    <td className="px-4">
      <span className="badge bg-light text-dark border fw-semibold">
        {user.client_code || "—"}
      </span>
    </td>
    <td className="px-4">
      <div className="d-flex align-items-center gap-2">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
          style={{
            width: 36, height: 36, fontSize: 14,
            background: isActive ? "#dbeafe" : "#f1f5f9",
            color: isActive ? "#2563eb" : "#94a3b8",
          }}
        >
          {(user.client_name || "?")[0].toUpperCase()}
        </div>
        <div>
          <div className="fw-semibold lh-sm">{user.client_name || "—"}</div>
          <small className="text-muted">{formatDate(user.createdAt)}</small>
        </div>
      </div>
    </td>
    <td className="px-4 small">
      {user.email ? (
        <a href={`mailto:${user.email}`} className="text-decoration-none text-body">
          <i className="bi bi-envelope me-1 text-muted"></i>{user.email}
        </a>
      ) : "—"}
    </td>
    <td className="px-4 small">
      {user.telephone ? (
        <><i className="bi bi-telephone me-1 text-muted"></i>{user.telephone}</>
      ) : "—"}
    </td>
    <td className="px-4 small">
      {user.adresse ? (
        <span className="text-truncate d-inline-block" style={{ maxWidth: 180 }} title={user.adresse}>
          <i className="bi bi-geo-alt me-1 text-muted"></i>{user.adresse}
        </span>
      ) : "—"}
    </td>
    <td className="px-4 text-center">
      <span className={`badge rounded-pill px-3 py-2 ${isActive ? "bg-success" : "bg-danger"}`}>
        <i className={`bi ${isActive ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
        {isActive ? "Actif" : "Inactif"}
      </span>
    </td>
    <td className="px-4 text-center">
      <button
        className={`btn btn-sm rounded-pill px-3 ${isActive ? "btn-outline-danger" : "btn-outline-success"}`}
        disabled={updating === user._id}
        onClick={() => onToggleStatus(user._id)}
      >
        {updating === user._id ? (
          <span className="spinner-border spinner-border-sm" role="status"></span>
        ) : isActive ? (
          <><i className="bi bi-x-circle me-1"></i>Désactiver</>
        ) : (
          <><i className="bi bi-check-circle me-1"></i>Activer</>
        )}
      </button>
    </td>
  </tr>
);

// Composant de carte utilisateur
const UserCard = ({ user, isActive, updating, formatDate, onToggleStatus }) => (
  <div className="col-xl-4 col-lg-6">
    <div className={`card h-100 border-0 shadow-sm ${!isActive ? "opacity-75" : ""}`}>
      {/* Header */}
      <div className="card-header bg-white border-0 pt-3 pb-2 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
            style={{
              width: 46, height: 46, fontSize: 18,
              background: isActive ? "linear-gradient(135deg,#dbeafe,#bfdbfe)" : "#f1f5f9",
              color: isActive ? "#2563eb" : "#94a3b8",
            }}
          >
            {(user.client_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <h6 className="fw-bold mb-0 lh-sm">{user.client_name || "—"}</h6>
            <small className="text-muted">{user.client_code || "—"}</small>
          </div>
        </div>
        <span className={`badge rounded-pill px-3 py-2 ${isActive ? "bg-success" : "bg-danger"}`}>
          <i className={`bi ${isActive ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
          {isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      {/* Body */}
      <div className="card-body px-4 py-2">
        <ul className="list-unstyled mb-0 small">
          {[
            { icon: "bi-envelope", label: "Email", value: user.email },
            { icon: "bi-telephone", label: "Téléphone", value: user.telephone },
            { icon: "bi-geo-alt", label: "Adresse", value: user.adresse },
            { icon: "bi-calendar", label: "Inscrit le", value: formatDate(user.createdAt) },
          ].map(({ icon, label, value }, i, arr) => (
            <li key={label} className={`py-2 d-flex gap-2 align-items-start ${i < arr.length - 1 ? "border-bottom" : ""}`}>
              <i className={`bi ${icon} text-muted mt-1 flex-shrink-0`}></i>
              <div>
                <span className="text-muted d-block" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                <span>{value || "—"}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="card-footer bg-white border-0 px-4 pb-3 pt-2">
        <button
          className={`btn w-100 btn-sm rounded-pill ${isActive ? "btn-outline-danger" : "btn-outline-success"}`}
          disabled={updating === user._id}
          onClick={() => onToggleStatus(user._id)}
        >
          {updating === user._id ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Modification...</>
          ) : isActive ? (
            <><i className="bi bi-x-circle me-2"></i>Désactiver le compte</>
          ) : (
            <><i className="bi bi-check-circle me-2"></i>Activer le compte</>
          )}
        </button>
      </div>
    </div>
  </div>
);

// Composant principal
export default function UserList() {
  // ===== ÉTATS =====
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // ===== DONNÉES DÉRIVÉES =====
  const clientsOnly = useMemo(() => users.filter((u) => !u.isAdmin), [users]);
  
  const filteredUsers = useMemo(() => {
    return clientsOnly.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" ||
        user.client_name?.toLowerCase().includes(searchLower) ||
        user.client_code?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.adresse?.toLowerCase().includes(searchLower) ||
        user.telephone?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && user.actif === true) ||
        (statusFilter === "inactive" && user.actif === false);

      return matchesSearch && matchesStatus;
    });
  }, [clientsOnly, searchTerm, statusFilter]);

  const activeCount = useMemo(() => filteredUsers.filter((u) => u.actif).length, [filteredUsers]);
  const inactiveCount = useMemo(() => filteredUsers.filter((u) => !u.actif).length, [filteredUsers]);
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  // ===== FONCTIONS =====
  const formatDate = useCallback((d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—"), []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setError("Erreur lors du chargement des utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleStatus = useCallback(async (userId) => {
    const userBefore = users.find((u) => u._id === userId);
    if (!userBefore) {
      setError("Utilisateur non trouvé");
      return;
    }

    setUpdating(userId);
    try {
      const updatedUser = await toggleUserStatus(userId);
      if (updatedUser && updatedUser.actif !== undefined) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? updatedUser : u)));
        setSuccessMessage(
          `Le compte de ${userBefore.client_name} a été ${updatedUser.actif ? "activé" : "désactivé"} avec succès !`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error("Réponse API invalide");
      }
    } catch (error) {
      console.error("Erreur toggle status:", error);
      // Fallback local
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            const updated = { ...u, actif: !u.actif };
            setSuccessMessage(`Compte ${updated.actif ? "activé" : "désactivé"} (mode local)`);
            setTimeout(() => setSuccessMessage(null), 5000);
            return updated;
          }
          return u;
        })
      );
    } finally {
      setUpdating(null);
    }
  }, [users]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
  }, []);

  // ===== EFFETS =====
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ===== RENDU =====
  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid px-4 py-4">
      {/* ===== EN-TÊTE ===== */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold text-primary mb-1">
            <i className="bi bi-people-fill me-2"></i>
            Gestion des Comptes Clients
          </h1>
          <p className="text-muted small mb-0">
            Consultez et gérez les comptes clients de la plateforme
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="btn-group btn-group-sm" role="group">
            <button
              className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("table")}
            >
              <i className="bi bi-table me-1"></i>Tableau
            </button>
            <button
              className={`btn ${viewMode === "cards" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("cards")}
            >
              <i className="bi bi-grid-3x3-gap-fill me-1"></i>Cartes
            </button>
          </div>
          <span className="badge bg-light text-dark border px-3 py-2 small">
            <i className="bi bi-calendar3 me-1"></i>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* ===== ALERTES ===== */}
      <AlertMessage type="danger" message={error} onClose={() => setError(null)} />
      <AlertMessage type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />

      {/* ===== STATISTIQUES ===== */}
      <div className="row g-3 mb-4">
        <StatCard label="Total clients" value={clientsOnly.length} icon="bi-people" color="primary" />
        <StatCard 
          label="Comptes actifs" 
          value={clientsOnly.filter(u => u.actif).length} 
          icon="bi-check-circle" 
          color="success"
          sub={clientsOnly.length > 0 ? `${((clientsOnly.filter(u => u.actif).length / clientsOnly.length) * 100).toFixed(0)}% du total` : null}
        />
        <StatCard 
          label="Comptes inactifs" 
          value={clientsOnly.filter(u => !u.actif).length} 
          icon="bi-x-circle" 
          color="danger"
          sub={clientsOnly.length > 0 ? `${((clientsOnly.filter(u => !u.actif).length / clientsOnly.length) * 100).toFixed(0)}% du total` : null}
        />
        <StatCard 
          label="Résultats affichés" 
          value={filteredUsers.length} 
          icon="bi-funnel" 
          color="info"
          sub={filteredUsers.length !== clientsOnly.length ? `sur ${clientsOnly.length}` : "tous les clients"}
        />
      </div>

      {/* ===== FILTRES ===== */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ===== VUE TABLEAU ===== */}
      {viewMode === "table" ? (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
            <h6 className="mb-0 fw-bold">
              <i className="bi bi-table me-2 text-primary"></i>Liste des clients
            </h6>
            <span className="badge bg-primary rounded-pill">
              {filteredUsers.length} client{filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-4 text-muted d-block mb-3"></i>
              <h6 className="text-muted fw-semibold">Aucun client trouvé</h6>
              <p className="text-muted small mb-3">
                {hasActiveFilters
                  ? "Aucun compte ne correspond à vos critères"
                  : "La liste des clients est vide"}
              </p>
              {hasActiveFilters && (
                <button className="btn btn-primary btn-sm" onClick={resetFilters}>
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold" style={{ width: 110 }}>Code</th>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold">Client</th>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold">Email</th>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold" style={{ width: 140 }}>Téléphone</th>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold">Adresse</th>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold text-center" style={{ width: 100 }}>Statut</th>
                    <th className="px-4 py-3 small text-uppercase text-muted fw-semibold text-center" style={{ width: 150 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <UserTableRow
                      key={user._id}
                      user={user}
                      isActive={user.actif === true}
                      updating={updating}
                      formatDate={formatDate}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </tbody>
              </table>
              <div className="card-footer bg-white border-top py-2 px-4">
                <small className="text-muted">
                  Affichage de <strong>{filteredUsers.length}</strong> client{filteredUsers.length !== 1 ? "s" : ""} sur <strong>{clientsOnly.length}</strong> au total
                </small>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ===== VUE CARTES ===== */
        filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-people display-4 text-muted d-block mb-3"></i>
            <h6 className="text-muted fw-semibold">Aucun client trouvé</h6>
            {hasActiveFilters && (
              <button className="btn btn-primary btn-sm mt-2" onClick={resetFilters}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="row g-3">
            {filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                isActive={user.actif === true}
                updating={updating}
                formatDate={formatDate}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}