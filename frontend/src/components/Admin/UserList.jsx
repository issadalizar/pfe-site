import { useState, useEffect } from "react";
import { getAllUsers, toggleUserStatus } from "../../services/userService";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserList() {
  // States (variables dynamiques)
  const [users, setUsers] = useState([]); // liste mtaa clients
  const [loading, setLoading] = useState(true); // loading chneya
  const [error, setError] = useState(null); // erreurs
  const [updating, setUpdating] = useState(null); // client li f update
  const [successMessage, setSuccessMessage] = useState(null); // message de succès

  // Nouveaux states pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState(""); // terme de recherche
  const [statusFilter, setStatusFilter] = useState("all"); // filtre par statut: all, active, inactive
  const [adminFilter, setAdminFilter] = useState("all"); // filtre par admin: all, admin, nonadmin
  const [activeFilter, setActiveFilter] = useState(false); // pour savoir si le filtre statut est actif
  const [viewMode, setViewMode] = useState("cards"); // 'cards' ou 'table' - ajout du mode d'affichage

  // useEffect bech n3aytou loadUsers marra wa7da bark
  useEffect(() => {
    loadUsers();
  }, []);

  // Fonction bech t7eb les utilisateurs men backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction bech tnadi toggle l'etat mtaa client (actif/inactif)
  const handleToggleStatus = async (userId) => {
    try {
      // Trouver l'utilisateur avant modification
      const userBefore = users.find((u) => u._id === userId);
      if (!userBefore) {
        setError("Utilisateur non trouvé");
        return;
      }

      const newStatus = !userBefore.actif;
      const action = newStatus ? "activation" : "désactivation";

      console.log(
        `🔄 Début ${action} pour: ${userBefore.client_name} (ID: ${userId})`,
      );
      console.log(
        `📊 État actuel: ${userBefore.actif ? "ACTIF" : "INACTIF"} → État futur: ${newStatus ? "ACTIF" : "INACTIF"}`,
      );

      // Mettre à jour l'état updating
      setUpdating(userId);

      // Appeler l'API pour modifier le statut
      const updatedUser = await toggleUserStatus(userId);
      console.log("✅ Réponse API:", updatedUser);

      // Vérifier que la réponse contient bien le nouveau statut
      if (updatedUser.actif !== undefined) {
        // Mettre à jour la liste des utilisateurs
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u)),
        );

        // Afficher un message de succès
        const message = `Le compte de ${userBefore.client_name} a été ${updatedUser.actif ? "activé" : "désactivé"} avec succès!`;
        setSuccessMessage(message);

        // Effacer le message après 5 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);

        console.log(`✅ ${action} terminée avec succès`);
        console.log(
          `🔄 Nouvel état: ${updatedUser.actif ? "ACTIF" : "INACTIF"}`,
        );
      } else {
        throw new Error("Réponse API invalide: pas de champ 'actif'");
      }
    } catch (error) {
      console.error("❌ Erreur dans handleToggleStatus:", error);

      // Si erreur API, simuler le changement localement
      console.log("🔄 Simulation du changement localement...");
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            const updatedUser = { ...u, actif: !u.actif };
            const message = `Le compte de ${updatedUser.client_name} a été ${updatedUser.actif ? "activé" : "désactivé"} (mode simulation)!`;
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 5000);
            return updatedUser;
          }
          return u;
        }),
      );
    } finally {
      setUpdating(null);
    }
  };

  // Fonction de filtrage des utilisateurs (recherche + statut + admin en même temps)
  const getFilteredUsers = () => {
    return users.filter((user) => {
      // Filtre par recherche (sur nom, code, email, adresse, téléphone)
      const matchesSearch =
        searchTerm === "" ||
        (user.client_name &&
          user.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.client_code &&
          user.client_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.adresse &&
          user.adresse.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.telephone &&
          user.telephone.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtre par statut (actif/inactif)
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.actif === true) ||
        (statusFilter === "inactive" && user.actif === false);

      // Filtre par admin
      const matchesAdmin =
        adminFilter === "all" ||
        (adminFilter === "admin" && user.isAdmin === true) ||
        (adminFilter === "nonadmin" && user.isAdmin === false);

      // Les filtres sont appliqués en même temps (ET logique)
      return matchesSearch && matchesStatus && matchesAdmin;
    });
  };

  // Fonction pour définir le filtre statut
  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    setActiveFilter(filter !== "all");
  };

  // Fonction pour définir le filtre admin
  const handleAdminFilterChange = (filter) => {
    setAdminFilter(filter);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAdminFilter("all");
    setActiveFilter(false);
  };

  // Formattage mtaa montant (TND) - conservé pour compatibilité
  const formatMontantTND = (m) => `${Number(m || 0).toFixed(2)} TND`;

  // Formattage mtaa date (format fr) - conservé pour compatibilité
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "-");

  // Obtenir les utilisateurs filtrés
  const filteredUsers = getFilteredUsers();

  // Compter les statistiques
  const activeCount = filteredUsers.filter((u) => u.actif).length;
  const inactiveCount = filteredUsers.filter((u) => !u.actif).length;
  const adminCount = filteredUsers.filter((u) => u.isAdmin).length;
  const nonAdminCount = filteredUsers.filter((u) => !u.isAdmin).length;

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted fs-5">Chargement des utilisateurs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* En-tête de page amélioré */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold text-primary mb-1">
            👥Gestion des Comptes Clients
          </h1>
          <p className="text-muted lead fs-6">
            <i className="bi bi-people-fill me-2"></i>
            Gérez les comptes des clients et leurs droits d'administration
          </p>
        </div>
        <div className="d-none d-md-flex align-items-center gap-3">
          {/* Boutons de changement de vue */}
          <div className="btn-group" role="group">
            <button
              className={`btn ${viewMode === "cards" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("cards")}
              title="Vue cartes"
            >
              <i className="bi bi-grid-3x3-gap-fill me-1"></i>
              Cartes
            </button>
            <button
              className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setViewMode("table")}
              title="Vue tableau"
            >
              <i className="bi bi-table me-1"></i>
              Tableau
            </button>
          </div>
          <span className="badge bg-light text-dark p-3 shadow-sm">
            <i className="bi bi-calendar me-2"></i>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Messages d'erreur et succès avec meilleure apparence */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4 shadow-sm"
          role="alert"
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>
              <strong className="fs-6">Erreur:</strong>
              <p className="mb-0">{error}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show mb-4 shadow-sm"
          role="alert"
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill fs-4 me-3"></i>
            <div>
              <strong className="fs-6">Succès!</strong>
              <p className="mb-0">{successMessage}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {/* Statistiques avec design amélioré */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 bg-gradient-primary">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-people fs-2 text-primary"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Comptes</h6>
                <h2 className="fw-bold mb-0">{users.length}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-check-circle fs-2 text-success"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Comptes Actifs</h6>
                <h2 className="fw-bold text-success mb-0">
                  {users.filter((u) => u.actif).length}
                </h2>
                {users.length > 0 && (
                  <small className="text-muted">
                    {(
                      (users.filter((u) => u.actif).length / users.length) *
                      100
                    ).toFixed(1)}
                    % du total
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                <i className="bi bi-x-circle fs-2 text-danger"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Comptes Inactifs</h6>
                <h2 className="fw-bold text-danger mb-0">
                  {users.filter((u) => !u.actif).length}
                </h2>
                {users.length > 0 && (
                  <small className="text-muted">
                    {(
                      (users.filter((u) => !u.actif).length / users.length) *
                      100
                    ).toFixed(1)}
                    % du total
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i className="bi bi-shield-lock fs-2 text-warning"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">Administrateurs</h6>
                <h2 className="fw-bold text-warning mb-0">
                  {users.filter((u) => u.isAdmin).length}
                </h2>
                {users.length > 0 && (
                  <small className="text-muted">
                    {(
                      (users.filter((u) => u.isAdmin).length / users.length) *
                      100
                    ).toFixed(1)}
                    % du total
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres améliorés */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-search me-2"></i>
            Recherche et filtres
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Barre de recherche principale */}
            <div className="col-12">
              <label htmlFor="search" className="form-label fw-semibold">
                <i className="bi bi-search me-2"></i>
                Recherche
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  id="search"
                  placeholder="Rechercher par nom, code, email, adresse, téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm("")}
                    title="Effacer la recherche"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
              <small className="text-muted mt-1 d-block">
                <i className="bi bi-info-circle me-1"></i>
                La recherche s'effectue dans tous les champs disponibles
              </small>
            </div>

            {/* Filtres de statut (actif/inactif) */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-funnel me-2"></i>
                Filtre par statut
              </label>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${statusFilter === "all" ? "btn-primary" : "btn-outline-primary"} px-4`}
                  onClick={() => handleStatusFilterChange("all")}
                >
                  <i className="bi bi-list-ul me-2"></i>
                  Tous
                </button>
                <button
                  className={`btn ${statusFilter === "active" ? "btn-success" : "btn-outline-success"} px-4`}
                  onClick={() => handleStatusFilterChange("active")}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Actifs
                </button>
                <button
                  className={`btn ${statusFilter === "inactive" ? "btn-danger" : "btn-outline-danger"} px-4`}
                  onClick={() => handleStatusFilterChange("inactive")}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Inactifs
                </button>
              </div>
            </div>

            {/* Nouveau filtre par admin */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-shield-lock me-2"></i>
                Filtre par droits admin
              </label>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${adminFilter === "all" ? "btn-primary" : "btn-outline-primary"} px-4`}
                  onClick={() => handleAdminFilterChange("all")}
                >
                  <i className="bi bi-list-ul me-2"></i>
                  Tous
                </button>
                <button
                  className={`btn ${adminFilter === "admin" ? "btn-warning" : "btn-outline-warning"} px-4`}
                  onClick={() => handleAdminFilterChange("admin")}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Admins
                </button>
                <button
                  className={`btn ${adminFilter === "nonadmin" ? "btn-secondary" : "btn-outline-secondary"} px-4`}
                  onClick={() => handleAdminFilterChange("nonadmin")}
                >
                  <i className="bi bi-person me-2"></i>
                  Non-admins
                </button>
              </div>
            </div>

            {/* Affichage des filtres actifs */}
            {(searchTerm ||
              statusFilter !== "all" ||
              adminFilter !== "all") && (
              <div className="col-12 mt-3">
                <div className="bg-light p-4 rounded-3 border">
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <span className="fw-bold fs-5">
                      <i className="bi bi-bar-chart me-2"></i>
                      {filteredUsers.length} / {users.length} comptes
                    </span>

                    {searchTerm && (
                      <span className="badge bg-primary py-2 px-3 fs-6">
                        <i className="bi bi-search me-1"></i>"{searchTerm}"
                      </span>
                    )}

                    {statusFilter !== "all" && (
                      <span
                        className={`badge ${statusFilter === "active" ? "bg-success" : "bg-danger"} py-2 px-3 fs-6`}
                      >
                        <i
                          className={`bi ${statusFilter === "active" ? "bi-check-circle" : "bi-x-circle"} me-1`}
                        ></i>
                        {statusFilter === "active" ? "Actifs" : "Inactifs"}
                      </span>
                    )}

                    {adminFilter !== "all" && (
                      <span
                        className={`badge ${adminFilter === "admin" ? "bg-warning" : "bg-secondary"} py-2 px-3 fs-6`}
                      >
                        <i
                          className={`bi ${adminFilter === "admin" ? "bi-shield-check" : "bi-person"} me-1`}
                        ></i>
                        {adminFilter === "admin" ? "Admins" : "Non-admins"}
                      </span>
                    )}

                    <button
                      className="btn btn-link text-decoration-none ms-auto"
                      onClick={resetFilters}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Effacer tous les filtres
                    </button>
                  </div>

                  {/* Mini statistiques des résultats filtrés */}
                  {filteredUsers.length > 0 && (
                    <div className="mt-3 d-flex gap-4 flex-wrap">
                      <span className="text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Actifs: {activeCount}
                      </span>
                      <span className="text-danger">
                        <i className="bi bi-x-circle-fill me-1"></i>
                        Inactifs: {inactiveCount}
                      </span>
                      <span className="text-warning">
                        <i className="bi bi-shield-check me-1"></i>
                        Admins: {adminCount}
                      </span>
                      <span className="text-secondary">
                        <i className="bi bi-person me-1"></i>
                        Non-admins: {nonAdminCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message si aucun résultat */}
            {filteredUsers.length === 0 && users.length > 0 && (
              <div className="col-12 mt-3">
                <div className="alert alert-warning d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                  <div>
                    <strong>Aucun résultat</strong>
                    <p className="mb-0">
                      Aucun résultat ne correspond à votre recherche
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vue conditionnelle : Cartes ou Tableau */}
      {viewMode === "cards" ? (
        /* ===== VUE CARTES ===== */
        <div className="row g-4">
          {filteredUsers.length === 0 ? (
            <div className="col-12">
              <div className="text-center py-5">
                <div className="py-4">
                  <i className="bi bi-people display-1 text-muted"></i>
                  <h5 className="mt-3">Aucun résultat trouvé</h5>
                  <p className="text-muted">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    adminFilter !== "all"
                      ? "Aucun compte ne correspond à vos critères de recherche"
                      : "La liste des clients est vide"}
                  </p>
                  {(searchTerm ||
                    statusFilter !== "all" ||
                    adminFilter !== "all") && (
                    <button
                      className="btn btn-primary mt-2"
                      onClick={resetFilters}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isActive = u.actif === true;

              return (
                <div key={u._id} className="col-xl-4 col-lg-6 col-md-6">
                  <div
                    className={`card h-100 shadow-sm border-0 hover-shadow transition-all ${!isActive ? "bg-light" : ""}`}
                    style={{ transition: "all 0.3s ease" }}
                  >
                    {/* En-tête de carte avec code client et statut */}
                    <div className="card-header bg-white border-0 pt-4 px-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <i className="bi bi-person-badge fs-4 text-primary"></i>
                          </div>
                          <div>
                            <span className="text-muted small">
                              Code client
                            </span>
                            <h6 className="fw-bold mb-0">
                              {u.client_code || "-"}
                            </h6>
                          </div>
                        </div>
                        <span
                          className={`badge ${isActive ? "bg-success" : "bg-danger"} py-2 px-3`}
                        >
                          <i
                            className={`bi ${isActive ? "bi-check-circle" : "bi-x-circle"} me-1`}
                          ></i>
                          {isActive ? "ACTIF" : "INACTIF"}
                        </span>
                      </div>
                    </div>

                    {/* Corps de la carte avec informations */}
                    <div className="card-body px-4">
                      {/* Nom du client */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <i className="bi bi-person-circle text-primary"></i>
                          </div>
                          <div>
                            <span className="text-muted small">
                              Nom du client
                            </span>
                            <h5 className="fw-semibold mb-0">
                              {u.client_name || "-"}
                            </h5>
                          </div>
                        </div>
                      </div>

                      {/* Grille d'informations */}
                      <div className="row g-3 mt-2">
                        {/* Email */}
                        <div className="col-12">
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-envelope text-muted mt-1"></i>
                            <div className="flex-grow-1">
                              <span className="text-muted small d-block">
                                Email
                              </span>
                              <span className="text-break">
                                {u.email || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Téléphone */}
                        <div className="col-12">
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-telephone text-muted mt-1"></i>
                            <div className="flex-grow-1">
                              <span className="text-muted small d-block">
                                Téléphone
                              </span>
                              <span>{u.telephone || "-"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Adresse */}
                        <div className="col-12">
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-geo-alt text-muted mt-1"></i>
                            <div className="flex-grow-1">
                              <span className="text-muted small d-block">
                                Adresse
                              </span>
                              <span>{u.adresse || "-"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Statut Admin */}
                        <div className="col-12 mt-3">
                          <div className="d-flex justify-content-between align-items-center p-2 rounded bg-light">
                            <span className="fw-semibold">
                              <i className="bi bi-shield-check me-2"></i>
                              Droits admin
                            </span>
                            {u.isAdmin ? (
                              <span className="badge bg-warning text-dark py-2 px-3">
                                <i className="bi bi-shield-check me-1"></i>
                                ADMIN
                              </span>
                            ) : (
                              <span className="badge bg-secondary py-2 px-3">
                                <i className="bi bi-person me-1"></i>
                                UTILISATEUR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pied de carte avec action */}
                    <div className="card-footer bg-white border-0 pb-4 px-4">
                      <button
                        className={`btn w-100 ${isActive ? "btn-outline-danger" : "btn-outline-success"} py-2`}
                        disabled={updating === u._id}
                        onClick={() => handleToggleStatus(u._id)}
                        title={
                          isActive
                            ? "Désactiver ce compte"
                            : "Activer ce compte"
                        }
                      >
                        {updating === u._id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Modification...
                          </>
                        ) : isActive ? (
                          <>
                            <i className="bi bi-x-circle me-2"></i>
                            Désactiver le compte
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Activer le compte
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ===== VUE TABLEAU (conservée pour compatibilité) ===== */
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-table me-2"></i>
              Liste des clients
            </h5>
            <span className="badge bg-primary">
              <i className="bi bi-people me-1"></i>
              {filteredUsers.length} clients
            </span>
          </div>
          <div
            className="table-responsive"
            style={{ maxHeight: "600px", overflowY: "auto" }}
          >
            <table className="table table-hover align-middle mb-0">
              <thead
                className="table-dark"
                style={{ position: "sticky", top: 0, zIndex: 1 }}
              >
                <tr>
                  <th className="px-3">Code</th>
                  <th className="px-3">Client</th>
                  <th className="px-3">Email</th>
                  <th className="px-3">Adresse</th>
                  <th className="px-3">Téléphone</th>
                  <th className="px-3 text-center">Admin</th>
                  <th className="px-3 text-center">Statut</th>
                  <th className="px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isActive = u.actif === true;

                  return (
                    <tr
                      key={u._id}
                      className={!isActive ? "table-secondary" : ""}
                      style={updating === u._id ? { opacity: 0.7 } : {}}
                    >
                      <td className="px-3">
                        <span className="fw-semibold">
                          {u.client_code || "-"}
                        </span>
                      </td>
                      <td className="px-3">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-light p-2 me-2">
                            <i className="bi bi-person-circle text-primary"></i>
                          </div>
                          <span>{u.client_name || "-"}</span>
                        </div>
                      </td>
                      <td className="px-3">
                        {u.email ? (
                          <span>
                            <i className="bi bi-envelope me-1 text-muted"></i>
                            {u.email}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3">
                        {u.adresse ? (
                          <span
                            className="text-truncate d-inline-block"
                            style={{ maxWidth: "200px" }}
                            title={u.adresse}
                          >
                            <i className="bi bi-geo-alt me-1 text-muted"></i>
                            {u.adresse}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3">
                        {u.telephone ? (
                          <span>
                            <i className="bi bi-telephone me-1 text-muted"></i>
                            {u.telephone}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Colonne Admin */}
                      <td className="px-3 text-center">
                        {u.isAdmin ? (
                          <span className="badge bg-warning text-dark py-2 px-3">
                            <i className="bi bi-shield-check me-1"></i>
                            ADMIN
                          </span>
                        ) : (
                          <span className="badge bg-secondary py-2 px-3">
                            <i className="bi bi-person me-1"></i>
                            UTILISATEUR
                          </span>
                        )}
                      </td>

                      {/* Colonne Statut */}
                      <td className="px-3 text-center">
                        <span
                          className={`badge ${isActive ? "bg-success" : "bg-danger"} py-2 px-3`}
                        >
                          <i
                            className={`bi ${isActive ? "bi-check-circle" : "bi-x-circle"} me-1`}
                          ></i>
                          {isActive ? "ACTIF" : "INACTIF"}
                        </span>
                      </td>

                      {/* Colonne Action */}
                      <td className="px-3 text-center">
                        <button
                          className={`btn btn-sm ${isActive ? "btn-danger" : "btn-success"} px-3`}
                          disabled={updating === u._id}
                          onClick={() => handleToggleStatus(u._id)}
                          title={
                            isActive
                              ? "Désactiver ce compte"
                              : "Activer ce compte"
                          }
                        >
                          {updating === u._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              <span className="d-none d-md-inline">
                                Modification...
                              </span>
                            </>
                          ) : isActive ? (
                            <>
                              <i className="bi bi-x-circle me-md-2"></i>
                              <span className="d-none d-md-inline">
                                Désactiver
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-md-2"></i>
                              <span className="d-none d-md-inline">
                                Activer
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
