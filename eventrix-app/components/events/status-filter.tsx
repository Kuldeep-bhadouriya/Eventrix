'use client';

import React from 'react';
import { EventStatus } from '@/types/events';
import { EVENT_STATUSES } from '@/lib/constants/event-statuses';
import { Label } from '@/components/ui/label';

interface StatusFilterProps {
  value: EventStatus | '';
  onChange: (value: EventStatus | '') => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  // Filter to only show relevant statuses for public listing
  const publicStatuses = EVENT_STATUSES.filter(
    (status) =>
      status.value === EventStatus.PUBLISHED ||
      status.value === EventStatus.CLOSED ||
      status.value === EventStatus.COMPLETED
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <select
        id="status"
        value={value}
        onChange={(e) => onChange(e.target.value as EventStatus | '')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">All Status</option>
        {publicStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}
