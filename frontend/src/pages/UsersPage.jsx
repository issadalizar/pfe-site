import { useState, useEffect } from "react";
import Header from "../components/Header";
import "./UsersPage.css";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/users");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-container">
      <Header />

      <div className="users-main">
        <div className="users-header">
          <div>
            <h1 className="users-title">📊 Liste des Clients</h1>
            <p className="users-subtitle">
              Gestion complète des clients et de leurs commandes
            </p>
          </div>
          <button className="btn btn-primary" onClick={fetchUsers}>
            🔄 Actualiser
          </button>
        </div>

        {loading && (
          <div className="alert alert-info">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            >
              <span className="visually-hidden">Chargement...</span>
            </div>
            Chargement des données...
          </div>
        )}

        {error && <div className="alert alert-danger">❌ Erreur: {error}</div>}

        {!loading && users.length === 0 && !error && (
          <div className="alert alert-warning">⚠️ Aucun client trouvé</div>
        )}

        {!loading && users.length > 0 && (
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Tableau des Clients ({users.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Code Client</th>
                      <th>Nom Client</th>
                      <th>Article</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Facture</th>
                      <th>Quantité</th>
                      <th>Montant</th>
                      <th>Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.client_code}</strong>
                        </td>
                        <td>{user.client_name}</td>
                        <td>{user.article}</td>
                        <td className="text-muted small">{user.description}</td>
                        <td>
                          {new Date(user.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td>{user.facture_num}</td>
                        <td className="text-center">
                          <span className="badge bg-info">{user.quantite}</span>
                        </td>
                        <td className="text-end">
                          <strong>{user.montant.toFixed(2)} TND</strong>
                        </td>
                        <td>
                          <span
                            className={`badge bg-${user.role === "admin" ? "danger" : user.role === "user" ? "secondary" : "primary"}`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <hr />
              <p className="text-muted mb-0">
                <strong>Total:</strong> {users.length} clients •
                <strong className="ms-3">Montant total:</strong>{" "}
                {users.reduce((sum, u) => sum + u.montant, 0).toFixed(2)} TND
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
