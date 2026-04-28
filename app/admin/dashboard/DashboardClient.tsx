"use client";

import { AlertCircle, FileClock, Newspaper, Users } from "lucide-react";
import { DraftTable } from "@/components/admin/DraftTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDrafts } from "@/hooks/useNews";

const statCards = [
  { key: "totalPublished", label: "Total Published News", icon: Newspaper },
  { key: "pendingDrafts", label: "Total Drafts Pending", icon: FileClock },
  { key: "registeredUsers", label: "Total Registered Users", icon: Users }
] as const;

export function DashboardClient(): JSX.Element {
  const draftsQuery = useAdminDrafts();
  const stats = draftsQuery.data?.stats;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">Review submitted drafts and publish approved news.</p>
      </div>

      {draftsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : null}

      {draftsQuery.error ? (
        <div className="rounded-lg border border-red-600/30 bg-red-50 p-5 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Dashboard data could not be loaded</p>
              <p className="mt-1 text-sm">{draftsQuery.error instanceof Error ? draftsQuery.error.message : "Unknown error"}</p>
            </div>
          </div>
        </div>
      ) : null}

      {stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{card.label}</CardTitle>
                  <Icon className="h-5 w-5 text-brand-red" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight">{stats[card.key]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Draft News</h2>
        <DraftTable drafts={draftsQuery.data?.drafts ?? []} />
      </div>
    </div>
  );
}
