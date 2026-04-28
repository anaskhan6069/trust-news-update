"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsItem } from "@/types";

interface NewsGridProps {
  news: NewsItem[];
  isLoading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function NewsGrid({
  news,
  isLoading = false,
  error,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false
}: NewsGridProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="mt-4 h-5 w-24" />
            <Skeleton className="mt-3 h-6 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-600/30 bg-red-50 p-5 text-red-700 dark:bg-red-950/30 dark:text-red-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-semibold">News could not be loaded</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-lg font-bold tracking-tight">No news found</p>
        <p className="mt-2 text-sm text-muted-foreground">Try a different search term or category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
      {hasMore && onLoadMore ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Spinner /> : null}
            Load More
          </Button>
        </div>
      ) : null}
    </div>
  );
}
