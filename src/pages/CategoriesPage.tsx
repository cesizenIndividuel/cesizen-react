import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categories.api";
import type { Category } from "../types/category";
import "./CategoriesPage.css";

type ApiValidationError = {
  error?: string;
  details?: Array<{
    path?: (string | number)[];
    message?: string;
  }>;
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [createName, setCreateName] = useState("");
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [createSuccessMessage, setCreateSuccessMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editSuccessMessage, setEditSuccessMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setErrorMessage("");
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossible de charger les catégories.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  }, [categories]);

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCreateErrorMessage("");
      setCreateSuccessMessage("");
      setIsCreating(true);

      const createdCategory = await createCategory({
        name: createName.trim(),
      });

      setCategories((previous) => [createdCategory, ...previous]);
      setCreateName("");
      setCreateSuccessMessage("Catégorie créée avec succès.");
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError<ApiValidationError>(error)) {
        const apiMessage = error.response?.data?.error;
        const validationDetails = error.response?.data?.details;

        if (apiMessage === "CATEGORY_NAME_ALREADY_USED") {
          setCreateErrorMessage("Cette catégorie existe déjà.");
          return;
        }

        if (apiMessage === "VALIDATION_ERROR" && validationDetails?.length) {
          setCreateErrorMessage(
            validationDetails[0].message ?? "Données invalides."
          );
          return;
        }

        if (apiMessage) {
          setCreateErrorMessage(apiMessage);
          return;
        }
      }

      setCreateErrorMessage("Impossible de créer la catégorie.");
    } finally {
      setIsCreating(false);
    }
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setEditErrorMessage("");
    setEditSuccessMessage("");
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditName("");
    setEditErrorMessage("");
  }

  async function handleUpdateCategory(categoryId: string) {
    try {
      setEditErrorMessage("");
      setEditSuccessMessage("");
      setIsUpdating(true);

      const updatedCategory = await updateCategory(categoryId, {
        name: editName.trim(),
      });

      setCategories((previous) =>
        previous.map((category) =>
          category.id === categoryId ? updatedCategory : category
        )
      );

      setEditSuccessMessage("Catégorie modifiée avec succès.");
      setEditingCategoryId(null);
      setEditName("");
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError<ApiValidationError>(error)) {
        const apiMessage = error.response?.data?.error;
        const validationDetails = error.response?.data?.details;

        if (apiMessage === "CATEGORY_NAME_ALREADY_USED") {
          setEditErrorMessage("Cette catégorie existe déjà.");
          return;
        }

        if (apiMessage === "CATEGORY_NOT_FOUND") {
          setEditErrorMessage("Catégorie introuvable.");
          return;
        }

        if (apiMessage === "VALIDATION_ERROR" && validationDetails?.length) {
          setEditErrorMessage(
            validationDetails[0].message ?? "Données invalides."
          );
          return;
        }

        if (apiMessage) {
          setEditErrorMessage(apiMessage);
          return;
        }
      }

      setEditErrorMessage("Impossible de modifier la catégorie.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteCategory() {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);

      setCategories((previous) =>
        previous.filter((c) => c.id !== categoryToDelete.id)
      );

      setCategoryToDelete(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer la catégorie.");
    }
  }

  if (loading) {
    return <p>Chargement des catégories...</p>;
  }

  if (errorMessage && categories.length === 0) {
    return <p className="categories-page__error">{errorMessage}</p>;
  }

  return (
    <div className="categories-page">
      <div className="categories-page__layout">

        <div className="categories-page__card">
          <div className="categories-page__header">
            <h1 className="categories-page__title">Catégories</h1>
            <p className="categories-page__subtitle">
              Gérez les catégories utilisées pour organiser les articles.
            </p>
          </div>

          {errorMessage && (
            <p className="categories-page__message categories-page__message--error">
              {errorMessage}
            </p>
          )}

          {sortedCategories.length === 0 ? (
            <p className="categories-page__empty">
              Aucune catégorie à afficher.
            </p>
          ) : (
            <table className="categories-page__table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Slug</th>
                  <th>Créée le</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedCategories.map((category) => {
                  const isEditing = editingCategoryId === category.id;

                  return (
                    <tr key={category.id}>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            className="categories-page__input"
                          />
                        ) : (
                          category.name
                        )}
                      </td>

                      <td>{category.slug}</td>

                      <td>
                        {new Date(category.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>

                      <td>
                        <div className="categories-page__actions">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCategory(category.id)
                                }
                                disabled={isUpdating}
                                className="categories-page__action-button categories-page__action-button--save"
                              >
                                Enregistrer
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="categories-page__action-button categories-page__action-button--cancel"
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(category)}
                                className="categories-page__action-button categories-page__action-button--edit"
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setCategoryToDelete(category)
                                }
                                className="categories-page__action-button categories-page__action-button--delete"
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="categories-page__form-card">
          <h2 className="categories-page__form-title">
            Créer une catégorie
          </h2>

          <form
            onSubmit={handleCreateCategory}
            className="categories-page__form"
          >
            <div className="categories-page__form-group">
              <label>Nom</label>

              <input
                type="text"
                value={createName}
                onChange={(event) =>
                  setCreateName(event.target.value)
                }
                className="categories-page__input"
                placeholder="Ex : Stress"
              />
            </div>

            {createErrorMessage && (
              <p className="categories-page__message categories-page__message--error">
                {createErrorMessage}
              </p>
            )}

            {createSuccessMessage && (
              <p className="categories-page__message categories-page__message--success">
                {createSuccessMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="categories-page__create-button"
            >
              {isCreating ? "Création..." : "Créer la catégorie"}
            </button>
          </form>
        </div>
      </div>

      {categoryToDelete && (
        <div className="categories-modal">
          <div className="categories-modal__overlay" />

          <div className="categories-modal__content">
            <h3>Supprimer la catégorie</h3>

            <p>
              Voulez-vous vraiment supprimer la catégorie
              <strong> {categoryToDelete.name}</strong> ?
            </p>

            <p className="categories-modal__warning">
              Cette action est irréversible.
            </p>

            <div className="categories-modal__actions">
              <button
                type="button"
                className="categories-modal__cancel"
                onClick={() => setCategoryToDelete(null)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="categories-modal__delete"
                onClick={handleDeleteCategory}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
