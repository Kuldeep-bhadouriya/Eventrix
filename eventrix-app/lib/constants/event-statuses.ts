/**
 * Event Statuses
 * Predefined event statuses with display information
 */

import { EventStatus } from '@/types/events';

export const EVENT_STATUSES = [
  {
    value: EventStatus.DRAFT,
    label: 'Draft',
    color: 'gray',
    description: 'Event is in draft mode',
  },
  {
    value: EventStatus.PUBLISHED,
    label: 'Open',
    color: 'green',
    description: 'Event is published and accepting registrations',
  },
  {
    value: EventStatus.CLOSED,
    label: 'Closed',
    color: 'red',
    description: 'Registration is closed',
  },
  {
    value: EventStatus.COMPLETED,
    label: 'Completed',
    color: 'blue',
    description: 'Event has been completed',
  },
  {
    value: EventStatus.CANCELLED,
    label: 'Cancelled',
    color: 'red',
    description: 'Event has been cancelled',
  },
] as const;

export const getStatusInfo = (status: EventStatus) => {
  return EVENT_STATUSES.find((s) => s.value === status);
};

export const getStatusLabel = (status: EventStatus) => {
  return getStatusInfo(status)?.label || status;
};

export const getStatusColor = (status: EventStatus) => {
  return getStatusInfo(status)?.color || 'gray';
};
