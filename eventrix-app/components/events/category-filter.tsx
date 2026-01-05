'use client';

import React from 'react';
import { EventCategory } from '@/types/events';
import { EVENT_CATEGORIES } from '@/lib/constants/event-categories';
import { Label } from '@/components/ui/label';

interface CategoryFilterProps {
  value: EventCategory | '';
  onChange: (value: EventCategory | '') => void;
  labelClassName?: string;
  selectClassName?: string;
}

export function CategoryFilter({
  value,
  onChange,
  labelClassName = '',
  selectClassName = '',
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category" className={labelClassName}>
        Category
      </Label>
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value as EventCategory | '')}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${selectClassName}`}
      >
        <option value="">All Categories</option>
        {EVENT_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.icon} {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
