/**
 * API Response Utilities
 * 
 * Standardized response format and helper functions for API routes.
 * Ensures consistent response structure across all endpoints.
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { isApiError, toApiError } from './api-error';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
    details?: Array<{ field?: string; message: string; code?: string }>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Success response helper
 * 
 * @example
 * return successResponse({ user: { id: 1, name: 'John' } });
 * return successResponse(users, 200, { pagination: paginationMeta });
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Partial<ApiResponse['meta']>
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Error response helper
 * 
 * @example
 * return errorResponse(new NotFoundError('User', userId));
 * return errorResponse(new ValidationError('Invalid input', validationDetails));
 */
export function errorResponse(
  error: unknown,
  requestId?: string
): NextResponse<ApiResponse> {
  const apiError = isApiError(error) ? error : toApiError(error);

  const response: ApiResponse = {
    success: false,
    error: {
      message: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
      details: apiError.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  // Log error for monitoring (non-operational errors)
  if (!apiError.isOperational) {
    console.error('[API Error]', {
      message: apiError.message,
      code: apiError.code,
      stack: apiError.stack,
      requestId,
    });
    Sentry.captureException(apiError);
  }

  return NextResponse.json(response, { status: apiError.statusCode });
}

/**
 * Created response helper (201)
 * 
 * @example
 * return createdResponse({ id: newUser.id }, '/api/users/123');
 */
export function createdResponse<T>(
  data: T,
  location?: string
): NextResponse<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  if (location) {
    headers.Location = location;
  }

  return NextResponse.json(
    {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    },
    { status: 201, headers }
  );
}

/**
 * No content response helper (204)
 * 
 * @example
 * return noContentResponse();
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Paginated response helper
 * 
 * @example
 * return paginatedResponse(users, page, limit, totalUsers);
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return successResponse(data, 200, { pagination });
}

/**
 * Handle API errors in route handlers
 * Wraps async route handlers with error handling
 * 
 * @example
 * export const GET = handleApiError(async (req) => {
 *   const data = await fetchData();
 *   return successResponse(data);
 * });
 */
export function handleApiError<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      Sentry.captureException(error);
      return errorResponse(error);
    }
  }) as T;
}

/**
 * Create pagination metadata from query parameters
 * 
 * @example
 * const { page, limit, skip } = parsePagination(searchParams);
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultPage: number = 1,
  defaultLimit: number = 10,
  maxLimit: number = 100
): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaultPage), 10));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit), 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination links for response headers
 * 
 * @example
 * const links = createPaginationLinks(baseUrl, page, totalPages);
 */
export function createPaginationLinks(
  baseUrl: string,
  page: number,
  totalPages: number
): Record<string, string> {
  const links: Record<string, string> = {};

  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}`;
    links.first = `${baseUrl}?page=1`;
  }

  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}`;
    links.last = `${baseUrl}?page=${totalPages}`;
  }

  return links;
}

/**
 * Format response headers with pagination links
 * 
 * @example
 * const headers = formatPaginationHeaders(req.url, page, totalPages);
 * return NextResponse.json(data, { headers });
 */
export function formatPaginationHeaders(
  url: string,
  page: number,
  totalPages: number,
  total: number
): HeadersInit {
  const baseUrl = url.split('?')[0];
  const links = createPaginationLinks(baseUrl, page, totalPages);
  const linkHeader = Object.entries(links)
    .map(([rel, url]) => `<${url}>; rel="${rel}"`)
    .join(', ');

  return {
    'X-Total-Count': String(total),
    'X-Page': String(page),
    'X-Total-Pages': String(totalPages),
    ...(linkHeader && { Link: linkHeader }),
  };
}

/**
 * Parse request body safely
 * 
 * @example
 * const body = await parseRequestBody<CreateUserInput>(req);
 */
export async function parseRequestBody<T>(req: Request): Promise<T> {
  try {
    const contentType = req.headers.get('content-type');
    
    if (!contentType) {
      throw new Error('Content-Type header is required');
    }

    if (contentType.includes('application/json')) {
      return await req.json();
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      return Object.fromEntries(formData) as T;
    }

    throw new Error(`Unsupported Content-Type: ${contentType}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse request body: ${error.message}`);
    }
    throw new Error('Failed to parse request body');
  }
}

/**
 * Extract request ID from headers or generate one
 */
export function getRequestId(req: Request): string {
  return req.headers.get('x-request-id') || crypto.randomUUID();
}

/**
 * Check if request method is allowed
 * 
 * @example
 * checkMethod(req, ['GET', 'POST']);
 */
export function checkMethod(req: Request, allowedMethods: string[]): void {
  if (!allowedMethods.includes(req.method)) {
    throw new Error(`Method ${req.method} not allowed`);
  }
}
