import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CategorySlug } from "@/types";
import { categories } from "@/constants";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isCategorySlug(value: string): value is CategorySlug {
  return categories.some((category) => category.slug === value);
}

export function normalizeCategory(value: string): CategorySlug {
  return isCategorySlug(value) ? value : "other";
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function timeAgo(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

export function truncateWords(value: string, maxWords: number): string {
  const words = value.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return value;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "TN";
}

export function getAbsoluteUrl(path = ""): string {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}
