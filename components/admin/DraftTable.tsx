"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApproveButton } from "@/components/admin/ApproveButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toaster";
import { categories, getCategoryBadgeClass, getCategoryLabel } from "@/constants";
import type { CategorySlug, DraftNewsItem } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface DraftTableProps {
  drafts: DraftNewsItem[];
}

interface ApiActionResponse {
  success: boolean;
  message?: string;
}

const PAGE_SIZE = 10;

export function DraftTable({ drafts }: DraftTableProps): JSX.Element {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<CategorySlug | "all">("all");
  const [page, setPage] = React.useState(1);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  const filteredDrafts = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return drafts.filter((draft) => {
      const categoryMatch = category === "all" || draft.category === category;
      const haystack = `${draft.title} ${draft.authorName} ${draft.authorEmail}`.toLowerCase();
      const searchMatch = !normalizedSearch || haystack.includes(normalizedSearch);
      return categoryMatch && searchMatch;
    });
  }, [category, drafts, search]);

  const pageCount = Math.max(1, Math.ceil(filteredDrafts.length / PAGE_SIZE));
  const visibleDrafts = filteredDrafts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [category, search]);

  async function approveDraft(draftId: string): Promise<void> {
    setPendingAction(draftId);

    try {
      const response = await fetch(`/api/admin/approve/${draftId}`, { method: "POST" });
      const data = (await response.json()) as ApiActionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Approval failed");
      }

      toast({ title: "Draft approved", description: "The story is now published.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
    } catch (error) {
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Unable to approve draft.",
        variant: "error"
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function rejectDraft(draftId: string): Promise<void> {
    setPendingAction(draftId);

    try {
      const response = await fetch(`/api/admin/reject/${draftId}`, { method: "DELETE" });
      const data = (await response.json()) as ApiActionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Reject failed");
      }

      toast({ title: "Draft rejected", description: "The draft was removed from the pending queue.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
    } catch (error) {
      toast({
        title: "Reject failed",
        description: error instanceof Error ? error.message : "Unable to reject draft.",
        variant: "error"
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_220px]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by title, author, or email" />
        <Select value={category} onValueChange={(nextValue) => setCategory(nextValue as CategorySlug | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Filter category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleDrafts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No pending drafts match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            visibleDrafts.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell className="max-w-[260px] font-semibold">
                  <span className="line-clamp-2">{draft.title}</span>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent", getCategoryBadgeClass(draft.category))}>
                    {getCategoryLabel(draft.category)}
                  </Badge>
                </TableCell>
                <TableCell>{draft.authorName}</TableCell>
                <TableCell className="text-muted-foreground">{draft.authorEmail}</TableCell>
                <TableCell>{formatDate(draft.submittedAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <ApproveButton draftId={draft.id} isLoading={pendingAction === draft.id} onApprove={(id) => void approveDraft(id)} />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void rejectDraft(draft.id)}
                      disabled={pendingAction === draft.id}
                    >
                      {pendingAction === draft.id ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
        <span>
          Page {page} of {pageCount}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={page === pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
