import { useEffect, useMemo, useState } from "react";
import { getUsers, updateUserStatus } from "../api/users.api";
import type { User } from "../types/user";

function getRoleLabel(role: User["role"]) {
  return role === "ADMIN" ? "Administrateur" : "Utilisateur";
}

function getFullName(user: User) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  if (fullName) {
    return fullName;
  }

  return user.pseudo;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  async function handleToggleUser(user: User) {
    try {
      const updatedUser = await updateUserStatus(user.id, !user.isActive);

      setUsers((previousUsers) =>
        previousUsers.map((u) => (u.id === user.id ? updatedUser : u))
      );
    } catch (error) {
      console.error(error);
      alert("Impossible de modifier le statut.");
    }
  }

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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      const fullName = getFullName(user).toLowerCase();
      const email = user.email.toLowerCase();
      const pseudo = user.pseudo.toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        pseudo.includes(normalizedSearch)
      );
    });
  }, [users, search]);

  if (loading) {
    return <p>Chargement des utilisateurs...</p>;
  }

  if (errorMessage) {
    return <p style={{ color: "crimson" }}>{errorMessage}</p>;
  }

  return (
    <div>
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#1f2937",
            }}
          >
            Utilisateurs
          </h1>

          <input
            type="text"
            placeholder="Rechercher par email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: "280px",
              maxWidth: "100%",
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p style={{ margin: 0, color: "#6b7280" }}>
            Aucun utilisateur à afficher.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                  }}
                >
                  Nom
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                  }}
                >
                  Rôle
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                  }}
                >
                  Statut
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <td
                    style={{
                      padding: "16px 8px",
                      color: "#1f2937",
                      fontWeight: 500,
                    }}
                  >
                    {getFullName(user)}
                  </td>

                  <td
                    style={{
                      padding: "16px 8px",
                      color: "#374151",
                    }}
                  >
                    {user.email}
                  </td>

                  <td
                    style={{
                      padding: "16px 8px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        backgroundColor:
                          user.role === "ADMIN" ? "#5A8B7A" : "#E8F0EC",
                        color: user.role === "ADMIN" ? "#FFFF" : "#303A3C",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "16px 8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleUser(user)}
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "24px",
                          border: "none",
                          borderRadius: "999px",
                          backgroundColor: user.isActive ? "#5A8B7A" : "#D1D5DB",
                          cursor: "pointer",
                          transition: "0.2s",
                          padding: 0,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "3px",
                            left: user.isActive ? "23px" : "3px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                            transition: "0.2s",
                          }}
                        />
                      </button>

                      <span
                        style={{
                          color: user.isActive ? "#059669" : "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        {user.isActive ? "Actif" : "Désactivé"}
                      </span>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "16px 8px",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        border: "none",
                        background: "none",
                        color: "#059669",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}