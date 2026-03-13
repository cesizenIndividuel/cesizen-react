import { useEffect, useState } from "react";
import { getUsers } from "../api/users.api";
import type { User } from "../types/user";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setErrorMessage("");
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger les utilisateurs.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <p>Chargement des utilisateurs...</p>;
  }

  if (errorMessage) {
    return <p style={{ color: "crimson" }}>{errorMessage}</p>;
  }

  if (users.length === 0) {
    return (
      <div>
        <h1>Utilisateurs</h1>
        <p>Aucun utilisateur à afficher.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Utilisateurs</h1>
      <p style={{ marginTop: 0, marginBottom: "24px", color: "#666" }}>
        Liste des comptes utilisateurs de la plateforme CESIZen.
      </p>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f7f7f7" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Pseudo
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Rôle
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Statut
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td
                  style={{
                    padding: "14px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {user.email}
                </td>
                <td
                  style={{
                    padding: "14px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {user.pseudo}
                </td>
                <td
                  style={{
                    padding: "14px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {user.role}
                </td>
                <td
                  style={{
                    padding: "14px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {user.isActive ? "Actif" : "Inactif"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}