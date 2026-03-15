import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { deleteArticle, getAdminArticles, publishArticle, restoreArticle, type AdminArticleStatusFilter } from "../api/articles.api";
import type { AdminArticle } from "../types/article";
import "./ArticlesPage.css";
import { Link } from "react-router-dom";



type SortField = "title" | "author" | "status" | "date";
type SortDirection = "asc" | "desc";

type ApiValidationError = {
  error?: string;
  details?: Array<{
    path?: (string | number)[];
    message?: string;
  }>;
};

function getAuthorName(article: AdminArticle) {
  if (!article.author) return "Auteur inconnu";

  const fullName =
    `${article.author.firstName ?? ""} ${article.author.lastName ?? ""}`.trim();

  return fullName || article.author.pseudo;
}

function getStatusLabel(article: AdminArticle) {
  if (article.deletedAt) return "Supprimé";
  if (article.status === "PUBLISHED") return "Publié";
  return "Brouillon";
}

function getArticleImageSrc(article: AdminArticle) {
  const API_URL = import.meta.env.VITE_API_URL;

  if (article.imageUrl) {
    if (article.imageUrl.startsWith("http")) {
      return article.imageUrl;
    }

    return `${API_URL}${article.imageUrl}`;
  }

  return "/article-placeholder.png";
}

function getSortIndicator(
  currentField: SortField,
  activeField: SortField,
  direction: SortDirection
) {
  if (currentField !== activeField) return " ↕";
  return direction === "asc" ? " ↑" : " ↓";
}

