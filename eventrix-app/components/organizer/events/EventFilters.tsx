"use client";

import { Search, LayoutGrid, LayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EventFilters({
  view,
  onViewChange,
  query,
  onQueryChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
}: {
  view: "table" | "grid";
  onViewChange: (v: "table" | "grid") => void;
  query: string;
  onQueryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-950/40 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search events…"
            className="pl-9"
            aria-label="Search events"
          />
        </div>

        <select
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          <option value="TECHNOLOGY">TECHNOLOGY</option>
          <option value="SPORTS">SPORTS</option>
          <option value="ARTS">ARTS</option>
          <option value="BUSINESS">BUSINESS</option>
          <option value="EDUCATION">EDUCATION</option>
          <option value="HEALTH">HEALTH</option>
          <option value="MUSIC">MUSIC</option>
          <option value="FOOD">FOOD</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={view === "table" ? "default" : "outline"}
          size="icon"
          aria-label="Table view"
          onClick={() => onViewChange("table")}
        >
          <LayoutList className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={view === "grid" ? "default" : "outline"}
          size="icon"
          aria-label="Grid view"
          onClick={() => onViewChange("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
