export type AdminDiagnosticAnswer = {
  id: string;
  label: string;
  weight: number;
  order: number;
  isActive: boolean;
};

export type AdminDiagnosticQuestion = {
  id: string;
  label: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  answers: AdminDiagnosticAnswer[];
};

export type UpdateDiagnosticQuestionPayload = {
  label?: string;
  order?: number;
};

export type UpdateDiagnosticAnswerPayload = {
  label?: string;
  weight?: number;
  order?: number;
};