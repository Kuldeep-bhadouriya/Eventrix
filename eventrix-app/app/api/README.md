# API Documentation

This document describes the API structure, error handling, response formats, and utilities used throughout the Eventrix API.

## Table of Contents

- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Error Codes](#error-codes)
- [Validation](#validation)
- [Rate Limiting](#rate-limiting)
- [Logging](#logging)
- [Authentication](#authentication)
- [Pagination](#pagination)
- [Usage Examples](#usage-examples)

---

## Response Format

All API endpoints follow a standardized JSON response format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2026-01-03T12:00:00.000Z",
    "requestId": "uuid-here",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Invalid email address",
        "code": "invalid_string"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-03T12:00:00.000Z",
    "requestId": "uuid-here"
  }
}
```

---

## Error Handling

### Custom Error Classes

The API provides custom error classes for different scenarios:

| Error Class | Status Code | Use Case |
|------------|-------------|----------|
| `ValidationError` | 400 | Request validation failures |
| `BadRequestError` | 400 | Malformed or invalid requests |
| `AuthenticationError` | 401 | User not authenticated |
| `AuthorizationError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `MethodNotAllowedError` | 405 | HTTP method not supported |
| `ConflictError` | 409 | Resource already exists |
| `RateLimitError` | 429 | Rate limit exceeded |
| `InternalServerError` | 500 | Unexpected server errors |
| `DatabaseError` | 500 | Database operation failures |
| `ExternalApiError` | 502 | External API failures |
| `ServiceUnavailableError` | 503 | Service temporarily unavailable |

### Using Error Classes

```typescript
import { NotFoundError, ValidationError } from '@/lib/api';

// Throw a not found error
throw new NotFoundError('User', userId);

// Throw a validation error with details
throw new ValidationError('Invalid input', [
  { field: 'email', message: 'Email is required' },
  { field: 'password', message: 'Password too short' }
]);
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `BAD_REQUEST` | Malformed request | 400 |
| `AUTHENTICATION_ERROR` | Authentication required | 401 |
| `AUTHORIZATION_ERROR` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `METHOD_NOT_ALLOWED` | HTTP method not allowed | 405 |
| `CONFLICT` | Resource conflict | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_SERVER_ERROR` | Internal server error | 500 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `EXTERNAL_API_ERROR` | External API failed | 502 |
| `SERVICE_UNAVAILABLE` | Service unavailable | 503 |

---

## Validation

### Request Validation with Zod

The API uses Zod for runtime type validation. Validation utilities provide consistent error formatting:

```typescript
import { validateBody, validateQuery, commonSchemas } from '@/lib/api';
import { z } from 'zod';

// Define schema
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: commonSchemas.email,
  password: commonSchemas.password,
});

// Validate request body
export async function POST(req: Request) {
  const body = await validateBody(req, createUserSchema);
  // body is now typed and validated
}

// Validate query parameters
const listParamsSchema = z.object({
  ...commonSchemas.pagination.shape,
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(req: Request) {
  const params = validateQuery(req, listParamsSchema);
  // params is now typed and validated
}
```

### Common Validation Schemas

Pre-built schemas for common patterns:

- `commonSchemas.pagination` - Page and limit parameters
- `commonSchemas.search` - Search query parameters
- `commonSchemas.dateRange` - Date range parameters
- `commonSchemas.sort` - Sorting parameters
- `commonSchemas.uuid` - UUID validation
- `commonSchemas.email` - Email validation
- `commonSchemas.password` - Strong password validation
- `commonSchemas.phone` - Phone number validation
- `commonSchemas.url` - URL validation

---

## Rate Limiting

### Built-in Rate Limiters

```typescript
import { rateLimit, rateLimitPresets } from '@/lib/api';

// Use preset limiter
export async function POST(req: Request) {
  await rateLimitPresets.auth(req); // 5 requests per 15 minutes
  // Your handler code
}

// Custom rate limiter
const customLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests',
});

export async function GET(req: Request) {
  await customLimiter(req);
  // Your handler code
}
```

### Rate Limit Presets

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| `strict` | 10 | 1 minute | Sensitive operations |
| `auth` | 5 | 15 minutes | Authentication endpoints |
| `moderate` | 100 | 15 minutes | General API endpoints |
| `generous` | 1000 | 1 hour | Public read endpoints |
| `api` | 10,000 | 1 hour | Authenticated APIs |

---

## Logging

### API Request Logging

```typescript
import { apiLogger, withLogging } from '@/lib/api';

// Manual logging
export async function GET(req: Request) {
  const log = apiLogger()(req);
  
  try {
    log.debug('Fetching users');
    const users = await getUsers();
    log.info(`Found ${users.length} users`);
    const response = successResponse(users);
    log.success(response);
    return response;
  } catch (error) {
    log.error(error);
    throw error;
  }
}

// Automatic logging with wrapper
export const POST = withLogging(async (req, log) => {
  log.info('Creating user');
  const body = await validateBody(req, createUserSchema);
  const user = await createUser(body);
  return createdResponse(user);
});
```

### Structured Logging

```typescript
import { logger } from '@/lib/api';

logger.info('User logged in', { userId: '123' });
logger.error('Database error', error, { query: 'SELECT ...' });
logger.warn('Slow query detected', { duration: 2000 });
logger.debug('Cache miss', { key: 'user:123' });
```

---

## Authentication

### Protecting Routes

Use the existing RBAC utilities with the API utilities:

```typescript
import { requireAuth, requireRole } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(req: Request) {
  // Require authentication
  const session = await requireAuth(req);
  
  // Get user's data
  const data = await getUserData(session.user.id);
  return successResponse(data);
}

export async function POST(req: Request) {
  // Require specific role
  const session = await requireRole(req, 'ORGANIZER');
  
  // Create event
  const body = await validateBody(req, createEventSchema);
  const event = await createEvent(body, session.user.id);
  return createdResponse(event);
}
```

---

## Pagination

### Paginated Responses

```typescript
import { 
  paginatedResponse, 
  parsePagination,
  validateQuery,
  commonSchemas 
} from '@/lib/api';

export async function GET(req: Request) {
  // Parse pagination params
  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url.searchParams);
  
  // Or validate with schema
  const params = validateQuery(req, commonSchemas.pagination);
  
  // Fetch data
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);
  
  // Return paginated response
  return paginatedResponse(users, page, limit, total);
}
```

---

## Usage Examples

### Basic CRUD API Route

```typescript
import {
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  NotFoundError,
  validateBody,
  validateQuery,
  rateLimitPresets,
  handleApiError,
} from '@/lib/api';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Schemas
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['STUDENT', 'ORGANIZER']),
});

const updateUserSchema = createUserSchema.partial();

// GET /api/users
export const GET = handleApiError(async (req: Request) => {
  await rateLimitPresets.moderate(req);
  
  const { page, limit, skip } = parsePagination(
    new URL(req.url).searchParams
  );
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take: limit }),
    prisma.user.count(),
  ]);
  
  return paginatedResponse(users, page, limit, total);
});

// POST /api/users
export const POST = handleApiError(async (req: Request) => {
  await rateLimitPresets.strict(req);
  
  const body = await validateBody(req, createUserSchema);
  
  const user = await prisma.user.create({
    data: body,
  });
  
  return createdResponse(user, `/api/users/${user.id}`);
});

// GET /api/users/[id]
export const GET_BY_ID = handleApiError(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  await rateLimitPresets.generous(req);
  
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });
  
  if (!user) {
    throw new NotFoundError('User', params.id);
  }
  
  return successResponse(user);
});

// PUT /api/users/[id]
export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  await rateLimitPresets.moderate(req);
  
  const body = await validateBody(req, updateUserSchema);
  
  const user = await prisma.user.update({
    where: { id: params.id },
    data: body,
  });
  
  return successResponse(user);
});

// DELETE /api/users/[id]
export const DELETE = handleApiError(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  await rateLimitPresets.strict(req);
  
  await prisma.user.delete({
    where: { id: params.id },
  });
  
  return noContentResponse();
});
```

### Complex Route with Validation and Logging

```typescript
import {
  successResponse,
  validateBody,
  validateQuery,
  rateLimitPresets,
  withLogging,
  commonSchemas,
  mergeSchemas,
} from '@/lib/api';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  date: z.string().datetime(),
  capacity: z.number().int().positive(),
  category: z.enum(['TECH', 'SPORTS', 'CULTURAL']),
});

const filterSchema = mergeSchemas(
  commonSchemas.pagination,
  z.object({
    category: z.enum(['TECH', 'SPORTS', 'CULTURAL']).optional(),
    search: z.string().optional(),
  })
);

export const GET = withLogging(async (req, log) => {
  await rateLimitPresets.moderate(req);
  
  log.debug('Validating query parameters');
  const filters = validateQuery(req, filterSchema);
  
  log.info('Fetching events', { filters });
  const events = await getEvents(filters);
  
  log.info(`Found ${events.length} events`);
  return successResponse(events);
});

export const POST = withLogging(async (req, log) => {
  await rateLimitPresets.strict(req);
  
  log.debug('Validating request body');
  const body = await validateBody(req, eventSchema);
  
  log.info('Creating event', { title: body.title });
  const event = await createEvent(body);
  
  log.info('Event created', { eventId: event.id });
  return createdResponse(event);
});
```

---

## Health Check

### Endpoint: GET /api/health

Check system health status:

```bash
curl https://your-domain.com/api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-03T12:00:00.000Z",
  "uptime": 12345.67,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "responseTime": 45
    },
    "memory": {
      "status": "healthy",
      "message": "Memory usage normal",
      "details": {
        "heapUsed": "125MB",
        "heapTotal": "256MB",
        "heapUsagePercent": "48.83%",
        "rss": "180MB"
      }
    },
    "rateLimit": {
      "status": "healthy",
      "message": "Rate limiter operational",
      "details": {
        "size": 42
      }
    }
  },
  "info": {
    "nodeVersion": "v20.10.0",
    "platform": "linux",
    "environment": "production"
  }
}
```

---

## Best Practices

1. **Always use handleApiError wrapper** for automatic error handling
2. **Apply rate limiting** to all public endpoints
3. **Validate all inputs** using Zod schemas
4. **Use appropriate error classes** for different scenarios
5. **Log important operations** for debugging and monitoring
6. **Return consistent response formats** using response utilities
7. **Include pagination** for list endpoints
8. **Set proper HTTP status codes** (200, 201, 204, 400, 404, etc.)
9. **Document your APIs** with clear examples
10. **Test error scenarios** thoroughly

---

## Testing API Endpoints

### Using curl

```bash
# GET request
curl -X GET https://your-domain.com/api/users

# POST request with JSON
curl -X POST https://your-domain.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# With authentication
curl -X GET https://your-domain.com/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Health check
curl -I https://your-domain.com/api/health
```

### Using JavaScript/TypeScript

```typescript
// Using fetch
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
  }),
});

const data = await response.json();

if (!data.success) {
  console.error('Error:', data.error);
} else {
  console.log('User created:', data.data);
}
```

---

## Migration from Old Code

If you have existing API routes, migrate them to use the new utilities:

### Before

```typescript
export async function GET(req: Request) {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### After

```typescript
import { successResponse, handleApiError } from '@/lib/api';

export const GET = handleApiError(async (req: Request) => {
  const users = await getUsers();
  return successResponse(users);
});
```

---

## Support

For questions or issues:
- Check the inline documentation in `/lib/api/`
- Review example routes in this document
- Refer to the [RBAC Guide](/Docs/RBAC_GUIDE.md) for authentication
- Check the [Prisma Guide](/Docs/PRISMA_GUIDE.md) for database operations

---

Last Updated: January 3, 2026
