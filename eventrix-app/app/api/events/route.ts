import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '@/lib/api';
import { EventStatus, EventCategory } from '@/types/events';

// Mock data for now - replace with actual database queries
const mockEvents = Array.from({ length: 50 }, (_, i) => ({
  id: `event-${i + 1}`,
  title: `Amazing Event ${i + 1}`,
  description: `This is a detailed description of event ${i + 1}. It will be an amazing experience with great speakers and networking opportunities.`,
  date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in next 90 days
  time: '10:00 AM',
  endTime: '05:00 PM',
  venue: `Venue ${Math.floor(i / 5) + 1}, City Center`,
  capacity: Math.floor(Math.random() * 500) + 50,
  registeredCount: Math.floor(Math.random() * 300),
  organizerId: `org-${Math.floor(i / 3) + 1}`,
  organizer: {
    id: `org-${Math.floor(i / 3) + 1}`,
    organizationName: `Organization ${Math.floor(i / 3) + 1}`,
    logo: undefined,
  },
  category: Object.values(EventCategory)[i % Object.values(EventCategory).length] as EventCategory,
  tags: ['networking', 'workshop', 'learning'],
  bannerUrl: undefined,
  status: EventStatus.PUBLISHED,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

/**
 * GET /api/events
 * Fetch events with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') as EventCategory | null;
    const status = searchParams.get('status') as EventStatus | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = (searchParams.get('sort') || 'date') as 'date' | 'popularity' | 'capacity' | 'createdAt';
    const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';

    // Parse pagination
    const { page, limit, skip } = parsePagination(searchParams);

    // Filter events
    let filteredEvents = mockEvents;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.venue.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (category) {
      filteredEvents = filteredEvents.filter((event) => event.category === category);
    }

    // Status filter
    if (status) {
      filteredEvents = filteredEvents.filter((event) => event.status === status);
    } else {
      // By default, only show published events
      filteredEvents = filteredEvents.filter((event) => event.status === EventStatus.PUBLISHED);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) <= toDate
      );
    }

    // Sort events
    filteredEvents.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'popularity':
          comparison = b.registeredCount - a.registeredCount;
          break;
        case 'capacity':
          const remainingA = a.capacity - a.registeredCount;
          const remainingB = b.capacity - b.registeredCount;
          comparison = remainingB - remainingA;
          break;
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    // Calculate pagination
    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedEvents = filteredEvents.slice(skip, skip + limit);

    // Return paginated response
    return paginatedResponse(paginatedEvents, page, limit, total);
  } catch (error) {
    console.error('Error fetching events:', error);
    return errorResponse(error);
  }
}

/**
 * TODO: Replace mock data with actual database queries
 * 
 * Example Prisma query:
 * 
 * const events = await prisma.event.findMany({
 *   where: {
 *     AND: [
 *       search ? {
 *         OR: [
 *           { title: { contains: search, mode: 'insensitive' } },
 *           { description: { contains: search, mode: 'insensitive' } },
 *           { venue: { contains: search, mode: 'insensitive' } },
 *         ],
 *       } : {},
 *       category ? { category } : {},
 *       status ? { status } : { status: EventStatus.PUBLISHED },
 *       dateFrom ? { date: { gte: new Date(dateFrom) } } : {},
 *       dateTo ? { date: { lte: new Date(dateTo) } } : {},
 *     ],
 *   },
 *   include: {
 *     organizer: {
 *       select: {
 *         id: true,
 *         organizationName: true,
 *         logo: true,
 *       },
 *     },
 *   },
 *   orderBy: getOrderBy(sort, order),
 *   skip,
 *   take: limit,
 * });
 * 
 * const total = await prisma.event.count({ where });
 */
