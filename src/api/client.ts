import axios from "axios";
import { refreshToken } from "./auth.api";
import { clearAuthStorage, getAccessToken, setAccessToken } from "../utils/auth";

//Creation du client : permet d'avoir une configuration pour toutes les requetes
export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, //cookie
});

//Permet de modifier les requetes avant de l'envoyer au serveur
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) config.headers.Authorization = `Bearer ${token}`; //ajout du token dans le header

  return config;
});

//Permet de gérer les erreurs provenant du serveur 
apiClient.interceptors.response.use(
  //Si la reponse est correcte on l'envoie telle quelle
  (response) => response,
  //Si erreur 
  async (error) => {
    const originalRequest = error.config; //contient la requete initiale qui a échoué

    // On verifie : 
    // 1. le serveur a repondu une erreur 401
    // 2. Le requete exite
    // 3. La requete n'a pas deja été retenté 
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry)
    {
      originalRequest._retry = true; //evite une boucle

      try {
        //on demande un nouveau token au back
        const result = await refreshToken();

        //On le stocke
        setAccessToken(result.accessToken);

        //On ajoute le nouveau token dans la requete originale
        originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;

        //On relande la requete avec le nouveau token 
        return apiClient(originalRequest);
      } 
      catch {
        clearAuthStorage(); //on supprime ttes les données d'authentification 
        window.location.href = "/"; //page login 
      }
    }

    return Promise.reject(error); // si erreur pas token => renvoie erreur normalement
  }
);