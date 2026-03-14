import { apiClient } from "./client";
import type { User } from "../types/user";

//Récupère la liste des utilisateurs depuis l’API.
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get("/users");
  return response.data;
}

//Mise a jour d'un user
export async function updateUserStatus(
  userId: string,
  isActive: boolean
) {
  const response = await apiClient.patch<User>(
    `/users/${userId}/status`,
    { isActive }
  );

  return response.data;
}