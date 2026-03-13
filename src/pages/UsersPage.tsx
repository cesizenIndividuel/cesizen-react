import { useEffect, useState } from "react";
import { getUsers } from "../api/users.api";
import type { User } from "../types/user";

export function UsersPage() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1>Utilisateurs</h1>

      <ul>
        {users.map((user) => (
        <li key={user.id}>
          {user.email} — {user.role} — {user.isActive ? "Actif" : "Inactif"}
        </li>
        ))}
      </ul>
    </div>
  );
}