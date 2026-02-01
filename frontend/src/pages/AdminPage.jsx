import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminPage() {
  const [UserListComponent, setUserListComponent] = useState(
    () => () => <div>Chargement...</div>
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    import("../components/UserList.jsx")
      .then((module) => {
        if (module.default) {
          setUserListComponent(() => module.default);
        } else if (module.UserList) {
          setUserListComponent(() => module.UserList);
        } else {
          console.error("UserList n'a aucun export valide:", module);
          setUserListComponent(
            () =>
              function UserListError() {
                return (
                  <div className="alert alert-danger">
                    <h4>Erreur dans UserList.jsx</h4>
                    <p>
                      Le fichier doit avoir soit{" "}
                      <code>export default function UserList()</code> soit{" "}
                      <code>export function UserList()</code>
                    </p>
                  </div>
                );
              }
          );
        }
      })
      .catch((error) => {
        console.error("Erreur de chargement de UserList:", error);
        setUserListComponent(
          () =>
            function UserListMissing() {
              return (
                <div className="alert alert-danger">
                  <h4>Fichier UserList.jsx non trouvé</h4>
                  <p>Vérifiez que le fichier existe dans src/components/</p>
                </div>
              );
            }
        );
      });
  }, []);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="bg-light">
      <main className="p-4">
        <UserListComponent key={refreshKey} />
      </main>
    </div>
  );
}

export default AdminPage;
