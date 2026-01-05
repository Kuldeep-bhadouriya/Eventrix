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
  cardClassName?: string;
  titleClassName?: string;
  controlLabelClassName?: string;
  selectClassName?: string;
  dateInputClassName?: string;
  optionTextClassName?: string;
  clearButtonClassName?: string;
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
  cardClassName = '',
  titleClassName = '',
  controlLabelClassName = '',
  selectClassName = '',
  dateInputClassName = '',
  optionTextClassName = '',
  clearButtonClassName = '',
}: FilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters = category || status || dateRange !== 'all';

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${titleClassName}`}>Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className={`h-auto p-0 text-sm text-primary hover:underline ${clearButtonClassName}`}
          >
            Clear All
          </Button>
        )}
      </div>

      <CategoryFilter
        value={category}
        onChange={onCategoryChange}
        labelClassName={controlLabelClassName}
        selectClassName={selectClassName}
      />

      <DateRangeFilter
        value={dateRange}
        onChange={onDateRangeChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        labelClassName={controlLabelClassName}
        optionTextClassName={optionTextClassName}
        dateInputClassName={dateInputClassName}
      />

      <StatusFilter
        value={status}
        onChange={onStatusChange}
        labelClassName={controlLabelClassName}
        selectClassName={selectClassName}
      />
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
        <Card className={`sticky top-4 p-6 ${cardClassName}`}>
          {filterContent}
        </Card>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="glass-effect absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-white/10 p-6 text-white">
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
                className="w-full glass-effect border-white/20 bg-white/10 text-white hover:bg-white/20"
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
