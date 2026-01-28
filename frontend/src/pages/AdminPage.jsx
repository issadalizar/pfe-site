import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminPage() {
  const [UserListComponent, setUserListComponent] = useState(() => () => <div>Chargement...</div>);
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger dynamiquement UserList
  useEffect(() => {
    import("../components/UserList.jsx")
      .then(module => {
        // Essayer export par défaut
        if (module.default) {
          setUserListComponent(() => module.default);
        } 
        // Essayer export nommé
        else if (module.UserList) {
          setUserListComponent(() => module.UserList);
        }
        // Sinon erreur
        else {
          console.error("UserList n'a aucun export valide:", module);
          setUserListComponent(() => () => (
            <div className="alert alert-danger">
              <h4>Erreur dans UserList.jsx</h4>
              <p>Le fichier doit avoir soit <code>export default function UserList()</code> soit <code>export function UserList()</code></p>
            </div>
          ));
        }
      })
      .catch(error => {
        console.error("Erreur de chargement de UserList:", error);
        setUserListComponent(() => () => (
          <div className="alert alert-danger">
            <h4>Fichier UserList.jsx non trouvé</h4>
            <p>Vérifiez que le fichier existe dans src/components/</p>
          </div>
        ));
      });
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
        <Header />
        <main className="p-4">
    
          <UserListComponent key={refreshKey} />
        </main>
      </div>
    </div>
  );
}

export default AdminPage;