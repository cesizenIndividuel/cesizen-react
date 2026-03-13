export type AuthUser = {
  id: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

//Permet de recuperer le token stocké 
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

//Permet d'enregistrer le token dans le navigateur
export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

//Permet de supprimer le token 
export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

//Permet de récupérer le user stocké dans le localStorage
export function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser; //transforme l'objet Json en objet JS
  } catch {
    return null;
  }
}

//Permet de stocker l'user dans le navigateur
export function setStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user)); //converti en json
}

//Permet de supprimer le user stocké
export function removeStoredUser() {
  localStorage.removeItem(USER_KEY);
}

//Permet de vider toutes les données d'authentification 
export function clearAuthStorage() {
  removeAccessToken();
  removeStoredUser();
}