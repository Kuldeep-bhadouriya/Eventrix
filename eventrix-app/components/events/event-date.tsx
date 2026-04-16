import { Calendar, Clock } from 'lucide-react';
import { formatEventDate } from '@/lib/events/event-utils';
import { cn } from '@/lib/utils';

interface EventDateProps {
  date: Date | string;
  time?: string;
  format?: string;
  className?: string;
}

export function EventDate({ date, time, format = 'EEE, MMM d, yyyy', className }: EventDateProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-200', className)}>
      <span className="inline-flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        {formatEventDate(date, format)}
      </span>
      {time ? (
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {time}
        </span>
      ) : null}
    </div>
  );
}
