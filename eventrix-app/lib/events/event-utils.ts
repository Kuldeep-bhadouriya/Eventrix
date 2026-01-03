/**
 * Event Utilities
 * Helper functions for event-related operations
 */

import { Event, EventStatus } from '@/types/events';
import { format, formatDistance, parseISO, isAfter, isBefore, addDays } from 'date-fns';

/**
 * Format event date for display
 */
export function formatEventDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format event date and time
 */
export function formatEventDateTime(date: Date | string, time: string): string {
  const formattedDate = formatEventDate(date, 'EEE, MMM d, yyyy');
  return `${formattedDate} at ${time}`;
}

/**
 * Get relative time until event
 */
export function getTimeUntilEvent(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Calculate days until event
 */
export function calculateDaysUntil(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if event is full
 */
export function isEventFull(event: Event): boolean {
  return event.registeredCount >= event.capacity;
}

/**
 * Get event capacity percentage
 */
export function getCapacityPercentage(event: Event): number {
  return Math.round((event.registeredCount / event.capacity) * 100);
}

/**
 * Get remaining seats
 */
export function getRemainingSeats(event: Event): number {
  return Math.max(0, event.capacity - event.registeredCount);
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
}

/**
 * Check if event is past
 */
export function isEventPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
}

/**
 * Check if registration is open
 */
export function isRegistrationOpen(event: Event): boolean {
  return (
    event.status === EventStatus.PUBLISHED &&
    isEventUpcoming(event.date) &&
    !isEventFull(event)
  );
}

/**
 * Get event status display
 */
export function getEventStatus(event: Event): {
  status: string;
  color: string;
  canRegister: boolean;
} {
  if (event.status === EventStatus.CANCELLED) {
    return { status: 'Cancelled', color: 'red', canRegister: false };
  }

  if (event.status === EventStatus.DRAFT) {
    return { status: 'Draft', color: 'gray', canRegister: false };
  }

  if (event.status === EventStatus.COMPLETED || isEventPast(event.date)) {
    return { status: 'Completed', color: 'blue', canRegister: false };
  }

  if (isEventFull(event)) {
    return { status: 'Full', color: 'yellow', canRegister: false };
  }

  if (event.status === EventStatus.CLOSED) {
    return { status: 'Registration Closed', color: 'orange', canRegister: false };
  }

  if (event.status === EventStatus.PUBLISHED && isEventUpcoming(event.date)) {
    return { status: 'Open', color: 'green', canRegister: true };
  }

  return { status: 'Unknown', color: 'gray', canRegister: false };
}

/**
 * Validate event data
 */
export function validateEventDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
}

/**
 * Get event duration in hours (if endTime provided)
 */
export function getEventDuration(startTime: string, endTime?: string): string | null {
  if (!endTime) return null;

  try {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;

    if (duration <= 0) return null;

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch {
    return null;
  }
}

/**
 * Check if event is happening soon (within 7 days)
 */
export function isEventSoon(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const weekFromNow = addDays(new Date(), 7);
  return isAfter(dateObj, new Date()) && isBefore(dateObj, weekFromNow);
}

/**
 * Get capacity status indicator
 */
export function getCapacityStatus(event: Event): {
  label: string;
  color: string;
} {
  const percentage = getCapacityPercentage(event);

  if (percentage >= 100) {
    return { label: 'Full', color: 'red' };
  } else if (percentage >= 80) {
    return { label: 'Almost Full', color: 'yellow' };
  } else if (percentage >= 50) {
    return { label: 'Filling Fast', color: 'orange' };
  } else {
    return { label: 'Available', color: 'green' };
  }
}
