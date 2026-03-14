import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, getStoredUser } from "../utils/auth";

// Protège certaines routes : vérifie si le user est connecté et admin
export function ProtectedRoute() {
  const token = getAccessToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  if (!user.isActive) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}