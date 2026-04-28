import type { DefaultSession } from "next-auth";

export type CategorySlug =
  | "technology"
  | "entertainment"
  | "sports"
  | "politics"
  | "pakistan"
  | "other";

export type UserRole = "user" | "admin";

export type NewsStatus = "draft" | "approved" | "rejected";

export interface Category {
  label: string;
  slug: CategorySlug;
  badgeClassName: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  provider: "credentials" | "google";
  role: UserRole;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: CategorySlug;
  imageUrl: string;
  videoUrl: string;
  authorName: string;
  authorEmail: string;
  publishedAt: string;
  draftId: string;
}

export interface DraftNewsItem {
  id: string;
  title: string;
  description: string;
  category: CategorySlug;
  imageUrl: string;
  videoUrl: string;
  authorName: string;
  authorEmail: string;
  status: NewsStatus;
  submittedAt: string;
  approvedAt: string;
}

export interface DraftNewsWithRow extends DraftNewsItem {
  rowNumber: number;
}

export interface NewsListResponse {
  success: boolean;
  news: NewsItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DashboardStats {
  totalPublished: number;
  pendingDrafts: number;
  registeredUsers: number;
}

export interface ApiMessage {
  success: boolean;
  message: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}
