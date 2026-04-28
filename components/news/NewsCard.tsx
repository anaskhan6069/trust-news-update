"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryBadgeClass, getCategoryLabel } from "@/constants";
import type { NewsItem } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps): JSX.Element {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <Link href={`/news/${news.id}`} className="relative block aspect-video overflow-hidden bg-secondary">
        <Image
          src={news.imageUrl || "/logo.svg"}
          alt={news.title}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Badge className={cn("w-fit border-transparent", getCategoryBadgeClass(news.category))}>
          {getCategoryLabel(news.category)}
        </Badge>
        <Link href={`/news/${news.id}`} className="mt-3">
          <h2 className="line-clamp-2 text-lg font-bold tracking-tight text-foreground group-hover:text-brand-red">
            {news.title}
          </h2>
        </Link>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{news.description}</p>
        <div className="mt-auto pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            {news.authorName} · {formatDate(news.publishedAt)}
          </p>
          <Button asChild variant="link" className="mt-2 h-auto px-0 text-sm">
            <Link href={`/news/${news.id}`}>
              Read More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
