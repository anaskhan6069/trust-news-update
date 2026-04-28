"use client";

import { categories } from "@/constants";
import type { CategorySlug } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFilterProps {
  value: CategorySlug | "all";
  onChange: (value: CategorySlug | "all") => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps): JSX.Element {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-lg font-bold tracking-tight">Categories</h2>
      <div className="mt-4">
        <Select value={value} onValueChange={(nextValue) => onChange(nextValue as CategorySlug | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
