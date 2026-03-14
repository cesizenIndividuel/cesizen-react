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

function getUserAvatarSrc(user: User) {
  if (user.avatarUrl) {
    if (user.avatarUrl.startsWith("http")) {
      return user.avatarUrl;
    }

    return `http://localhost:3000${user.avatarUrl}`;
  }

  return user.role === "ADMIN"
    ? "/avatar-admin.png"
    : "/avatar-user.png";
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  async function handleToggleUser(user: User) {
    try {
      const updatedUser = await updateUserStatus(user.id, !user.isActive);

      setUsers((previousUsers) =>
        previousUsers.map((u) =>
          u.id === user.id
            ? { ...u, isActive: updatedUser.isActive }
            : u
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
                style={{ textAlign: "left", padding: "14px 8px", cursor: "pointer" }}
              >
                Nom{getSortIndicator("name", sortField, sortDirection)}
              </th>

              <th
                onClick={() => handleSort("email")}
                style={{ textAlign: "left", padding: "14px 8px", cursor: "pointer" }}
              >
                Email{getSortIndicator("email", sortField, sortDirection)}
              </th>

              <th
                onClick={() => handleSort("role")}
                style={{ textAlign: "left", padding: "14px 8px", cursor: "pointer" }}
              >
                Rôle{getSortIndicator("role", sortField, sortDirection)}
              </th>

              <th
                onClick={() => handleSort("status")}
                style={{ textAlign: "left", padding: "14px 8px", cursor: "pointer" }}
              >
                Statut{getSortIndicator("status", sortField, sortDirection)}
              </th>

              <th style={{ textAlign: "left", padding: "14px 8px" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor:
                    hoveredUserId === user.id ? "#f9fafb" : "#ffffff",
                  transition: "background-color 0.2s",
                }}
              >
                {/* NOM + AVATAR */}
                <td style={{ padding: "16px 8px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontWeight: 500,
                    }}
                  >
                    <img
                      src={getUserAvatarSrc(user)}
                      alt={getFullName(user)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border:
                          user.role === "ADMIN"
                            ? "2px solid #5A8B7A"
                            : "2px solid transparent",
                      }}
                    />

                    {getFullName(user)}
                  </div>
                </td>

                <td style={{ padding: "16px 8px" }}>{user.email}</td>

                <td style={{ padding: "16px 8px" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      backgroundColor:
                        user.role === "ADMIN" ? "#5A8B7A" : "#E8F0EC",
                      color: user.role === "ADMIN" ? "#fff" : "#303A3C",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                <td style={{ padding: "16px 8px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      disabled={user.role === "ADMIN"}
                      onClick={() => {
                        if (user.role !== "ADMIN") {
                          handleToggleUser(user);
                        }
                      }}
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor:
                          user.role === "ADMIN"
                            ? "#E5E7EB"
                            : user.isActive
                            ? "#5A8B7A"
                            : "#D1D5DB",
                        cursor:
                          user.role === "ADMIN" ? "not-allowed" : "pointer",
                        position: "relative",
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
                          backgroundColor: "#fff",
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

                <td style={{ padding: "16px 8px" }}>
                  <button
                    style={{
                      border: "none",
                      background: "none",
                      color: "#059669",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}