import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCategoryBadgeClass, getCategoryLabel } from "@/constants";
import type { NewsItem } from "@/types";
import { cn, timeAgo } from "@/lib/utils";

interface RecentNewsProps {
  news: NewsItem[];
}

export function RecentNews({ news }: RecentNewsProps): JSX.Element {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-lg font-bold tracking-tight">Recently Added News</h2>
      <div className="mt-4 grid gap-4">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent news yet.</p>
        ) : (
          news.slice(0, 5).map((item) => (
            <Link key={item.id} href={`/news/${item.id}`} className="group grid gap-2 border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2">
                <Badge className={cn("border-transparent px-2 py-0 text-[11px]", getCategoryBadgeClass(item.category))}>
                  {getCategoryLabel(item.category)}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(item.publishedAt)}</span>
              </div>
              <p className="line-clamp-2 text-sm font-semibold group-hover:text-brand-red">{item.title}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
