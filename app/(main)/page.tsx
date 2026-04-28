"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsGrid } from "@/components/news/NewsGrid";
import { CategoryFilter } from "@/components/sidebar/CategoryFilter";
import { RecentNews } from "@/components/sidebar/RecentNews";
import { SearchPanel } from "@/components/sidebar/SearchPanel";
import { allCategoryPill, categories, getCategoryBadgeClass, getCategoryLabel } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useNews } from "@/hooks/useNews";
import type { CategorySlug } from "@/types";
import { cn, formatDate } from "@/lib/utils";

export default function HomePage(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState<CategorySlug | "all">("all");
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState(9);
  const newsQuery = useNews({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search,
    limit,
    page: 1
  });
  const recentQuery = useNews({ limit: 5, page: 1 });

  const news = newsQuery.data?.news ?? [];
  const featured = news[0] ?? recentQuery.data?.news[0];
  const tickerItems = (recentQuery.data?.news ?? news).slice(0, 6);

  return (
    <div>
      <section className="border-b bg-secondary/35">
        <div className="container py-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="overflow-hidden rounded-lg border bg-card">
              {featured ? (
                <Link href={`/news/${featured.id}`} className="group grid md:grid-cols-[1.1fr_0.9fr]">
                  <div className="relative aspect-video min-h-[260px] bg-secondary md:aspect-auto">
                    <Image src={featured.imageUrl || "/logo.svg"} alt={featured.title} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center p-6">
                    <Badge className={cn("w-fit border-transparent", getCategoryBadgeClass(featured.category))}>
                      {getCategoryLabel(featured.category)}
                    </Badge>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl group-hover:text-brand-red">
                      {featured.title}
                    </h1>
                    <p className="mt-3 line-clamp-4 text-gray-700 dark:text-gray-300">{featured.description}</p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {featured.authorName} · {formatDate(featured.publishedAt)}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                      Read featured story
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="p-8">
                  <h1 className="text-3xl font-bold tracking-tight">Trust News</h1>
                  <p className="mt-3 text-gray-700 dark:text-gray-300">
                    Connect Google Sheets to publish reviewed community news here.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-card p-5">
              <h2 className="text-xl font-bold tracking-tight">Breaking News</h2>
              <div className="mt-4 overflow-hidden rounded-md border bg-background py-3">
                <div className="flex w-max animate-ticker gap-8 px-4">
                  {[...tickerItems, ...tickerItems].map((item, index) => (
                    <Link key={`${item.id}-${index}`} href={`/news/${item.id}`} className="text-sm font-semibold hover:text-brand-red">
                      {item.title}
                    </Link>
                  ))}
                  {tickerItems.length === 0 ? <span className="text-sm text-muted-foreground">No breaking news yet.</span> : null}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {[allCategoryPill, ...categories].map((category) => (
                  <Button
                    key={category.slug}
                    size="sm"
                    variant={selectedCategory === category.slug ? "default" : "outline"}
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      setLimit(9);
                    }}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Latest News</h2>
                <p className="mt-1 text-sm text-muted-foreground">Approved stories from the Trust News desk.</p>
              </div>
              {isAuthenticated ? (
                <Button asChild size="lg">
                  <Link href="/post-news">
                    <PenSquare className="h-4 w-4" />
                    Post News
                  </Link>
                </Button>
              ) : null}
            </div>
            <NewsGrid
              news={news}
              isLoading={newsQuery.isLoading}
              error={newsQuery.error instanceof Error ? newsQuery.error.message : null}
              hasMore={newsQuery.data?.hasMore}
              isLoadingMore={newsQuery.isFetching && !newsQuery.isLoading}
              onLoadMore={() => setLimit((current) => current + 9)}
            />
          </div>

          <aside className="grid h-fit gap-5 lg:sticky lg:top-24">
            <SearchPanel value={search} onChange={setSearch} onSearch={() => setLimit(9)} />
            <CategoryFilter
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setLimit(9);
              }}
            />
            <RecentNews news={recentQuery.data?.news ?? []} />
          </aside>
        </div>
      </section>
    </div>
  );
}
