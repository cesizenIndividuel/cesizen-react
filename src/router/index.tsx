import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UsersPage } from "../pages/UsersPage";
import { UserDetailsPage } from "../pages/UserDetailsPage";
import { ArticlesPage } from "../pages/ArticlesPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { ArticleFormPage } from "../pages/ArticleFormPage";
import { DiagnosticsPage } from "../pages/DiagnosticsPage";

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
            path: "users/:id",
            element: <UserDetailsPage />,
          },
          {
            path: "articles",
            element: <ArticlesPage />,
          },
          {
            path: "articles/new",
            element: <ArticleFormPage />,
          },
          {
            path: "articles/:id",
            element: <ArticleFormPage />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
          },
          {
            path: "diagnostics",
            element: <DiagnosticsPage />,
          },
        ],
      },
    ],
  },
]);