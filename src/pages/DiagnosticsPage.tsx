import { useEffect, useState } from "react";
import {
  getDiagnosticQuestions,
  updateDiagnosticAnswer,
  updateDiagnosticQuestion,
} from "../api/diagnostics.api";
import type {
  AdminDiagnosticAnswer,
  AdminDiagnosticQuestion,
} from "../types/diagnostic";
import "./DiagnosticsPage.css";

type EditingQuestionState = {
  id: string;
  label: string;
  order: number;
};

type EditingAnswerState = {
  id: string;
  label: string;
  weight: number;
  order: number;
};

function getApiErrorMessage(error: unknown) {
  if (error instanceof Error) {
    switch (error.message) {
      case "QUESTION_ORDER_ALREADY_USED":
        return "Cet ordre de question est déjà utilisé.";
      case "ANSWER_ORDER_ALREADY_USED":
        return "Cet ordre de réponse est déjà utilisé pour cette question.";
      case "QUESTION_NOT_FOUND":
        return "Question introuvable.";
      case "ANSWER_NOT_FOUND":
        return "Réponse introuvable.";
      default:
        return error.message;
    }
  }

  return "Une erreur est survenue.";
}

export function DiagnosticsPage() {
  const [questions, setQuestions] = useState<AdminDiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [editingQuestion, setEditingQuestion] =
    useState<EditingQuestionState | null>(null);
  const [editingAnswer, setEditingAnswer] =
    useState<EditingAnswerState | null>(null);

  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadQuestions() {
    try {
      setLoading(true);
      setPageError("");

      const data = await getDiagnosticQuestions();
      setQuestions(data);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  function startEditQuestion(question: AdminDiagnosticQuestion) {
    setActionError("");
    setSuccessMessage("");
    setEditingQuestion({
      id: question.id,
      label: question.label,
      order: question.order,
    });
  }

  function cancelEditQuestion() {
    setEditingQuestion(null);
  }

  function startEditAnswer(answer: AdminDiagnosticAnswer) {
    setActionError("");
    setSuccessMessage("");
    setEditingAnswer({
      id: answer.id,
      label: answer.label,
      weight: answer.weight,
      order: answer.order,
    });
  }

  function cancelEditAnswer() {
    setEditingAnswer(null);
  }

  async function handleSaveQuestion() {
    if (!editingQuestion) return;

    try {
      setSavingQuestion(true);
      setActionError("");
      setSuccessMessage("");

      await updateDiagnosticQuestion(editingQuestion.id, {
        label: editingQuestion.label.trim(),
        order: editingQuestion.order,
      });

      setSuccessMessage("Question modifiée avec succès.");
      setEditingQuestion(null);
      await loadQuestions();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleSaveAnswer() {
    if (!editingAnswer) return;

    try {
      setSavingAnswer(true);
      setActionError("");
      setSuccessMessage("");

      await updateDiagnosticAnswer(editingAnswer.id, {
        label: editingAnswer.label.trim(),
        weight: editingAnswer.weight,
        order: editingAnswer.order,
      });

      setSuccessMessage("Réponse modifiée avec succès.");
      setEditingAnswer(null);
      await loadQuestions();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setSavingAnswer(false);
    }
  }

  if (loading) {
    return <p className="diagnostics__state">Chargement...</p>;
  }

  if (pageError) {
    return (
      <p className="diagnostics__state diagnostics__state--error">{pageError}</p>
    );
  }

  return (
    <section className="diagnostics">
      <div className="diagnostics__header">
        <div>
          <h1>Diagnostic de stress</h1>
          <p>Gestion des questions et des réponses du questionnaire.</p>
        </div>
      </div>

      {successMessage && (
        <div className="diagnostics__alert diagnostics__alert--success">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="diagnostics__alert diagnostics__alert--error">
          {actionError}
        </div>
      )}

      <div className="diagnostics__list">
        {questions.map((question) => (
          <article key={question.id} className="diagnostics__card">
            <div className="diagnostics__card-header">
              <div>
                <p className="diagnostics__eyebrow">
                  Question #{question.order}
                </p>

                {editingQuestion?.id === question.id ? (
                  <div className="diagnostics__edit">
                    <input
                      value={editingQuestion.label}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          label: e.target.value,
                        })
                      }
                    />

                    <input
                      type="number"
                      min={1}
                      value={editingQuestion.order}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          order: Number(e.target.value),
                        })
                      }
                    />

                    <div className="diagnostics__edit-actions">
                      <button
                        className="diagnostics__primary-button"
                        onClick={handleSaveQuestion}
                        disabled={savingQuestion}
                      >
                        {savingQuestion ? "Enregistrement..." : "Enregistrer"}
                      </button>

                      <button
                        className="diagnostics__secondary-button"
                        onClick={cancelEditQuestion}
                        type="button"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{question.label}</h2>
                    <div className="diagnostics__meta">
                      <span>Ordre : {question.order}</span>
                      <span>
                        Statut : {question.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {editingQuestion?.id !== question.id && (
                <button
                  className="diagnostics__secondary-button"
                  onClick={() => startEditQuestion(question)}
                >
                  Modifier la question
                </button>
              )}
            </div>

            <div className="diagnostics__answers">
              <h3>Réponses</h3>

              <div className="diagnostics__answers-list">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="diagnostics__answer">
                    {editingAnswer?.id === answer.id ? (
                      <div className="diagnostics__edit">
                        <input
                          value={editingAnswer.label}
                          onChange={(e) =>
                            setEditingAnswer({
                              ...editingAnswer,
                              label: e.target.value,
                            })
                          }
                        />

                        <input
                          type="number"
                          min={0}
                          value={editingAnswer.weight}
                          onChange={(e) =>
                            setEditingAnswer({
                              ...editingAnswer,
                              weight: Number(e.target.value),
                            })
                          }
                        />

                        <input
                          type="number"
                          min={1}
                          value={editingAnswer.order}
                          onChange={(e) =>
                            setEditingAnswer({
                              ...editingAnswer,
                              order: Number(e.target.value),
                            })
                          }
                        />

                        <div className="diagnostics__edit-actions">
                          <button
                            className="diagnostics__primary-button"
                            onClick={handleSaveAnswer}
                            disabled={savingAnswer}
                          >
                            {savingAnswer ? "Enregistrement..." : "Enregistrer"}
                          </button>

                          <button
                            className="diagnostics__secondary-button"
                            onClick={cancelEditAnswer}
                            type="button"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <strong>{answer.label}</strong>
                          <div className="diagnostics__meta">
                            <span>Poids : {answer.weight}</span>
                            <span>Ordre : {answer.order}</span>
                            <span>
                              Statut : {answer.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <button
                          className="diagnostics__secondary-button"
                          onClick={() => startEditAnswer(answer)}
                        >
                          Modifier
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}