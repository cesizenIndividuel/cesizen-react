import { Link, Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    //Sidebar
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "220px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>CESIZen Admin</h2>

        {/* Menu de Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/users">Utilisateurs</Link>
          <Link to="/admin/articles">Articles</Link>
          <Link to="/admin/categories">Catégories</Link>
        </nav>
      </aside>

      {/* Zone où le contenu des pages va apparaitre */}
      <main style={{ flex: 1, padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
}