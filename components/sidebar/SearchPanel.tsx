"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

export function SearchPanel({ value, onChange, onSearch }: SearchPanelProps): JSX.Element {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-lg font-bold tracking-tight">Search</h2>
      <div className="mt-4 flex gap-2">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search by title" />
        <Button size="icon" aria-label="Search news" onClick={onSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
