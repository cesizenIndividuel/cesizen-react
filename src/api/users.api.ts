import { apiClient } from "./client";
import type { User } from "../types/user";

//Récupère la liste des utilisateurs depuis l’API.
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get("/users");
  return response.data;
}
