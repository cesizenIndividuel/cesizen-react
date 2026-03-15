import { apiClient } from "./client";
import type {
  AdminDiagnosticQuestion,
  UpdateDiagnosticAnswerPayload,
  UpdateDiagnosticQuestionPayload,
} from "../types/diagnostic";

// Récupère toutes les questions du diagnostic pour l’admin
export async function getDiagnosticQuestions(): Promise<AdminDiagnosticQuestion[]> {
  const response = await apiClient.get("/diagnostics/admin/questions");
  return response.data;
}

// Met à jour une question
export async function updateDiagnosticQuestion(
  questionId: string,
  payload: UpdateDiagnosticQuestionPayload
) {
  const response = await apiClient.patch(
    `/diagnostics/admin/questions/${questionId}`,
    payload
  );

  return response.data;
}

// Met à jour une réponse
export async function updateDiagnosticAnswer(
  answerId: string,
  payload: UpdateDiagnosticAnswerPayload
) {
  const response = await apiClient.patch(
    `/diagnostics/admin/answers/${answerId}`,
    payload
  );

  return response.data;
}