import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName");

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-layout">
      {isMenuOpen && <div className="admin-overlay" onClick={closeMenu} />}

      <aside className={`admin-sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <h2>CESIZen Admin</h2>

          <button
            className="admin-close-button"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={closeMenu}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Utilisateurs
          </NavLink>

          <NavLink
            to="/admin/articles"
            onClick={closeMenu}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Articles
          </NavLink>

          <NavLink
            to="/admin/categories"
            onClick={closeMenu}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            Catégories
          </NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-burger-button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>

            <span className="admin-welcome">
              Bienvenue {userName ?? "Admin"}
            </span>
          </div>

          <button className="admin-logout-button" onClick={handleLogout}>
            Déconnexion
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}