import { useState, useEffect } from 'react';
import { getAllUsers, toggleUserStatus } from '../services/userService';
import './UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setUpdating(userId);
      const updatedUser = await toggleUserStatus(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? updatedUser : user
        )
      );
    } catch (err) {
      setError('Erreur lors de la modification du statut');
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  };

  if (loading) {
    return (
      <div className="user-list-wrapper">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="user-list-wrapper">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur!</h4>
          <p>{error}</p>
          <hr />
          <button onClick={loadUsers} className="btn btn-danger">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-wrapper">
      <div className="user-list-header">
        <div>
          <h1 className="user-list-title">Gestion des Clients</h1>
          <p className="user-list-subtitle">Consultez et gérez tous les clients et leurs factures</p>
        </div>
        <button 
          onClick={loadUsers} 
          className="btn btn-outline-primary" 
          disabled={loading}
        >
          <span className="me-2">🔄</span>Actualiser
        </button>
      </div>

      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <span>{error}</span>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Code Client</th>
                  <th>Nom Client</th>
                  <th>Rôle</th>
                  <th>Article</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>N° Facture</th>
                  <th>Quantité</th>
                  <th>Montant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <p className="text-muted mb-0">Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={user.actif ? '' : 'table-secondary'}>
                      <td><strong>{user.codeClient}</strong></td>
                      <td>{user.nomClient}</td>
                      <td>
                        <span className="badge bg-info">{user.role}</span>
                      </td>
                      <td>{user.article}</td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }} title={user.description}>
                        {user.description || '-'}
                      </td>
                      <td>{user.date ? new Date(user.date).toLocaleDateString('fr-FR') : '-'}</td>
                      <td><code>{user.numeroFacture}</code></td>
                      <td className="text-center">{user.quantite}</td>
                      <td className="text-end fw-bold">{formatMontant(user.montant)}</td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={updating === user.id}
                          className={`btn btn-sm ${user.actif ? 'btn-danger' : 'btn-success'}`}
                          title={user.actif ? 'Désactiver' : 'Activer'}
                        >
                          {updating === user.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              <span className="visually-hidden">Chargement...</span>
                            </>
                          ) : user.actif ? (
                            '🚫 Désactiver'
                          ) : (
                            '✅ Activer'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Clients</h5>
              <h3 className="text-primary">{users.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Clients Actifs</h5>
              <h3 className="text-success">{users.filter((u) => u.actif).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Montant Total</h5>
              <h3 className="text-info">
                {formatMontant(users.reduce((sum, u) => sum + (u.montant || 0), 0))}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserList;
