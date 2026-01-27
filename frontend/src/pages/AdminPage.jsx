import { useState } from 'react';
import Header from '../components/Header';
import UserList from '../components/UserList';
import './AdminPage.css';

function AdminPage() {
  // Simple state to trigger a refresh in the child
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="admin-page-container">
      <Header />
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">📊 Page Administrateur</h1>
            <p className="admin-subtitle">
              Gestion centralisée des utilisateurs et des paramètres
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleRefresh}>
            🔄 Actualiser
          </button>
        </div>
        <UserList key={refreshKey} />
      </main>
    </div>
  );
}

export default AdminPage;
