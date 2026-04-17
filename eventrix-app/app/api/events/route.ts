import { NextRequest } from 'next/server';
import {
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '@/lib/api';
import { EventStatus as PrismaEventStatus } from '@prisma/client';
import { EventCategory } from '@/types/events';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/**
 * GET /api/events
 * Fetch events with filtering, sorting, and pagination from the database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') as EventCategory | null;
    const status = searchParams.get('status') as string | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sort = (searchParams.get('sort') || 'date') as 'date' | 'popularity' | 'capacity' | 'createdAt';
    const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';

    // Parse pagination
    const { page, limit, skip } = parsePagination(searchParams);

    // Build where clause for database query
    const where: Prisma.EventWhereInput = {
      AND: [
        // Search filter
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { venue: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        // Category filter
        category ? { category } : {},
        // Status filter - default to PUBLISHED if not specified
        status ? { status: status as PrismaEventStatus } : { status: PrismaEventStatus.PUBLISHED },
        // Date range filters
        dateFrom ? { date: { gte: new Date(dateFrom) } } : {},
        dateTo ? { date: { lte: new Date(dateTo) } } : {},
      ],
    };

    // Build orderBy clause
    let orderBy: Prisma.EventOrderByWithRelationInput = {};
    switch (sort) {
      case 'date':
        orderBy = { date: order as 'asc' | 'desc' };
        break;
      case 'popularity':
        orderBy = { registeredCount: order as 'asc' | 'desc' };
        break;
      case 'capacity':
        orderBy = { capacity: order as 'asc' | 'desc' };
        break;
      case 'createdAt':
        orderBy = { createdAt: order as 'asc' | 'desc' };
        break;
    }

    // Fetch events from database
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              organizationName: true,
              logo: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    // Transform database events to match API response format
    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      time: event.time,
      endTime: event.endTime,
      venue: event.venue,
      capacity: event.capacity,
      registeredCount: event.registeredCount,
      organizerId: event.organizerId,
      organizer: event.organizer ? {
        id: event.organizer.id,
        organizationName: event.organizer.organizationName,
        logo: event.organizer.logo,
      } : undefined,
      category: event.category,
      tags: event.tags,
      bannerUrl: event.bannerUrl,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    // Return paginated response
    return paginatedResponse(transformedEvents, page, limit, total);
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
