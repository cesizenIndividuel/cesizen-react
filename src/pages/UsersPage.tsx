import { useEffect, useMemo, useState } from "react";
import { getUsers, updateUserStatus } from "../api/users.api";
import type { User } from "../types/user";
import "./UsersPage.css";

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
  const API_URL = import.meta.env.VITE_API_URL;

  if (user.avatarUrl) {
    if (user.avatarUrl.startsWith("http")) {
      return user.avatarUrl;
    }

    return `${API_URL}${user.avatarUrl}`;
  }

  return user.role === "ADMIN" ? "/avatar-admin.png" : "/avatar-user.png";
}

//---------------------------------------------------------------------------//
export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;

    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  function goToPreviousPage() {
    setCurrentPage((previousPage) => Math.max(previousPage - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((previousPage) => Math.min(previousPage + 1, totalPages));
  }

  function goToPage(page: number) {
    setCurrentPage(page);
  }

  if (loading) {
    return <p>Chargement des utilisateurs...</p>;
  }

  if (errorMessage) {
    return <p className="users-page__error">{errorMessage}</p>;
  }

  return (
    <div className="users-page">
      <div className="users-page__card">
        <div className="users-page__header">
          <h1 className="users-page__title">Utilisateurs</h1>

          <input
            type="text"
            placeholder="Rechercher par email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="users-page__search"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p className="users-page__empty">Aucun utilisateur à afficher.</p>
        ) : (
          <>
            <table className="users-page__table">
              <thead>
                <tr className="users-page__head-row">
                  <th
                    onClick={() => handleSort("name")}
                    className="users-page__sortable"
                  >
                    Nom{getSortIndicator("name", sortField, sortDirection)}
                  </th>

                  <th
                    onClick={() => handleSort("email")}
                    className="users-page__sortable"
                  >
                    Email{getSortIndicator("email", sortField, sortDirection)}
                  </th>

                  <th
                    onClick={() => handleSort("role")}
                    className="users-page__sortable"
                  >
                    Rôle{getSortIndicator("role", sortField, sortDirection)}
                  </th>

                  <th
                    onClick={() => handleSort("status")}
                    className="users-page__sortable"
                  >
                    Statut{getSortIndicator("status", sortField, sortDirection)}
                  </th>

                  <th className="users-page__actions-header">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    onMouseEnter={() => setHoveredUserId(user.id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                    className={`users-page__row ${
                      hoveredUserId === user.id ? "users-page__row--hovered" : ""
                    }`}
                  >
                    <td className="users-page__cell">
                      <div className="users-page__name-cell">
                        <img
                          src={getUserAvatarSrc(user)}
                          alt={getFullName(user)}
                          className={`users-page__avatar ${
                            user.role === "ADMIN"
                              ? "users-page__avatar--admin"
                              : ""
                          }`}
                        />

                        <span className="users-page__name">
                          {getFullName(user)}
                        </span>
                      </div>
                    </td>

                    <td className="users-page__cell">{user.email}</td>

                    <td className="users-page__cell">
                      <span
                        className={`users-page__badge ${
                          user.role === "ADMIN"
                            ? "users-page__badge--admin"
                            : "users-page__badge--user"
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td className="users-page__cell">
                      <div className="users-page__status-cell">
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
                          className={`users-page__toggle ${
                            user.role === "ADMIN"
                              ? "users-page__toggle--disabled"
                              : user.isActive
                              ? "users-page__toggle--active"
                              : "users-page__toggle--inactive"
                          }`}
                        >
                          <span
                            className={`users-page__toggle-thumb ${
                              user.isActive
                                ? "users-page__toggle-thumb--active"
                                : "users-page__toggle-thumb--inactive"
                            }`}
                          />
                        </button>

                        <span
                          className={`users-page__status-text ${
                            user.role === "ADMIN"
                              ? "users-page__status-text--admin"
                              : user.isActive
                              ? "users-page__status-text--active"
                              : "users-page__status-text--inactive"
                          }`}
                        >
                          {user.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </div>
                    </td>

                    <td className="users-page__cell">
                      <button type="button" className="users-page__edit-button">
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="users-page__pagination">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="users-page__pagination-button"
              >
                Précédent
              </button>

              <div className="users-page__pagination-pages">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`users-page__pagination-number ${
                        currentPage === page
                          ? "users-page__pagination-number--active"
                          : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="users-page__pagination-button"
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}