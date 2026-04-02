import { apiClient } from "./client";
import type { User } from "../types/user";

type CreateUserPayload = {
  firstName?: string;
  lastName?: string;
  pseudo: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  email?: string;
  role?: "USER" | "ADMIN";
  isActive?: boolean;
};

// Récupère la liste des utilisateurs depuis l’API.
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get("/users");
  return response.data;
}

// Récupère un utilisateur par son id
export async function getUserById(userId: string): Promise<User> {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
}

// Mise à jour du statut d'un utilisateur
export async function updateUserStatus(userId: string, isActive: boolean) {
  const response = await apiClient.patch<User>(`/users/${userId}/status`, {
    isActive,
  });

  return response.data;
}

// Création d'un utilisateur
export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await apiClient.post("/users", payload);
  return response.data;
}

// Mise à jour complète d'un utilisateur
export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
  const response = await apiClient.patch(`/users/${userId}`, payload);
  return response.data;
}

// Suppression d'un utilisateur
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}