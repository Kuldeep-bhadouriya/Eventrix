import React from 'react';
import Link from 'next/link';
import { Event } from '@/types/events';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  formatEventDate,
  getCapacityPercentage,
  getRemainingSeats,
  getEventStatus,
  getEventDuration,
} from '@/lib/events/event-utils';
import { getCategoryLabel, getCategoryIcon } from '@/lib/constants/event-categories';

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className = '' }: EventCardProps) {
  const capacityPercentage = getCapacityPercentage(event);
  const remainingSeats = getRemainingSeats(event);
  const statusInfo = getEventStatus(event);
  const duration = getEventDuration(event.time, event.endTime);

  return (
    <Card
      className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl dark:glass-effect dark:border-white/10 dark:bg-white/10 ${className}`}
    >
      {/* Media Header */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/70 via-indigo-600/60 to-purple-600/70" />
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/90">
            {getCategoryIcon(event.category)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />

        {/* Top chips */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm dark:bg-white/10 dark:text-white">
            {getCategoryIcon(event.category)}
            <span>{getCategoryLabel(event.category)}</span>
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
              statusInfo.color === 'green'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : statusInfo.color === 'red'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  : statusInfo.color === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                    : statusInfo.color === 'blue'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
            }`}
          >
            {statusInfo.status}
          </span>
        </div>

        {/* Bottom title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white sm:text-xl">
            {event.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 px-5 pb-5 pt-4">
        {/* Description */}
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-white/75">
          {event.description}
        </p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-white/85">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-white/70" />
            <span>{formatEventDate(event.date, 'EEE, MMM d')}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-white/85">
            <Clock className="h-4 w-4 text-gray-500 dark:text-white/70" />
            <span>
              {event.time}
              {duration ? ` · ${duration}` : ''}
            </span>
          </div>
          <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-white/85">
            <MapPin className="h-4 w-4 shrink-0 text-gray-500 dark:text-white/70" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-white/70">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500 dark:text-white/70" />
              <span>
                {event.registeredCount} / {event.capacity} registered
              </span>
            </div>
            <span>{capacityPercentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/15">
            <div
              className={`h-full transition-all ${
                capacityPercentage >= 100
                  ? 'bg-red-500'
                  : capacityPercentage >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
          {remainingSeats > 0 && remainingSeats <= 10 && (
            <p className="text-xs text-orange-600 dark:text-orange-200">
              Only {remainingSeats} seats left!
            </p>
          )}
        </div>

        {/* CTA */}
        <Link href={`/events/${event.id}`} className="block">
          <Button
            className="w-full border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 dark:glass-effect dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            variant={statusInfo.canRegister ? 'default' : 'outline'}
          >
            View Details
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
