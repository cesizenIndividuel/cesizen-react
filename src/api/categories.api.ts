import { apiClient } from "./client";
import type { Category } from "../types/category";

export type CreateCategoryPayload = {
  name: string;
};

export type UpdateCategoryPayload = {
  name?: string;
};

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get("/categories");
  return response.data;
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<Category> {
  const response = await apiClient.post("/categories", payload);
  return response.data;
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const response = await apiClient.patch(`/categories/${categoryId}`, payload);
  return response.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}
