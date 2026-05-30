import { useState } from "react";
import UserList from "../../components/Admin/UserList";
import "bootstrap/dist/css/bootstrap.min.css";
export default function UsersPage() {
  // State pour forcer le rafraîchissement de la liste des utilisateurs après une modification
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="bg-light">
      <main className="p-4">
        <UserList key={refreshKey} />
      </main>
    </div>
  );
}
