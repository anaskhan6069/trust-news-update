"use client";

import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { NewsDetail } from "@/components/news/NewsDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsDetail } from "@/hooks/useNews";

export default function NewsDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const newsId = params.id;
  const detailQuery = useNewsDetail(newsId);

  if (detailQuery.isLoading) {
    return (
      <div>
        <Skeleton className="h-[320px] w-full md:h-[500px]" />
        <div className="container mt-8 max-w-4xl space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-5 w-60" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  if (detailQuery.error || !detailQuery.data?.news) {
    return (
      <section className="container py-16">
        <div className="rounded-lg border border-red-600/30 bg-red-50 p-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h1 className="font-bold">Unable to load news</h1>
              <p className="mt-1 text-sm">
                {detailQuery.error instanceof Error ? detailQuery.error.message : "The requested story was not found."}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <NewsDetail news={detailQuery.data.news} related={detailQuery.data.related} />;
}
