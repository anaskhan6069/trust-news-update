"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, Send, Twitter } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toaster";
import { NewsCard } from "@/components/news/NewsCard";
import { VideoPlayer } from "@/components/news/VideoPlayer";
import { getCategoryBadgeClass, getCategoryLabel } from "@/constants";
import type { NewsItem } from "@/types";
import { cn, formatDate, initials } from "@/lib/utils";

interface NewsDetailProps {
  news: NewsItem;
  related: NewsItem[];
}

export function NewsDetail({ news, related }: NewsDetailProps): JSX.Element {
  const { toast } = useToast();
  const currentUrl = typeof window === "undefined" ? "" : window.location.href;
  const paragraphs = news.description.split(/\n+/).filter(Boolean);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(currentUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${news.title} ${currentUrl}`)}`;

  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(currentUrl);
    toast({ title: "Link copied", description: "The news link is ready to share.", variant: "success" });
  }

  return (
    <article className="pb-12">
      <nav className="container py-5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/news" className="hover:text-foreground">
              News
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/category/${news.category}`} className="hover:text-foreground">
              {getCategoryLabel(news.category)}
            </Link>
          </li>
          <li>/</li>
          <li className="max-w-[18rem] truncate text-foreground">{news.title}</li>
        </ol>
      </nav>

      <div className="relative h-[300px] w-full overflow-hidden bg-secondary md:h-[500px]">
        <Image src={news.imageUrl || "/logo.svg"} alt={news.title} fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="container mt-8 max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={cn("border-transparent", getCategoryBadgeClass(news.category))}>
            {getCategoryLabel(news.category)}
          </Badge>
          <span className="text-sm text-muted-foreground">{formatDate(news.publishedAt)}</span>
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">{news.title}</h1>

        <div className="mt-5 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials(news.authorName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{news.authorName}</p>
            <p className="text-sm text-muted-foreground">{news.authorEmail}</p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="space-y-5 text-lg leading-8 text-gray-700 dark:text-gray-300">
          {paragraphs.map((paragraph, index) => (
            <p key={`${news.id}-paragraph-${index}`} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {news.videoUrl ? (
          <div className="mt-8">
            <VideoPlayer videoUrl={news.videoUrl} title={news.title} />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold">Share</span>
          <Button variant="outline" size="sm" onClick={() => void copyLink()}>
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={twitterUrl} target="_blank" rel="noreferrer">
              <Twitter className="h-4 w-4" />
              Twitter
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={whatsappUrl} target="_blank" rel="noreferrer">
              <FaWhatsapp className="h-4 w-4" />
              WhatsApp
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`mailto:?subject=${encodeURIComponent(news.title)}&body=${encodeURIComponent(currentUrl)}`}>
              <Send className="h-4 w-4" />
              Email
            </Link>
          </Button>
        </div>
      </div>

      <section className="container mt-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Related News</h2>
          <Link href={`/category/${news.category}`} className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
            View category
          </Link>
        </div>
        {related.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No related news is available yet.</div>
        )}
      </section>
    </article>
  );
}
