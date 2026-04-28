import type { Category, CategorySlug } from "@/types";

export const categories: Category[] = [
  {
    label: "Technology",
    slug: "technology",
    badgeClassName: "bg-blue-600 text-white"
  },
  {
    label: "Entertainment",
    slug: "entertainment",
    badgeClassName: "bg-fuchsia-600 text-white"
  },
  {
    label: "Sports",
    slug: "sports",
    badgeClassName: "bg-green-600 text-white"
  },
  {
    label: "Politics",
    slug: "politics",
    badgeClassName: "bg-red-600 text-white"
  },
  {
    label: "Pakistan",
    slug: "pakistan",
    badgeClassName: "bg-emerald-700 text-white"
  },
  {
    label: "Other",
    slug: "other",
    badgeClassName: "bg-neutral-700 text-white dark:bg-neutral-200 dark:text-neutral-950"
  }
];

export const allCategoryPill = {
  label: "All",
  slug: "all"
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" }
];

export const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Twitter/X", href: "https://twitter.com/" }
];

export function getCategoryLabel(slug: CategorySlug): string {
  return categories.find((category) => category.slug === slug)?.label ?? "Other";
}

export function getCategoryBadgeClass(slug: CategorySlug): string {
  return categories.find((category) => category.slug === slug)?.badgeClassName ?? categories[5].badgeClassName;
}
