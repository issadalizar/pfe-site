import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";

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
      const response = await fetch("http://localhost:5000/api/users");
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

  const totalMontant = users.reduce((s, u) => s + Number(u.montant || 0), 0);

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="fw-bold"> Liste des Clients</h1>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="alert alert-info d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" />
              Chargement des données...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger">
              ❌ Erreur : {error}
            </div>
          )}

          {/* Empty */}
          {!loading && users.length === 0 && !error && (
            <div className="alert alert-warning">
              ⚠️ Aucun client trouvé
            </div>
          )}

          {/* Table */}
          {!loading && users.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between">
                <h5 className="mb-0">
                  Tableau des Clients ({users.length})
                </h5>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Code</th>
                        <th>Client</th>
                        <th>Article</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Facture</th>
                        <th className="text-center">Qté</th>
                        <th className="text-end">Montant</th>
                        <th>Rôle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td><strong>{u.client_code}</strong></td>
                          <td>{u.client_name}</td>
                          <td>{u.article}</td>
                          <td className="text-muted small">
                            {u.description}
                          </td>
                          <td>
                            {new Date(u.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td>{u.facture_num}</td>
                          <td className="text-center">
                            <span className="badge bg-info">
                              {u.quantite}
                            </span>
                          </td>
                          <td className="text-end fw-bold">
                            {Number(u.montant).toFixed(2)} TND
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                u.role === "admin"
                                  ? "danger"
                                  : u.role === "user"
                                  ? "secondary"
                                  : "primary"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <hr />

                <div className="d-flex flex-wrap gap-3 text-muted">
                  <span>
                    <strong>Total clients :</strong> {users.length}
                  </span>
                  <span>
                    <strong>Montant total :</strong>{" "}
                    {totalMontant.toFixed(2)} TND
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
 }