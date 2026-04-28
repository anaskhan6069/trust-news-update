"use client";

import { useQuery } from "@tanstack/react-query";
import type { CategorySlug, DashboardStats, DraftNewsItem, NewsItem, NewsListResponse } from "@/types";

export interface UseNewsParams {
  category?: CategorySlug;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NewsDetailResponse {
  success: boolean;
  news: NewsItem;
  related: NewsItem[];
}

export interface AdminDraftsResponse {
  success: boolean;
  drafts: DraftNewsItem[];
  stats: DashboardStats;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "message" in value &&
    value.success === false &&
    typeof value.message === "string"
  );
}

function buildNewsUrl(params: UseNewsParams): string {
  const query = new URLSearchParams();

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const queryString = query.toString();
  return queryString ? `/api/news?${queryString}` : "/api/news";
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as unknown;

  if (!response.ok || isApiErrorResponse(data)) {
    throw new Error(isApiErrorResponse(data) ? data.message : "Request failed");
  }

  return data as T;
}

async function fetchNews(params: UseNewsParams): Promise<NewsListResponse> {
  const response = await fetch(buildNewsUrl(params), { cache: "no-store" });
  return parseResponse<NewsListResponse>(response);
}

async function fetchNewsDetail(id: string): Promise<NewsDetailResponse> {
  const response = await fetch(`/api/news/${id}`, { cache: "no-store" });
  return parseResponse<NewsDetailResponse>(response);
}

async function fetchAdminDrafts(): Promise<AdminDraftsResponse> {
  const response = await fetch("/api/admin/drafts", { cache: "no-store" });
  return parseResponse<AdminDraftsResponse>(response);
}

export function useNews(params: UseNewsParams) {
  return useQuery({
    queryKey: ["news", params],
    queryFn: () => fetchNews(params)
  });
}

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: ["news-detail", id],
    queryFn: () => fetchNewsDetail(id),
    enabled: Boolean(id)
  });
}

export function useAdminDrafts() {
  return useQuery({
    queryKey: ["admin-drafts"],
    queryFn: fetchAdminDrafts
  });
}
