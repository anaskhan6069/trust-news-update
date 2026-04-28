"use client";

import * as React from "react";
import { NewsGrid } from "@/components/news/NewsGrid";
import { CategoryFilter } from "@/components/sidebar/CategoryFilter";
import { RecentNews } from "@/components/sidebar/RecentNews";
import { SearchPanel } from "@/components/sidebar/SearchPanel";
import { useNews } from "@/hooks/useNews";
import type { CategorySlug } from "@/types";

export default function NewsPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = React.useState<CategorySlug | "all">("all");
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState(12);
  const newsQuery = useNews({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search,
    limit
  });
  const recentQuery = useNews({ limit: 5 });

  return (
    <section className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All News</h1>
        <p className="mt-2 max-w-2xl text-gray-700 dark:text-gray-300">
          Browse every approved Trust News story, filter by category, or search by title and keywords.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <NewsGrid
          news={newsQuery.data?.news ?? []}
          isLoading={newsQuery.isLoading}
          error={newsQuery.error instanceof Error ? newsQuery.error.message : null}
          hasMore={newsQuery.data?.hasMore}
          isLoadingMore={newsQuery.isFetching && !newsQuery.isLoading}
          onLoadMore={() => setLimit((current) => current + 12)}
        />
        <aside className="grid h-fit gap-5 lg:sticky lg:top-24">
          <SearchPanel value={search} onChange={setSearch} onSearch={() => setLimit(12)} />
          <CategoryFilter
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setLimit(12);
            }}
          />
          <RecentNews news={recentQuery.data?.news ?? []} />
        </aside>
      </div>
    </section>
  );
}
