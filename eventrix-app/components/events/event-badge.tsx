import { EventStatus } from '@/types/events';
import { cn } from '@/lib/utils';

type BadgeStatus = EventStatus | 'OPEN' | 'FULL';

interface EventBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const STATUS_STYLES: Record<BadgeStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Open',
    className: 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100',
  },
  FULL: {
    label: 'Full',
    className: 'border-amber-300/40 bg-amber-500/15 text-amber-100',
  },
  [EventStatus.DRAFT]: {
    label: 'Draft',
    className: 'border-zinc-300/35 bg-zinc-500/15 text-zinc-100',
  },
  [EventStatus.PUBLISHED]: {
    label: 'Open',
    className: 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100',
  },
  [EventStatus.CLOSED]: {
    label: 'Closed',
    className: 'border-orange-300/40 bg-orange-500/15 text-orange-100',
  },
  [EventStatus.COMPLETED]: {
    label: 'Completed',
    className: 'border-sky-300/40 bg-sky-500/15 text-sky-100',
  },
  [EventStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'border-rose-300/40 bg-rose-500/15 text-rose-100',
  },
};

export function EventBadge({ status, className }: EventBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[EventStatus.DRAFT];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
