import { apiClient } from "./client";

export type DashboardStats = {
  usersCount: number;
  articlesCount: number;
  diagnosticsCount: number;
  commentsCount: number;
};

export type DashboardRecentArticle = {
  id: string;
  title: string;
  createdAt: string;
  status: "DRAFT" | "PUBLISHED";
  author: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string;
  };
};

export type DashboardRecentUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export type DashboardResponse = {
  stats: DashboardStats;
  recentArticles: DashboardRecentArticle[];
  recentUsers: DashboardRecentUser[];
};

export async function getAdminDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get("/admin/dashboard");
  return response.data;
}
