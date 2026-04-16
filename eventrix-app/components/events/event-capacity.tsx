import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCapacityProps {
  capacity: number;
  registeredCount: number;
  className?: string;
}

function getProgressTone(percent: number) {
  if (percent >= 100) return 'bg-rose-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function EventCapacity({ capacity, registeredCount, className }: EventCapacityProps) {
  const normalizedCapacity = capacity > 0 ? capacity : 1;
  const progress = Math.min(Math.round((registeredCount / normalizedCapacity) * 100), 100);
  const remainingSeats = Math.max(capacity - registeredCount, 0);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {registeredCount} / {capacity} registered
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/15">
        <div className={cn('h-full rounded-full transition-all', getProgressTone(progress))} style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {remainingSeats > 0 ? `${remainingSeats} seat${remainingSeats === 1 ? '' : 's'} remaining` : 'Event is full'}
      </p>
    </div>
  );
}
