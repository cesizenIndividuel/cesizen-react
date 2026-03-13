import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UsersPage } from "../pages/UsersPage";
import { ArticlesPage } from "../pages/ArticlesPage";
import { CategoriesPage } from "../pages/CategoriesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "articles",
            element: <ArticlesPage />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
          },
        ],
      },
    ],
  },
]);