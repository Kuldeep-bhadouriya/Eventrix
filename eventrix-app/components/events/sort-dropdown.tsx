'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

type SortOption = 'date' | 'popularity' | 'capacity' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface SortDropdownProps {
  sortBy: SortOption;
  order: SortOrder;
  onSortChange: (sortBy: SortOption, order: SortOrder) => void;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  buttonClassName?: string;
}

export function SortDropdown({
  sortBy,
  order,
  onSortChange,
  className = '',
  labelClassName = '',
  selectClassName = '',
  buttonClassName = '',
}: SortDropdownProps) {
  const sortOptions = [
    { value: 'date', label: 'Event Date' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'capacity', label: 'Available Seats' },
    { value: 'createdAt', label: 'Recently Added' },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label htmlFor="sort" className={`shrink-0 ${labelClassName}`}>
        Sort by:
      </Label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption, order)}
        className={`flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${selectClassName}`}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
        className={`flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-gray-900 hover:bg-accent hover:text-accent-foreground dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 ${buttonClassName}`}
        title={order === 'asc' ? 'Ascending' : 'Descending'}
      >
        <ArrowUpDown className={`h-4 w-4 ${order === 'desc' ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
