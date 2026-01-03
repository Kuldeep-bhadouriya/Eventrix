import { EventCategory, EventDetails, EventStatus } from '@/types/events';

const baseDate = new Date();
const categories = Object.values(EventCategory);

// Persistent in-memory mock data used across event API routes
const mockEvents: EventDetails[] = Array.from({ length: 24 }, (_, i) => {
  const eventDate = new Date(baseDate.getTime() + (i + 2) * 24 * 60 * 60 * 1000);
  const category = categories[i % categories.length];
  const capacity = Math.floor(Math.random() * 400) + 60;
  const registeredCount = Math.min(capacity - 10, Math.floor(Math.random() * capacity));

  return {
    id: `event-${i + 1}`,
    title: `Signature ${category.toLowerCase()} event ${i + 1}`,
    description:
      'Join industry leaders, practitioners, and enthusiasts for a full-day experience packed with learning, networking, and hands-on sessions tailored to this theme.',
    date: eventDate.toISOString(),
    time: '09:30 AM',
    endTime: '05:30 PM',
    venue: `Innovation Center Hall ${((i % 5) + 1).toString()}`,
    location: {
      address: `Innovation Center Hall ${((i % 5) + 1).toString()}, City Center`,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `Innovation Center Hall ${((i % 5) + 1).toString()}, City Center`
      )}`,
    },
    capacity,
    registeredCount,
    organizerId: `org-${Math.floor(i / 3) + 1}`,
    organizer: {
      id: `org-${Math.floor(i / 3) + 1}`,
      organizationName: `Organization ${Math.floor(i / 3) + 1}`,
      contactEmail: `hello@org${Math.floor(i / 3) + 1}.com`,
      contactPhone: '+1 (555) 123-4567',
      website: 'https://example.com',
      description:
        'We craft meaningful experiences that connect people, ideas, and innovation across industries.',
    },
    category,
    tags: ['networking', 'workshop', 'learning'],
    bannerUrl: `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80&sig=${i}`,
    status: EventStatus.PUBLISHED,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    agenda: [
      {
        time: '09:30 AM',
        title: 'Registration & Welcome Coffee',
        description: 'Check-in, grab your badge, and meet fellow attendees.',
      },
      {
        time: '10:30 AM',
        title: 'Keynote & Vision Talk',
        description: 'Hear from industry leaders about the future of the field.',
        speaker: 'Guest Speaker',
      },
      {
        time: '01:00 PM',
        title: 'Workshops & Breakouts',
        description: 'Hands-on sessions to apply what you have learned.',
      },
      {
        time: '04:00 PM',
        title: 'Networking & Closing',
        description: 'Connect with peers, organizers, and partners.',
      },
    ],
    highlights: [
      'Expert-led sessions and panels',
      'Hands-on workshops with mentors',
      'Curated networking opportunities',
    ],
  } as EventDetails;
});

const registrationStore = new Map<string, Set<string>>();
const initialRegisteredCounts = new Map<string, number>(
  mockEvents.map((event) => [event.id, event.registeredCount])
);

export function getMockEvents(): EventDetails[] {
  return mockEvents;
}

export function findEventById(id: string): EventDetails | undefined {
  return mockEvents.find((event) => event.id === id);
}

export function getRelatedEvents(eventId: string, limit = 6): EventDetails[] {
  const current = findEventById(eventId);
  if (!current) return [];

  return mockEvents
    .filter((event) => event.id !== eventId && event.category === current.category)
    .slice(0, limit);
}

export function isUserRegistered(eventId: string, userId: string): boolean {
  const registrations = registrationStore.get(eventId);
  return registrations ? registrations.has(userId) : false;
}

export function registerForEvent(eventId: string, userId: string): {
  status: 'registered' | 'already_registered' | 'full' | 'not_found';
  event?: EventDetails;
} {
  const event = findEventById(eventId);
  if (!event) {
    return { status: 'not_found' };
  }

  if (isUserRegistered(eventId, userId)) {
    return { status: 'already_registered', event };
  }

  if (event.registeredCount >= event.capacity) {
    return { status: 'full', event };
  }

  const registrations = registrationStore.get(eventId) ?? new Set<string>();
  registrations.add(userId);
  registrationStore.set(eventId, registrations);
  event.registeredCount += 1;

  return { status: 'registered', event };
}

export function resetMockRegistrations() {
  registrationStore.clear();
  mockEvents.forEach((event) => {
    const initialCount = initialRegisteredCounts.get(event.id);
    if (typeof initialCount === 'number') {
      event.registeredCount = initialCount;
    }
  });
}
