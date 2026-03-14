import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../api/users.api";
import type { User } from "../types/user";
import "./UserDetailsPage.css";

type EditableRole = "USER" | "ADMIN";

export function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [user, setUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EditableRole>("USER");
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        setErrorMessage("Utilisateur introuvable.");
        setLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        const data = await getUserById(id);

        setUser(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPseudo(data.pseudo ?? "");
        setEmail(data.email ?? "");
        setRole(data.role);
        setIsActive(data.isActive);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger l'utilisateur.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedUser = await updateUser(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        pseudo: pseudo.trim(),
        email: email.trim(),
        role,
        isActive,
      });

      setUser(updatedUser);
      setSuccessMessage("Utilisateur mis à jour avec succès.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossible de mettre à jour l'utilisateur.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <p>Chargement de l'utilisateur...</p>;
  }

  if (errorMessage && !user) {
    return <p className="user-details__error">{errorMessage}</p>;
  }

  return (
    <div className="user-details">
      <div className="user-details__topbar">
        <div>
          <h1 className="user-details__title">Modifier un utilisateur</h1>
          <p className="user-details__subtitle">
            Consultez et modifiez les informations du compte.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="user-details__back-button"
        >
          Retour
        </button>
      </div>

      <div className="user-details__card">
        <form onSubmit={handleSubmit} className="user-details__form">
          <div className="user-details__grid">
            <div className="user-details__field">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>

            <div className="user-details__field">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>

            <div className="user-details__field">
              <label htmlFor="pseudo">Pseudo</label>
              <input
                id="pseudo"
                type="text"
                value={pseudo}
                onChange={(event) => setPseudo(event.target.value)}
              />
            </div>

            <div className="user-details__field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="user-details__field">
              <label htmlFor="role">Rôle</label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value as EditableRole)}
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div className="user-details__field">
              <label htmlFor="status">Statut</label>
              <select
                id="status"
                value={isActive ? "active" : "inactive"}
                onChange={(event) => setIsActive(event.target.value === "active")}
              >
                <option value="active">Actif</option>
                <option value="inactive">Désactivé</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <p className="user-details__message user-details__message--error">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="user-details__message user-details__message--success">
              {successMessage}
            </p>
          )}

          <div className="user-details__actions">
            <Link to="/admin/users" className="user-details__cancel-button">
              Annuler
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="user-details__save-button"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}