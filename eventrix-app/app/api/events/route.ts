import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '@/lib/api';
import { EventStatus, EventCategory } from '@/types/events';
import { getMockEvents } from '@/lib/events/mock-events';
import { eventSchema } from '@/lib/events/event-schemas';

// Shared mock data used across event endpoints
const mockEvents = getMockEvents();

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
    const paginatedEvents = filteredEvents
      .slice(skip, skip + limit)
      .map((item) => eventSchema.parse(item));

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
