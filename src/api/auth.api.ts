import { apiClient } from "./client";

//Ce que le front envoie au back lors que le user se connecte
export type LoginPayload = {
  email: string;
  password: string;
};

//type de user identifié
export type AuthUser = {
  id: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

//Ce que le back va envoyer apres un login reussi
export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

//reponse du back quand demande de nouveau token 
export type RefreshResponse = {
  accessToken: string;
};

//appel de POST http://localhost:3000/api/auth/login
export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

//Demande au back un nouvel access token 
export async function refreshToken() {
  const response = await apiClient.post<RefreshResponse>("/auth/refresh");
  return response.data;
}