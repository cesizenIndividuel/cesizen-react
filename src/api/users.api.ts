import { apiClient } from "./client";
import type { User } from "../types/user";

type CreateUserPayload = {
  firstName: string;
  lastName: string;
  pseudo: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

// Récupère la liste des utilisateurs depuis l’API.
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get("/users");
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