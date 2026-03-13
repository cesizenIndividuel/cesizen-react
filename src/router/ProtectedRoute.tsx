import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, getStoredUser } from "../utils/auth";

//Protege certaines routes : Verifie si le user est connecté et admin
export function ProtectedRoute() {
  const token = getAccessToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />; //page login
  }

  return <Outlet />; //route enfant 
}