'use client';

import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EventCategory, EventStatus } from '@/types/events';
import { CategoryFilter } from './category-filter';
import { DateRangeFilter } from './date-range-filter';
import { StatusFilter } from './status-filter';

interface FilterSidebarProps {
  category: EventCategory | '';
  status: EventStatus | '';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  onCategoryChange: (value: EventCategory | '') => void;
  onStatusChange: (value: EventStatus | '') => void;
  onDateRangeChange: (value: 'all' | 'today' | 'week' | 'month' | 'custom') => void;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterSidebar({
  category,
  status,
  dateRange,
  dateFrom,
  dateTo,
  onCategoryChange,
  onStatusChange,
  onDateRangeChange,
  onDateFromChange,
  onDateToChange,
  onClearAll,
  className = '',
}: FilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters = category || status || dateRange !== 'all';

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-auto p-0 text-sm text-primary hover:underline"
          >
            Clear All
          </Button>
        )}
      </div>

      <CategoryFilter value={category} onChange={onCategoryChange} />

      <DateRangeFilter
        value={dateRange}
        onChange={onDateRangeChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
      />

      <StatusFilter value={status} onChange={onStatusChange} />
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button
          onClick={() => setIsMobileOpen(true)}
          variant="outline"
          className="w-full"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {[category, status, dateRange !== 'all'].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${className}`}>
        <Card className="sticky top-4 p-6">
          {filterContent}
        </Card>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {filterContent}
            <div className="mt-6">
              <Button
                onClick={() => setIsMobileOpen(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
