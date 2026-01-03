import { EventDetails } from '@/types/events';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import {
  formatEventDate,
  getEventDuration,
  getEventStatus,
  getCapacityPercentage,
  getRemainingSeats,
} from '@/lib/events/event-utils';
import { getCategoryIcon, getCategoryLabel } from '@/lib/constants/event-categories';

interface EventHeaderProps {
  event: EventDetails;
  actions?: React.ReactNode;
}

export function EventHeader({ event, actions }: EventHeaderProps) {
  const statusInfo = getEventStatus(event);
  const duration = getEventDuration(event.time, event.endTime);
  const capacityPercentage = getCapacityPercentage(event);
  const remainingSeats = getRemainingSeats(event);

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gray-900 text-white shadow-2xl">
      <div className="absolute inset-0">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
      </div>

      <div className="relative flex flex-col gap-6 p-8 md:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
            <span>{getCategoryIcon(event.category)}</span>
            {getCategoryLabel(event.category)}
          </span>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${
              statusInfo.color === 'green'
                ? 'bg-green-500/20 text-green-100'
                : statusInfo.color === 'red'
                ? 'bg-red-500/20 text-red-100'
                : statusInfo.color === 'yellow'
                ? 'bg-yellow-500/20 text-yellow-100'
                : statusInfo.color === 'blue'
                ? 'bg-blue-500/20 text-blue-100'
                : 'bg-gray-500/20 text-gray-100'
            }`}
          >
            {statusInfo.status}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">{event.title}</h1>
          <p className="max-w-3xl text-lg text-gray-100/90">{event.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-100/90">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Calendar className="h-4 w-4" />
            <span>{formatEventDate(event.date, 'EEE, MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Clock className="h-4 w-4" />
            <span>
              {event.time}
              {duration ? ` (${duration})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Users className="h-4 w-4" />
            <span>
              {event.registeredCount} / {event.capacity} registered
              {remainingSeats > 0 ? ` · ${remainingSeats} seats left` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            <span>{capacityPercentage}% capacity filled</span>
          </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
