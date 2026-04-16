import { Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventStatsProps {
  registrations: number;
  views?: number;
  className?: string;
}

export function EventStats({ registrations, views, className }: EventStatsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300', className)}>
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        {registrations} registrations
      </span>
      {typeof views === 'number' ? (
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {views} views
        </span>
      ) : null}
    </div>
  );
}
