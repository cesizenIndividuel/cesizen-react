import { apiClient } from "./client";

//Ce que le front envoie au back
export type LoginPayload = {
  email: string;
  password: string;
};

//Ce que le back va envoyer
export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    role: "USER" | "ADMIN";
    isActive: boolean;
  };
};

//appel de POST http://localhost:3000/api/auth/login
export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}