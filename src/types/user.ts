export type User = {
  id: string;
  email: string;
  pseudo: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};