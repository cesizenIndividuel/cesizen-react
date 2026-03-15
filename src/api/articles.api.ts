import { apiClient } from "./client";
import type { AdminArticlesResponse, AdminArticle } from "../types/article";

export type AdminArticleStatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "DELETED";

export type ListAdminArticlesParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminArticleStatusFilter;
};

export type CreateArticlePayload = {
  title: string;
  content: string;
  excerpt?: string;
  categoryIds?: string[];
};

export type UpdateArticlePayload = {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
};

export async function getAdminArticles(params: ListAdminArticlesParams): Promise<AdminArticlesResponse> {
  const response = await apiClient.get("/articles/admin", { params });
  return response.data;
}

export async function getAdminArticleById(articleId: string): Promise<AdminArticle> {
  const response = await apiClient.get(`/articles/${articleId}`);
  return response.data;
}

export async function createArticle(payload: CreateArticlePayload): Promise<AdminArticle> {
  const response = await apiClient.post("/articles", payload);
  return response.data;
}

export async function updateArticle(articleId: string, payload: UpdateArticlePayload): Promise<AdminArticle> {
  const response = await apiClient.patch(`/articles/${articleId}`, payload);
  return response.data;
}

export async function publishArticle(articleId: string): Promise<AdminArticle> {
  const response = await apiClient.patch(`/articles/${articleId}/publish`);
  return response.data;
}

export async function restoreArticle(articleId: string): Promise<AdminArticle> {
  const response = await apiClient.patch(`/articles/${articleId}/restore`);
  return response.data;
}

export async function deleteArticle(articleId: string): Promise<void> {
  await apiClient.delete(`/articles/${articleId}`);
}

export async function uploadArticleImage(articleId: string, file: File): Promise<AdminArticle> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post(`/articles/${articleId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function uploadArticleContentImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post("/articles/content-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.imageUrl;
}

