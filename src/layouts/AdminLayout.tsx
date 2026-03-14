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
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
      }}
    >
      <aside
        style={{
          width: "240px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e5e5",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "24px" }}>CESIZen Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <NavLink to="/admin" end>
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Dashboard</span>
            )}
          </NavLink>

          <NavLink to="/admin/users">
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Utilisateurs</span>
            )}
          </NavLink>

          <NavLink to="/admin/articles">
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Articles</span>
            )}
          </NavLink>

          <NavLink to="/admin/categories">
            {({ isActive }) => (
              <span style={getNavLinkStyle(isActive)}>Catégories</span>
            )}
          </NavLink>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "32px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}