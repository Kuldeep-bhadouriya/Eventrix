/**
 * Example API Route
 * 
 * Demonstrates how to use all the API utilities together:
 * - Error handling
 * - Validation
 * - Rate limiting
 * - Logging
 * - Response formatting
 */

import {
  successResponse,
  errorResponse,
  createdResponse,
  paginatedResponse,
  handleApiError,
  validateBody,
  validateQuery,
  rateLimitPresets,
  withLogging,
  commonSchemas,
  NotFoundError,
  ConflictError,
  parsePagination,
} from '@/lib/api';
import { z } from 'zod';
import { prisma } from '@/lib/db';

/**
 * Example schemas
 */
const exampleCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: commonSchemas.email,
  age: z.number().int().min(1).max(120).optional(),
});

const exampleListSchema = z.object({
  ...commonSchemas.pagination.shape,
  search: z.string().optional(),
});

/**
 * GET /api/example
 * List all examples with pagination
 */
export const GET = handleApiError(
  withLogging(async (req, log) => {
    // Apply rate limiting
    await rateLimitPresets.generous(req);

    // Validate query parameters
    log.debug('Validating query parameters');
    const params = validateQuery(req, exampleListSchema);

    // Parse pagination
    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams);

    log.info('Fetching examples', { page, limit, search: params.search });

    // Fetch data (example with User model)
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    log.info(`Found ${users.length} of ${total} examples`);

    // Return paginated response
    return paginatedResponse(users, page, limit, total);
  })
);

/**
 * POST /api/example
 * Create a new example
 */
export const POST = handleApiError(
  withLogging(async (req, log) => {
    // Apply stricter rate limiting for write operations
    await rateLimitPresets.moderate(req);

    // Validate request body
    log.debug('Validating request body');
    const body = await validateBody(req, exampleCreateSchema);

    log.info('Creating example', { name: body.name });

    // Check for conflicts
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      log.warn('Email already exists', { email: body.email });
      throw new ConflictError('User with this email already exists');
    }

    // Create resource (example)
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: 'STUDENT', // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    log.info('Example created', { id: user.id });

    // Return created response with location header
    return createdResponse(user, `/api/example/${user.id}`);
  })
);

/**
 * GET /api/example/[id]
 * Get a single example by ID
 */
export const GET_BY_ID = handleApiError(
  withLogging(async (req, log, { params }: { params: { id: string } }) => {
    // Apply rate limiting
    await rateLimitPresets.generous(req);

    log.info('Fetching example by ID', { id: params.id });

    // Fetch resource
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      log.warn('Example not found', { id: params.id });
      throw new NotFoundError('User', params.id);
    }

    log.info('Example found', { id: user.id });

    return successResponse(user);
  })
);
