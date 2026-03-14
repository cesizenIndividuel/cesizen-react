import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

function getNavLinkStyle(isActive: boolean) {
  return {
    display: "block",
    padding: "10px 12px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: isActive ? 700 : 500,
    backgroundColor: isActive ? "#222" : "transparent",
    color: isActive ? "#fff" : "#222",
    transition: "all 0.2s ease",
  };
}

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userName = localStorage.getItem("userName");

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        position: "relative",
      }}
    >
      {/* Overlay mobile */}
      {isMenuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            zIndex: 20,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e5e5",
          position: "fixed",
          top: 0,
          left: isMenuOpen ? "0" : "-260px",
          height: "100vh",
          zIndex: 30,
          transition: "left 0.3s ease",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0 }}>CESIZen Admin</h2>

          <button
            onClick={closeMenu}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              cursor: "pointer",
            }}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <NavLink to="/admin" end onClick={closeMenu}>
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Dashboard</span>
            )}
          </NavLink>

          <NavLink to="/admin/users" onClick={closeMenu}>
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Utilisateurs</span>
            )}
          </NavLink>

          <NavLink to="/admin/articles" onClick={closeMenu}>
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Articles</span>
            )}
          </NavLink>

          <NavLink to="/admin/categories" onClick={closeMenu}>
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Catégories</span>
            )}
          </NavLink>
        </nav>
      </aside>

      {/* Contenu principal */}
      <div
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e5e5",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setIsMenuOpen(true)}
            style={{
              border: "none",
              backgroundColor: "#5A8B7A",
              color: "#ffffff",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "20px",
              lineHeight: 1,
            }}
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>

          <span style={{ fontWeight: 600 }}>
            Bienvenue {userName ?? "Admin"}
          </span>

        </header>

        <main
          style={{
            padding: "32px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}