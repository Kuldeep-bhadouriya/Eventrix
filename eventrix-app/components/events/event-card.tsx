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
      className={`group overflow-hidden transition-all hover:shadow-xl ${className}`}
    >
      {/* Banner Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            {getCategoryIcon(event.category)}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
            {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              statusInfo.color === 'green'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : statusInfo.color === 'red'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : statusInfo.color === 'yellow'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : statusInfo.color === 'blue'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}
          >
            {statusInfo.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
          {event.title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2">
          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <span>
              {formatEventDate(event.date, 'EEE, MMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <span>
              {event.time}
              {duration && ` (${duration})`}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>

          {/* Capacity */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Users className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <span>
              {event.registeredCount} / {event.capacity} registered
            </span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Capacity</span>
            <span>{capacityPercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
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
            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              Only {remainingSeats} seats left!
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Link href={`/events/${event.id}`}>
            <Button
              className="w-full"
              variant={statusInfo.canRegister ? 'default' : 'outline'}
            >
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
