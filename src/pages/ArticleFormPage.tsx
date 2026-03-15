import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { createArticle, getAdminArticleById, updateArticle, uploadArticleImage, uploadArticleContentImage } from "../api/articles.api";
import { getCategories } from "../api/categories.api";
import { RichTextEditor } from "../components/RichTextEditor";
import type { Category } from "../types/category";
import "./ArticleFormPage.css";


type ApiValidationError = {
  error?: string;
  details?: Array<{
    path?: (string | number)[];
    message?: string;
  }>;
};

const API_URL = import.meta.env.VITE_API_URL;

export function ArticleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(isEditMode);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;

      try {
        setErrorMessage("");
        const article = await getAdminArticleById(id);

        setTitle(article.title ?? "");
        setExcerpt(article.excerpt ?? "");
        setContent(article.content ?? "");
        setSelectedCategoryIds(article.categories.map((category) => category.id));
        setCurrentImageUrl(article.imageUrl ?? null);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger l'article.");
      } finally {
        setLoadingArticle(false);
      }
    }

    loadArticle();
  }, [id]);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    );
  }

  const previewImageUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    if (currentImageUrl) {
      if (currentImageUrl.startsWith("http")) {
        return currentImageUrl;
      }

      return `${API_URL}${currentImageUrl}`;
    }

    return null;
  }, [imageFile, currentImageUrl]);

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

      let savedArticleId: string | undefined;

      if (isEditMode && id) {
        const updatedArticle = await updateArticle(id, payload);
        savedArticleId = updatedArticle.id;

        if (imageFile) {
          const articleWithImage = await uploadArticleImage(savedArticleId, imageFile);
          setCurrentImageUrl(articleWithImage.imageUrl ?? null);
        }

        setSuccessMessage("Article mis à jour avec succès.");
      } else {
        const createdArticle = await createArticle(payload);
        savedArticleId = createdArticle.id;

        if (imageFile) {
          const articleWithImage = await uploadArticleImage(savedArticleId, imageFile);
          setCurrentImageUrl(articleWithImage.imageUrl ?? null);
        }

        setSuccessMessage("Article enregistré en brouillon avec succès.");
      }

      setTimeout(() => {
        navigate("/admin/articles");
      }, 800);
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError<ApiValidationError>(error)) {
        const apiMessage = error.response?.data?.error;
        const validationDetails = error.response?.data?.details;

        if (apiMessage === "CATEGORY_NOT_FOUND") {
          setErrorMessage("Une ou plusieurs catégories sont introuvables.");
          return;
        }

        if (apiMessage === "ARTICLE_NOT_FOUND") {
          setErrorMessage("Article introuvable.");
          return;
        }

        if (apiMessage === "NO_FILE_UPLOADED") {
          setErrorMessage("Aucune image n’a été sélectionnée.");
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

  if (loadingArticle) {
    return <p>Chargement de l'article...</p>;
  }

  return (
    <div className="article-form-page">
      <div className="article-form-page__topbar">
        <div>
          <h1 className="article-form-page__title">
            {isEditMode ? "Modifier un article" : "Créer un article"}
          </h1>
          <p className="article-form-page__subtitle">
            {isEditMode
              ? "Modifiez le contenu, l’image principale et les catégories de votre article."
              : "Rédigez un nouvel article, ajoutez une image principale et enregistrez-le en brouillon."}
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
            <label htmlFor="coverImage">Image principale</label>

            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setImageFile(file);
              }}
            />

            {previewImageUrl && (
              <div className="article-form-page__image-preview-wrapper">
                <img
                  src={previewImageUrl}
                  alt="Aperçu de l’image principale"
                  className="article-form-page__image-preview"
                />
              </div>
            )}

            <p className="article-form-page__helper">
              Cette image sera utilisée comme image principale de l’article.
            </p>
          </div>

          <div className="article-form-page__field">
            <label htmlFor="content">Contenu</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Rédigez le contenu complet de l’article..."
              onImageUpload={uploadArticleContentImage}
            />
          </div>

          <div className="article-form-page__field">
            <label>Catégories</label>

            {loadingCategories ? (
              <p className="article-form-page__helper">
                Chargement des catégories...
              </p>
            ) : categories.length === 0 ? (
              <p className="article-form-page__helper">
                Aucune catégorie disponible.
              </p>
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
              {isSaving
                ? "Enregistrement..."
                : isEditMode
                  ? "Enregistrer les modifications"
                  : "Enregistrer le brouillon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
