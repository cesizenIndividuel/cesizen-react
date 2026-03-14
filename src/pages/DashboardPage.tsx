import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminDashboard,
  type DashboardRecentArticle,
  type DashboardRecentUser,
  type DashboardStats,
} from "../api/dashboard.api";
import "./DashboardPage.css";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatRelativeDate(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }

  if (diffDays === 1) {
    return "Hier";
  }

  return `Il y a ${diffDays} jours`;
}

function getAuthorName(article: DashboardRecentArticle) {
  const fullName =
    `${article.author.firstName ?? ""} ${article.author.lastName ?? ""}`.trim();

  return fullName || article.author.pseudo;
}

function getUserDisplayName(user: DashboardRecentUser) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.pseudo;
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    articlesCount: 0,
    diagnosticsCount: 0,
    commentsCount: 0,
  });

  const [recentArticles, setRecentArticles] = useState<DashboardRecentArticle[]>(
    []
  );
  const [recentUsers, setRecentUsers] = useState<DashboardRecentUser[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setErrorMessage("");
        const data = await getAdminDashboard();

        setStats(data.stats);
        setRecentArticles(data.recentArticles);
        setRecentUsers(data.recentUsers);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger le dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Chargement du dashboard...</p>;
  }

  if (errorMessage) {
    return <p className="dashboard-page__error">{errorMessage}</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__hero">
        <h1 className="dashboard-page__title">Dashboard Administrateur</h1>
        <p className="dashboard-page__subtitle">
          Vue d’ensemble de l’activité de la plateforme Elyzen
        </p>
      </div>

      <section className="dashboard-page__section">
        <h2 className="dashboard-page__section-title">Indicateurs clés</h2>

        <div className="dashboard-page__stats-grid">
          <div className="dashboard-page__stat-card">
            <div className="dashboard-page__stat-icon">👥</div>
            <div className="dashboard-page__stat-value">
              {formatNumber(stats.usersCount)}
            </div>
            <div className="dashboard-page__stat-label">Utilisateurs</div>
          </div>

          <div className="dashboard-page__stat-card">
            <div className="dashboard-page__stat-icon">📰</div>
            <div className="dashboard-page__stat-value">
              {formatNumber(stats.articlesCount)}
            </div>
            <div className="dashboard-page__stat-label">Articles</div>
          </div>

          <div className="dashboard-page__stat-card">
            <div className="dashboard-page__stat-icon">💚</div>
            <div className="dashboard-page__stat-value">
              {formatNumber(stats.diagnosticsCount)}
            </div>
            <div className="dashboard-page__stat-label">Diagnostics</div>
          </div>

          <div className="dashboard-page__stat-card">
            <div className="dashboard-page__stat-icon">💬</div>
            <div className="dashboard-page__stat-value">
              {formatNumber(stats.commentsCount)}
            </div>
            <div className="dashboard-page__stat-label">Commentaires</div>
          </div>
        </div>
      </section>

      <section className="dashboard-page__section">
        <h2 className="dashboard-page__section-title">Actions rapides</h2>

        <div className="dashboard-page__quick-grid">
          <div className="dashboard-page__quick-card">
            <div className="dashboard-page__quick-icon">📰</div>
            <h3>Gérer les articles</h3>
            <p>Consulter, modifier et supprimer les articles de la plateforme</p>
            <Link to="/admin/articles" className="dashboard-page__quick-button">
              Accéder
            </Link>
          </div>

          <div className="dashboard-page__quick-card">
            <div className="dashboard-page__quick-icon">👥</div>
            <h3>Gérer les utilisateurs</h3>
            <p>Administrer les comptes utilisateurs et leurs permissions</p>
            <Link to="/admin/users" className="dashboard-page__quick-button">
              Accéder
            </Link>
          </div>

          <div className="dashboard-page__quick-card">
            <div className="dashboard-page__quick-icon">🏷️</div>
            <h3>Gérer les catégories</h3>
            <p>Organiser et modifier les catégories d’articles</p>
            <Link to="/admin/categories" className="dashboard-page__quick-button">
              Accéder
            </Link>
          </div>

          <div className="dashboard-page__quick-card">
            <div className="dashboard-page__quick-icon">➕</div>
            <h3>Créer un nouvel article</h3>
            <p>Rédiger et publier un nouvel article de bien-être</p>
            <Link to="/admin/articles" className="dashboard-page__quick-button">
              Créer
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-page__section">
        <h2 className="dashboard-page__section-title">Activité récente</h2>

        <div className="dashboard-page__activity-grid">
          <div className="dashboard-page__activity-card">
            <h3 className="dashboard-page__activity-title">
              Derniers articles publiés
            </h3>

            {recentArticles.length === 0 ? (
              <p className="dashboard-page__empty">Aucun article récent.</p>
            ) : (
              <div className="dashboard-page__activity-list">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="dashboard-page__activity-item"
                  >
                    <div>
                      <p className="dashboard-page__activity-main">
                        {article.title}
                      </p>
                      <p className="dashboard-page__activity-sub">
                        Par {getAuthorName(article)}
                      </p>
                    </div>

                    <span className="dashboard-page__activity-time">
                      {formatRelativeDate(article.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-page__activity-card">
            <h3 className="dashboard-page__activity-title">
              Derniers comptes créés
            </h3>

            {recentUsers.length === 0 ? (
              <p className="dashboard-page__empty">Aucun utilisateur récent.</p>
            ) : (
              <div className="dashboard-page__activity-list">
                {recentUsers.map((user) => (
                  <div key={user.id} className="dashboard-page__activity-item">
                    <div>
                      <p className="dashboard-page__activity-main">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="dashboard-page__activity-sub">
                        {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
                      </p>
                    </div>

                    <span className="dashboard-page__activity-time">
                      {formatRelativeDate(user.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
