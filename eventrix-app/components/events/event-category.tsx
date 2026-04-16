import { getCategoryIcon, getCategoryLabel } from '@/lib/constants/event-categories';
import { EventCategory as EventCategoryType } from '@/types/events';
import { cn } from '@/lib/utils';

interface EventCategoryProps {
  category: EventCategoryType;
  showIcon?: boolean;
  className?: string;
}

export function EventCategory({
  category,
  showIcon = true,
  className,
}: EventCategoryProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-white/10 dark:text-white/90',
        className,
      )}
    >
      {showIcon ? <span aria-hidden>{getCategoryIcon(category)}</span> : null}
      <span>{getCategoryLabel(category)}</span>
    </span>
  );
}
