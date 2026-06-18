import { apiClient } from "./client";

export type DiagnosticAnswer = {
  id: string;
  label: string;
  weight: number;
  order: number;
  isActive: boolean;
};

export type DiagnosticQuestion = {
  id: string;
  label: string;
  order: number;
  isActive: boolean;
  answers: DiagnosticAnswer[];
};

export async function getAdminDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
  const response = await apiClient.get("/diagnostics/admin/questions");
  return response.data;
}

export async function updateDiagnosticQuestion(
  id: string,
  data: { label?: string; order?: number }
) {
  const response = await apiClient.patch(`/diagnostics/admin/questions/${id}`, data);
  return response.data;
}

export async function updateDiagnosticAnswer(
  id: string,
  data: { label?: string; weight?: number; order?: number }
) {
  const response = await apiClient.patch(`/diagnostics/admin/answers/${id}`, data);
  return response.data;
}