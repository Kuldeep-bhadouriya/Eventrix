'use client';

import React from 'react';
import { EventCategory } from '@/types/events';
import { EVENT_CATEGORIES } from '@/lib/constants/event-categories';
import { Label } from '@/components/ui/label';

interface CategoryFilterProps {
  value: EventCategory | '';
  onChange: (value: EventCategory | '') => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category</Label>
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value as EventCategory | '')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
