import axios from "axios";
import { clearAuthStorage, getAccessToken, setAccessToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Client principal pour les appels API classiques
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Client séparé pour refresh le token
const refreshClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Ajout automatique du token d'accès dans les requêtes
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Gestion automatique du refresh token en cas de 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      try {
        const response = await refreshClient.post("/auth/refresh");
        const newAccessToken = response.data.accessToken;

        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch {
        clearAuthStorage();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);