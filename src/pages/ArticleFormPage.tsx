import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { createArticle } from "../api/articles.api";
import { getCategories } from "../api/categories.api";
import type { Category } from "../types/category";
import "./ArticleFormPage.css";

type ApiValidationError = {
  error?: string;
  details?: Array<{
    path?: (string | number)[];
    message?: string;
  }>;
};

export function ArticleFormPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger les catégories.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        categoryIds:
          selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      };

      const article = await createArticle(payload);

      setSuccessMessage("Article enregistré en brouillon avec succès.");

      setTimeout(() => {
        navigate("/admin/articles");
      }, 800);

      return article;
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError<ApiValidationError>(error)) {
        const apiMessage = error.response?.data?.error;
        const validationDetails = error.response?.data?.details;

        if (apiMessage === "CATEGORY_NOT_FOUND") {
          setErrorMessage("Une ou plusieurs catégories sont introuvables.");
          return;
        }

        if (apiMessage === "VALIDATION_ERROR" && validationDetails?.length) {
          const firstMessage = validationDetails[0].message ?? "";

          if (firstMessage.includes("at least 3")) {
            setErrorMessage("Le titre doit contenir au moins 3 caractères.");
            return;
          }

          if (firstMessage.includes("at least 20")) {
            setErrorMessage("Le contenu doit contenir au moins 20 caractères.");
            return;
          }

          if (firstMessage.includes("at most 300")) {
            setErrorMessage("L’extrait ne peut pas dépasser 300 caractères.");
            return;
          }

          setErrorMessage("Les données du formulaire sont invalides.");
          return;
        }

        if (apiMessage) {
          setErrorMessage(apiMessage);
          return;
        }
      }

      setErrorMessage("Impossible d’enregistrer l’article.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="article-form-page">
      <div className="article-form-page__topbar">
        <div>
          <h1 className="article-form-page__title">Créer un article</h1>
          <p className="article-form-page__subtitle">
            Rédigez un nouvel article qui sera enregistré en brouillon.
          </p>
        </div>

        <Link to="/admin/articles" className="article-form-page__back-button">
          Retour
        </Link>
      </div>

      <div className="article-form-page__card">
        <form onSubmit={handleSubmit} className="article-form-page__form">
          <div className="article-form-page__field">
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex : Gérer son stress au quotidien"
            />
          </div>

          <div className="article-form-page__field">
            <label htmlFor="excerpt">Extrait</label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Petit résumé de l’article (optionnel)"
              rows={3}
            />
          </div>

          <div className="article-form-page__field">
            <label htmlFor="content">Contenu</label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Rédigez le contenu complet de l’article..."
              rows={12}
            />
          </div>

          <div className="article-form-page__field">
            <label>Catégories</label>

            {loadingCategories ? (
              <p className="article-form-page__helper">Chargement des catégories...</p>
            ) : categories.length === 0 ? (
              <p className="article-form-page__helper">Aucune catégorie disponible.</p>
            ) : (
              <div className="article-form-page__categories">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="article-form-page__category-option"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="article-form-page__message article-form-page__message--error">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="article-form-page__message article-form-page__message--success">
              {successMessage}
            </p>
          )}

          <div className="article-form-page__actions">
            <Link
              to="/admin/articles"
              className="article-form-page__cancel-button"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="article-form-page__save-button"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer le brouillon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
