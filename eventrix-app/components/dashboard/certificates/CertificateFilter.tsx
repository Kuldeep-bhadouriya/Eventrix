"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CertificateFilter({
  search,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  sort,
  onSortChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  categories: string[];
  onCategoryChange: (value: string) => void;
  sort: "date_desc" | "date_asc";
  onSortChange: (value: "date_desc" | "date_asc") => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Search</label>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by event name"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Category</label>
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Sort</label>
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as "date_desc" | "date_asc")}
          >
            <option value="date_desc">Newest</option>
            <option value="date_asc">Oldest</option>
          </select>
        </div>

        <Button type="button" variant="outline" onClick={() => {
          onSearchChange("");
          onCategoryChange("");
          onSortChange("date_desc");
        }}>
          Reset
        </Button>
      </div>
    </div>
  );
}
