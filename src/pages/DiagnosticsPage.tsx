import { useEffect, useState } from "react";
import type {
  DiagnosticQuestion,
  DiagnosticAnswer,
} from "../api/diagnostics.api";
import {
  getAdminDiagnosticQuestions,
  updateDiagnosticAnswer,
  updateDiagnosticQuestion,
} from "../api/diagnostics.api";
import "./DiagnosticsPage.css";


export function DiagnosticsPage() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getAdminDiagnosticQuestions();
      setQuestions(data);
    } catch {
      setMessage("Erreur lors du chargement des questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleQuestionChange = (
    questionId: string,
    field: "label" | "order",
    value: string
  ) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              [field]: field === "order" ? Number(value) : value,
            }
          : question
      )
    );
  };

  const handleAnswerChange = (
    questionId: string,
    answerId: string,
    field: "label" | "weight" | "order",
    value: string
  ) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) =>
                answer.id === answerId
                  ? {
                      ...answer,
                      [field]:
                        field === "label" ? value : Number(value),
                    }
                  : answer
              ),
            }
          : question
      )
    );
  };

  const saveQuestion = async (question: DiagnosticQuestion) => {
    try {
      await updateDiagnosticQuestion(question.id, {
        label: question.label,
        order: question.order,
      });

      setMessage("Question modifiée avec succès.");
      await loadQuestions();
    } catch {
      setMessage("Erreur lors de la modification de la question.");
    }
  };

    const saveAnswer = async (
    answerId: string,
    answer: DiagnosticAnswer
    ) => {    try {
      await updateDiagnosticAnswer(answerId, {
        label: answer.label,
        weight: answer.weight,
        order: answer.order,
      });

      setMessage("Réponse modifiée avec succès.");
      await loadQuestions();
    } catch {
      setMessage("Erreur lors de la modification de la réponse.");
    }
  };

  if (loading) {
    return <p>Chargement des questions...</p>;
  }

  return (
    <div className="diagnostics-page">
      <div className="diagnostics-header">
        <h1>Diagnostic de stress</h1>
        <p>Modifier les questions et les points associés aux réponses.</p>
      </div>

      {message && <div className="diagnostics-message">{message}</div>}

      <div className="diagnostics-list">
        {questions.map((question) => (
          <section className="diagnostic-card" key={question.id}>
            <div className="diagnostic-question-row">
              <div className="diagnostic-field large">
                <label>Question</label>
                <input
                  value={question.label}
                  onChange={(event) =>
                    handleQuestionChange(question.id, "label", event.target.value)
                  }
                />
              </div>

              <div className="diagnostic-field small">
                <label>Ordre</label>
                <input
                  type="number"
                  value={question.order}
                  onChange={(event) =>
                    handleQuestionChange(question.id, "order", event.target.value)
                  }
                />
              </div>

              <button onClick={() => saveQuestion(question)}>
                Enregistrer
              </button>
            </div>

            <div className="diagnostic-answers">
              {question.answers.map((answer) => (
                <div className="diagnostic-answer-row" key={answer.id}>
                  <div className="diagnostic-field large">
                    <label>Réponse</label>
                    <input
                      value={answer.label}
                      onChange={(event) =>
                        handleAnswerChange(
                          question.id,
                          answer.id,
                          "label",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="diagnostic-field small">
                    <label>Points</label>
                    <input
                      type="number"
                      value={answer.weight}
                      onChange={(event) =>
                        handleAnswerChange(
                          question.id,
                          answer.id,
                          "weight",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="diagnostic-field small">
                    <label>Ordre</label>
                    <input
                      type="number"
                      value={answer.order}
                      onChange={(event) =>
                        handleAnswerChange(
                          question.id,
                          answer.id,
                          "order",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <button onClick={() => saveAnswer(answer.id, answer)}>
                    OK
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}