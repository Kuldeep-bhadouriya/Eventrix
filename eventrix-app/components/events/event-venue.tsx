import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventVenueProps {
  venue: string;
  className?: string;
}

export function EventVenue({ venue, className }: EventVenueProps) {
  return (
    <div className={cn('inline-flex max-w-full items-center gap-2 text-sm text-gray-700 dark:text-gray-200', className)}>
      <MapPin className="h-4 w-4 shrink-0 text-primary" />
      <span className="line-clamp-1">{venue}</span>
    </div>
  );
}
