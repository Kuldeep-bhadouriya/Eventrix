'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

interface DateRangeFilterProps {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
}

export function DateRangeFilter({
  value,
  onChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <div className="space-y-3">
      <Label>Date Range</Label>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateRange"
            value="all"
            checked={value === 'all'}
            onChange={(e) => onChange(e.target.value as DateFilter)}
            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">All Upcoming</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateRange"
            value="today"
            checked={value === 'today'}
            onChange={(e) => onChange(e.target.value as DateFilter)}
            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">Today</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateRange"
            value="week"
            checked={value === 'week'}
            onChange={(e) => onChange(e.target.value as DateFilter)}
            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">This Week</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateRange"
            value="month"
            checked={value === 'month'}
            onChange={(e) => onChange(e.target.value as DateFilter)}
            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">This Month</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateRange"
            value="custom"
            checked={value === 'custom'}
            onChange={(e) => onChange(e.target.value as DateFilter)}
            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">Custom Range</span>
        </label>
      </div>

      {value === 'custom' && onDateFromChange && onDateToChange && (
        <div className="mt-3 space-y-2 pl-6">
          <div>
            <Label htmlFor="dateFrom" className="text-xs">
              From
            </Label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom || ''}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <Label htmlFor="dateTo" className="text-xs">
              To
            </Label>
            <input
              type="date"
              id="dateTo"
              value={dateTo || ''}
              onChange={(e) => onDateToChange(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}
