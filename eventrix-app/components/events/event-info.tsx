import { EventDetails } from '@/types/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';
import { formatEventDate, getRemainingSeats, getCapacityPercentage } from '@/lib/events/event-utils';
import { getCategoryLabel } from '@/lib/constants/event-categories';

interface EventInfoProps {
  event: EventDetails;
}

export function EventInfo({ event }: EventInfoProps) {
  const mapUrl =
    event.location?.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`;
  const remainingSeats = getRemainingSeats(event);
  const capacityPercentage = getCapacityPercentage(event);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" /> Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatEventDate(event.date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {event.time}
              {event.endTime ? ` - ${event.endTime}` : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" /> Venue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.location?.address || event.venue}</span>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
            <a href={mapUrl} target="_blank" rel="noreferrer">
              Open in Maps
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Capacity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <div>
            {event.registeredCount} of {event.capacity} registered
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {remainingSeats > 0 ? `${remainingSeats} seats remaining` : 'Event is full'}
          </div>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" /> Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {getCategoryLabel(event.category)}
          </div>
          {event.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
