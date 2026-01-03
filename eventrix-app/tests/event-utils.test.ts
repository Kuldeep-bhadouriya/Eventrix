import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatEventDate,
  isEventFull,
  getCapacityPercentage,
  getRemainingSeats,
  isRegistrationOpen,
} from '@/lib/events/event-utils';
import {
  getMockEvents,
  findEventById,
  registerForEvent,
  resetMockRegistrations,
} from '@/lib/events/mock-events';

const sampleDate = '2024-01-01T12:00:00.000Z';

describe('event-utils', () => {
  beforeEach(() => {
    resetMockRegistrations();
  });

  it('formats dates consistently', () => {
    const formatted = formatEventDate(sampleDate, 'yyyy-MM-dd');
    expect(formatted).toBe('2024-01-01');
  });

  it('calculates capacity metrics', () => {
    const [event] = getMockEvents();
    event.capacity = 100;
    event.registeredCount = 40;

    expect(isEventFull(event)).toBe(false);
    expect(getCapacityPercentage(event)).toBe(40);
    expect(getRemainingSeats(event)).toBe(60);
  });

  it('blocks registration when full', () => {
    const event = findEventById('event-1');
    expect(event).toBeDefined();
    if (!event) return;

    event.capacity = 5;
    event.registeredCount = 5;

    const result = registerForEvent(event.id, 'user-1');
    expect(result.status).toBe('full');
  });

  it('marks existing registration as already registered', () => {
    const event = findEventById('event-2');
    expect(event).toBeDefined();
    if (!event) return;

    event.registeredCount = 0;

    const first = registerForEvent(event.id, 'user-1');
    const second = registerForEvent(event.id, 'user-1');

    expect(first.status).toBe('registered');
    expect(second.status).toBe('already_registered');
  });

  it('respects registration open rules', () => {
    const event = findEventById('event-3');
    expect(event).toBeDefined();
    if (!event) return;

    // Event is published and future-dated in mock data
    expect(isRegistrationOpen(event)).toBe(true);

    event.registeredCount = event.capacity;
    expect(isRegistrationOpen(event)).toBe(false);
  });
});
