export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleAuthor = {
  id: string;
  pseudo: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
};

export type AdminArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: ArticleAuthor | null;
  categories: ArticleCategory[];
};

export type AdminArticlesResponse = {
  items: AdminArticle[];
  page: number;
  limit: number;
  total: number;
};
