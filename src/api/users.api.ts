import { apiClient } from "./client";

//Récupère la liste des utilisateurs depuis l’API.
export async function getUsers() {
  const response = await apiClient.get("/users");
  return response.data;
}