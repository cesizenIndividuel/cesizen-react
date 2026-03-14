import { useEffect, useMemo, useState } from "react";
import { getUsers, updateUserStatus } from "../api/users.api";
import type { User } from "../types/user";

type SortField = "name" | "email" | "role" | "status";
type SortDirection = "asc" | "desc";

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

function getSortIndicator(
  currentField: SortField,
  activeField: SortField,
  direction: SortDirection
) {
  if (currentField !== activeField) {
    return " ↕";
  }

  return direction === "asc" ? " ↑" : " ↓";
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  async function handleToggleUser(user: User) {
    try {
      const updatedUser = await updateUserStatus(user.id, !user.isActive);

      setUsers((previousUsers) =>
        previousUsers.map((u) =>
          u.id === user.id ? { ...u, isActive: updatedUser.isActive } : u
        )
      );
    } catch (error) {
      console.error(error);
      alert("Impossible de modifier le statut.");
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((previousDirection) =>
        previousDirection === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortField(field);
    setSortDirection("asc");
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

    const result = users.filter((user) => {
      if (!normalizedSearch) {
        return true;
      }

      const fullName = getFullName(user).toLowerCase();
      const email = user.email.toLowerCase();
      const pseudo = user.pseudo.toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        pseudo.includes(normalizedSearch)
      );
    });

    result.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      switch (sortField) {
        case "name":
          valueA = getFullName(a).toLowerCase();
          valueB = getFullName(b).toLowerCase();
          break;

        case "email":
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;

        case "role":
          valueA = getRoleLabel(a.role).toLowerCase();
          valueB = getRoleLabel(b.role).toLowerCase();
          break;

        case "status":
          valueA = a.isActive ? "actif" : "désactivé";
          valueB = b.isActive ? "actif" : "désactivé";
          break;
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [users, search, sortField, sortDirection]);

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
                  onClick={() => handleSort("name")}
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Nom{getSortIndicator("name", sortField, sortDirection)}
                </th>

                <th
                  onClick={() => handleSort("email")}
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Email{getSortIndicator("email", sortField, sortDirection)}
                </th>

                <th
                  onClick={() => handleSort("role")}
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Rôle{getSortIndicator("role", sortField, sortDirection)}
                </th>

                <th
                  onClick={() => handleSort("status")}
                  style={{
                    textAlign: "left",
                    padding: "14px 8px",
                    color: "#4b5563",
                    fontSize: "14px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Statut{getSortIndicator("status", sortField, sortDirection)}
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
                        color: user.role === "ADMIN" ? "#FFFFFF" : "#303A3C",
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
                        disabled={user.role === "ADMIN"}
                        onClick={() => {
                          if (user.role !== "ADMIN") {
                            handleToggleUser(user);
                          }
                        }}
                        title={
                          user.role === "ADMIN"
                            ? "Un administrateur ne peut pas être désactivé"
                            : ""
                        }
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "24px",
                          border: "none",
                          borderRadius: "999px",
                          backgroundColor:
                            user.role === "ADMIN"
                              ? "#E5E7EB"
                              : user.isActive
                              ? "#5A8B7A"
                              : "#D1D5DB",
                          cursor: user.role === "ADMIN" ? "not-allowed" : "pointer",
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
                          color:
                            user.role === "ADMIN"
                              ? "#9CA3AF"
                              : user.isActive
                              ? "#059669"
                              : "#6b7280",
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