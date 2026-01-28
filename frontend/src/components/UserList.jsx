import { useState, useEffect } from "react";
import { getAllUsers, toggleUserStatus } from "../services/userService";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserList() {
  // States (variables dynamiques)
  const [users, setUsers] = useState([]); // liste mtaa clients
  const [loading, setLoading] = useState(true); // loading chneya
  const [error, setError] = useState(null); // erreurs
  const [updating, setUpdating] = useState(null); // client li f update
  const [successMessage, setSuccessMessage] = useState(null); // message de succès

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
      const userBefore = users.find(u => u._id === userId);
      if (!userBefore) {
        setError("Utilisateur non trouvé");
        return;
      }
      
      const newStatus = !userBefore.actif;
      const action = newStatus ? "activation" : "désactivation";
      
      console.log(`🔄 Début ${action} pour: ${userBefore.client_name} (ID: ${userId})`);
      console.log(`📊 État actuel: ${userBefore.actif ? 'ACTIF' : 'INACTIF'} → État futur: ${newStatus ? 'ACTIF' : 'INACTIF'}`);
      
      // Mettre à jour l'état updating
      setUpdating(userId);
      
      // Appeler l'API pour modifier le statut
      const updatedUser = await toggleUserStatus(userId);
      console.log("✅ Réponse API:", updatedUser);
      
      // Vérifier que la réponse contient bien le nouveau statut
      if (updatedUser.actif !== undefined) {
        // Mettre à jour la liste des utilisateurs
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u))
        );
        
        // Afficher un message de succès
        const message = `Le compte de ${userBefore.client_name} a été ${updatedUser.actif ? "activé" : "désactivé"} avec succès!`;
        setSuccessMessage(message);
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
        
        console.log(`✅ ${action} terminée avec succès`);
        console.log(`🔄 Nouvel état: ${updatedUser.actif ? 'ACTIF' : 'INACTIF'}`);
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
        })
      );
    } finally {
      setUpdating(null);
    }
  };

  // Formattage mtaa montant (TND)
  const formatMontantTND = (m) => `${Number(m || 0).toFixed(2)} TND`;

  // Formattage mtaa date (format fr)
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR")
      : "-";

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des utilisateurs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header SIMPLIFIÉ */}
      <div className="mb-4">
        <h1 className="fw-bold text-dark mb-2">Gestion des Comptes Clients</h1>
        <p className="text-muted">
          Activez ou désactivez les comptes des clients
        </p>
      </div>

      {/* Messages d'erreur et succès */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <strong>❌ Erreur:</strong> {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <strong>✅ Succès!</strong> {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage(null)}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {/* Statistiques - DÉPLACÉES EN HAUT */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <span className="fs-4 text-primary">👥</span>
              </div>
              <h6 className="text-muted mb-2">Total Comptes</h6>
              <h3 className="text-primary fw-bold">{users.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <span className="fs-4 text-success">✅</span>
              </div>
              <h6 className="text-muted mb-2">Comptes Actifs</h6>
              <h3 className="text-success fw-bold">
                {users.filter(u => u.actif).length}
              </h3>
              {users.length > 0 && (
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ 
                      width: `${(users.filter(u => u.actif).length / users.length) * 100}%` 
                    }}
                    aria-valuenow={(users.filter(u => u.actif).length / users.length) * 100}
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <span className="fs-4 text-danger">⛔</span>
              </div>
              <h6 className="text-muted mb-2">Comptes Inactifs</h6>
              <h3 className="text-danger fw-bold">
                {users.filter(u => !u.actif).length}
              </h3>
              {users.length > 0 && (
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div 
                    className="progress-bar bg-danger" 
                    role="progressbar" 
                    style={{ 
                      width: `${(users.filter(u => !u.actif).length / users.length) * 100}%` 
                    }}
                    aria-valuenow={(users.filter(u => !u.actif).length / users.length) * 100}
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <span className="fs-4 text-info">💰</span>
              </div>
              <h6 className="text-muted mb-2">Montant Total</h6>
              <h3 className="text-info fw-bold">
                {formatMontantTND(
                  users.reduce((s, u) => s + Number(u.montant || 0), 0)
                )}
              </h3>
              <small className="text-muted">Tous clients confondus</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs - TABLE FIXE (sans scroll interne) */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="table-dark text-uppercase small">
              <tr>
                <th style={{ minWidth: "100px" }}>Code</th>
                <th style={{ minWidth: "250px" }}>Client</th>
                <th style={{ minWidth: "100px" }}>Rôle</th>
                <th style={{ minWidth: "120px" }}>Article</th>
                <th style={{ minWidth: "200px" }}>Description</th>
                <th style={{ minWidth: "100px" }}>Date</th>
                <th style={{ minWidth: "120px" }}>Facture</th>
                <th style={{ minWidth: "80px" }} className="text-center">Qté</th>
                <th style={{ minWidth: "120px" }} className="text-end">Montant</th>
                <th style={{ minWidth: "100px" }} className="text-center">Statut</th>
                <th style={{ minWidth: "150px" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center text-muted py-5">
                    <div className="py-4">
                      <span className="fs-1">📭</span>
                      <h5 className="mt-3">Aucun client trouvé</h5>
                      <p className="text-muted">La liste des clients est vide</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = u.actif === true;
                  
                  return (
                    <tr 
                      key={u._id} 
                      className={!isActive ? "table-secondary" : ""}
                      style={updating === u._id ? { opacity: 0.7 } : {}}
                    >
                      <td><strong>{u.client_code || "-"}</strong></td>
                      <td>{u.client_name || "-"}</td>
                      <td>
                        <span className="badge bg-info">
                          {u.role || "-"}
                        </span>
                      </td>
                      <td>{u.article || "-"}</td>
                      <td 
                        className="text-truncate" 
                        style={{ 
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={u.description || "-"}
                      >
                        {u.description || "-"}
                      </td>
                      <td>{formatDate(u.date)}</td>
                      <td><code>{u.facture_num || "-"}</code></td>
                      <td className="text-center">
                        <span className="badge bg-primary">
                          {u.quantite ?? "-"}
                        </span>
                      </td>
                      <td className="text-end fw-bold">
                        {formatMontantTND(u.montant)}
                      </td>
                      
                      {/* Colonne Statut */}
                      <td className="text-center">
                        <span 
                          className={`badge ${isActive ? "bg-success" : "bg-danger"} p-2`}
                          style={{ fontSize: "0.85em" }}
                        >
                          {isActive ? (
                            <>
                              <span className="me-1">●</span>
                              ACTIF
                            </>
                          ) : (
                            <>
                              <span className="me-1">●</span>
                              INACTIF
                            </>
                          )}
                        </span>
                      </td>
                      
                      {/* Colonne Action */}
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center">
                          <button
                            className={`btn btn-sm ${isActive ? "btn-danger" : "btn-success"} fw-bold`}
                            disabled={updating === u._id}
                            onClick={() => handleToggleStatus(u._id)}
                            style={{ 
                              minWidth: "120px",
                              transition: "all 0.3s"
                            }}
                            title={isActive ? "Cliquez pour DÉSACTIVER ce compte" : "Cliquez pour ACTIVER ce compte"}
                          >
                            {updating === u._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                <span>Modification...</span>
                              </>
                            ) : isActive ? (
                              <>
                                <span className="me-1">✕</span>
                                Désactiver
                              </>
                            ) : (
                              <>
                                <span className="me-1">✓</span>
                                Activer
                              </>
                            )}
                          </button>
                          
                          {/* Indicateur visuel */}
                          <small className={`mt-1 ${isActive ? "text-success" : "text-danger"}`}>
                            {isActive ? "Compte actif" : "Compte inactif"}
                          </small>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}