"use client";

import * as React from "react";
import { NewsGrid } from "@/components/news/NewsGrid";
import { RecentNews } from "@/components/sidebar/RecentNews";
import { SearchPanel } from "@/components/sidebar/SearchPanel";
import { getCategoryLabel } from "@/constants";
import { useNews } from "@/hooks/useNews";
import type { CategorySlug } from "@/types";
import { isCategorySlug } from "@/lib/utils";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps): JSX.Element {
  const [search, setSearch] = React.useState("");
  const [limit, setLimit] = React.useState(12);
  const category = isCategorySlug(params.slug) ? params.slug : null;
  const newsQuery = useNews({
    category: category ?? undefined,
    search,
    limit
  });
  const recentQuery = useNews({ limit: 5 });

  if (!category) {
    return (
      <section className="container py-16">
        <h1 className="text-3xl font-bold tracking-tight">Category not found</h1>
        <p className="mt-2 text-muted-foreground">The category you requested is not available.</p>
      </section>
    );
  }

  return (
    <section className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{getCategoryLabel(category)}</h1>
        <p className="mt-2 max-w-2xl text-gray-700 dark:text-gray-300">Latest approved stories in this category.</p>
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
          <RecentNews news={recentQuery.data?.news ?? []} />
        </aside>
      </div>
    </section>
  );
}