export function ArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminArticleStatusFilter>("ALL");

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 10;

  const [articleToDelete, setArticleToDelete] = useState<AdminArticle | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getAdminArticles({
          page: 1,
          limit: 50,
          q: debouncedSearch.trim() || undefined,
          status: statusFilter,
        });

        setArticles(data.items);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger les articles.");
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [debouncedSearch, statusFilter]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  }

  const sortedArticles = useMemo(() => {
    const result = [...articles];

    result.sort((a, b) => {
      let valueA = "";
      let valueB = "";

      switch (sortField) {
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;

        case "author":
          valueA = getAuthorName(a).toLowerCase();
          valueB = getAuthorName(b).toLowerCase();
          break;

        case "status":
          valueA = getStatusLabel(a).toLowerCase();
          valueB = getStatusLabel(b).toLowerCase();
          break;

        case "date":
          valueA = a.publishedAt ?? a.createdAt;
          valueB = b.publishedAt ?? b.createdAt;
          break;
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [articles, sortField, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return sortedArticles.slice(startIndex, endIndex);
  }, [sortedArticles, currentPage]);

  async function handlePublish(articleId: string) {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const updatedArticle = await publishArticle(articleId);

      setArticles((previous) =>
        previous.map((article) =>
          article.id === articleId ? updatedArticle : article
        )
      );

      setSuccessMessage("Article publié avec succès.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossible de publier l'article.");
    }
  }

  async function handleRestore(articleId: string) {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const updatedArticle = await restoreArticle(articleId);

      setArticles((previous) =>
        previous.map((article) =>
          article.id === articleId ? updatedArticle : article
        )
      );

      setSuccessMessage("Article restauré avec succès.");
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError<ApiValidationError>(error)) {
        const apiMessage = error.response?.data?.error;

        if (apiMessage === "ARTICLE_NOT_DELETED") {
          setErrorMessage("Cet article n'est pas supprimé.");
          return;
        }
      }

      setErrorMessage("Impossible de restaurer l'article.");
    }
  }

  async function handleDeleteArticle() {
    if (!articleToDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteArticle(articleToDelete.id);

      setArticles((previous) =>
        previous.map((article) =>
          article.id === articleToDelete.id
            ? { ...article, deletedAt: new Date().toISOString() }
            : article
        )
      );

      setSuccessMessage("Article supprimé avec succès.");
      setArticleToDelete(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer l'article.");
    } finally {
      setIsDeleting(false);
    }
  }

  function goToPreviousPage() {
    setCurrentPage((previousPage) => Math.max(previousPage - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((previousPage) =>
      Math.min(previousPage + 1, totalPages || 1)
    );
  }

  function goToPage(page: number) {
    setCurrentPage(page);
  }

  if (loading) {
    return <p>Chargement des articles...</p>;
  }

  if (errorMessage && articles.length === 0) {
    return <p className="articles-page__error">{errorMessage}</p>;
  }

  return (
    <div className="articles-page">
      <div className="articles-page__header">
        <div>
          <h1 className="articles-page__title">Articles</h1>
          <p className="articles-page__subtitle">
            Gérez les brouillons, publications et suppressions d’articles.
          </p>
        </div>

        <Link to="/admin/articles/new" className="articles-page__create-button">
          Créer un article
        </Link>

      </div>

      <div className="articles-page__toolbar">
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="articles-page__search"
        />

        <div className="articles-page__filters">
          <button
            className={`articles-page__filter-pill ${
              statusFilter === "ALL" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("ALL")}
          >
            Tous
          </button>

          <button
            className={`articles-page__filter-pill ${
              statusFilter === "DRAFT" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("DRAFT")}
          >
            Brouillons
          </button>

          <button
            className={`articles-page__filter-pill ${
              statusFilter === "PUBLISHED" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("PUBLISHED")}
          >
            Publiés
          </button>

          <button
            className={`articles-page__filter-pill ${
              statusFilter === "DELETED" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("DELETED")}
          >
            Supprimés
          </button>
        </div>

      </div>

      {errorMessage && (
        <p className="articles-page__message articles-page__message--error">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="articles-page__message articles-page__message--success">
          {successMessage}
        </p>
      )}

      {sortedArticles.length === 0 ? (
        <p className="articles-page__empty">Aucun article à afficher.</p>
      ) : (
        <>
          <table className="articles-page__table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("title")}
                  className="articles-page__sortable"
                >
                  Titre{getSortIndicator("title", sortField, sortDirection)}
                </th>

                <th
                  onClick={() => handleSort("author")}
                  className="articles-page__sortable"
                >
                  Auteur{getSortIndicator("author", sortField, sortDirection)}
                </th>

                <th>Catégories</th>

                <th
                  onClick={() => handleSort("status")}
                  className="articles-page__sortable"
                >
                  Statut{getSortIndicator("status", sortField, sortDirection)}
                </th>

                <th
                  onClick={() => handleSort("date")}
                  className="articles-page__sortable"
                >
                  Date{getSortIndicator("date", sortField, sortDirection)}
                </th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedArticles.map((article) => {
                const isDeleted = Boolean(article.deletedAt);
                const isDraft = article.status === "DRAFT" && !isDeleted;
                const isPublished =
                  article.status === "PUBLISHED" && !isDeleted;

                return (
                  <tr key={article.id}>
                    <td>
                      <div className="articles-page__article-cell">
                        <img
                          src={getArticleImageSrc(article)}
                          alt={article.title}
                          className="articles-page__thumbnail"
                        />

                        <div className="articles-page__title-cell">
                          <span className="articles-page__title-text">
                            {article.title}
                          </span>

                          {article.excerpt && (
                            <span className="articles-page__excerpt">
                              {article.excerpt}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{getAuthorName(article)}</td>

                    <td>
                      <div className="articles-page__categories">
                        {article.categories.length > 0 ? (
                          article.categories.map((category) => (
                            <span
                              key={category.id}
                              className="articles-page__category-badge"
                            >
                              {category.name}
                            </span>
                          ))
                        ) : (
                          <span className="articles-page__muted">Aucune</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`articles-page__status-badge ${
                          isDeleted
                            ? "articles-page__status-badge--deleted"
                            : isPublished
                              ? "articles-page__status-badge--published"
                              : "articles-page__status-badge--draft"
                        }`}
                      >
                        {getStatusLabel(article)}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        article.publishedAt ?? article.createdAt
                      ).toLocaleDateString("fr-FR")}
                    </td>

                    <td>
                      <div className="articles-page__actions">
                      <Link
                        to={`/admin/articles/${article.id}`}
                        className="articles-page__action-button articles-page__action-button--edit"
                      >
                        Modifier
                      </Link>
                        {isDraft && (
                          <button
                            type="button"
                            onClick={() => handlePublish(article.id)}
                            className="articles-page__action-button articles-page__action-button--publish"
                          >
                            Publier
                          </button>
                        )}

                        {!isDeleted && (
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(article)}
                            className="articles-page__action-button articles-page__action-button--delete"
                          >
                            Supprimer
                          </button>
                        )}

                        {isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleRestore(article.id)}
                            className="articles-page__action-button articles-page__action-button--restore"
                          >
                            Restaurer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="articles-page__pagination">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="articles-page__pagination-button"
            >
              Précédent
            </button>

            <div className="articles-page__pagination-pages">
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`articles-page__pagination-number ${
                      currentPage === page
                        ? "articles-page__pagination-number--active"
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
              disabled={currentPage === totalPages || totalPages === 0}
              className="articles-page__pagination-button"
            >
              Suivant
            </button>
          </div>
        </>
      )}

      {articleToDelete && (
        <div className="articles-modal">
          <div
            className="articles-modal__overlay"
            onClick={() => setArticleToDelete(null)}
          />

          <div className="articles-modal__content">
            <h3>Supprimer l’article</h3>

            <p>
              Voulez-vous vraiment supprimer l’article
              <strong> {articleToDelete.title}</strong> ?
            </p>

            <p className="articles-modal__warning">
              Il sera masqué du site public, mais pourra être restauré.
            </p>

            <div className="articles-modal__actions">
              <button
                type="button"
                className="articles-modal__cancel"
                onClick={() => setArticleToDelete(null)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="articles-modal__delete"
                onClick={handleDeleteArticle}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
