import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  ApiError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  isApiError,
} from '../api-error';
import {
  successResponse,
  errorResponse,
  createdResponse,
  paginatedResponse,
  parsePagination,
} from '../api-response';
import { validate, safeValidate, commonSchemas } from '../api-validator';
import { rateLimit, rateLimitPresets, getClientIp, clearRateLimits } from '../rate-limiter';
import { apiLogger, logger } from '../api-logger';

function extractStatus(response: Response) {
  return response.status;
}

describe('API utilities integration', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('creates and identifies API errors', () => {
    const validationError = new ValidationError('Test validation error', [
      { field: 'email', message: 'Invalid email' },
    ]);
    const notFoundError = new NotFoundError('User', '123');
    const rateLimitError = new RateLimitError('Too many requests', 60);
    const authError = new AuthenticationError('Auth');

    expect(validationError.statusCode).toBe(400);
    expect(notFoundError.statusCode).toBe(404);
    expect(rateLimitError.statusCode).toBe(429);
    expect(authError).toBeInstanceOf(ApiError);
    expect(isApiError(validationError)).toBe(true);
  });

  it('builds standard responses', () => {
    const mockReq = new Request('http://localhost:3000/api/test?page=2&limit=20');
    const searchParams = new URL(mockReq.url).searchParams;
    const pagination = parsePagination(searchParams);
    expect(pagination).toMatchObject({ page: 2, limit: 20, skip: 20 });

    const successResp = successResponse({ id: 1, name: 'Test' });
    expect(extractStatus(successResp)).toBe(200);

    const notFoundError = new NotFoundError('User', '1');
    const errorResp = errorResponse(notFoundError);
    expect(extractStatus(errorResp)).toBe(404);

    const createdResp = createdResponse({ id: 1 }, '/api/test/1');
    expect(extractStatus(createdResp)).toBe(201);

    const paginatedResp = paginatedResponse([{ id: 1 }, { id: 2 }], 1, 10, 50);
    expect(extractStatus(paginatedResp)).toBe(200);
  });

  it('validates data with shared schemas', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: commonSchemas.email,
    });

    const validData = validate({ name: 'John', email: 'john@example.com' }, testSchema);
    expect(validData.name).toBe('John');

    const invalidResult = safeValidate({ name: '', email: 'invalid' }, testSchema);
    expect(invalidResult.success).toBe(false);

    expect(safeValidate('test@example.com', commonSchemas.email).success).toBe(true);
    expect(safeValidate('Test123!@#', commonSchemas.password).success).toBe(true);
  });

  it('enforces rate limits and exposes helpers', async () => {
    const testLimiter = rateLimit({ windowMs: 60000, max: 1 });
    const testReq1 = new Request('http://localhost:3000/api/test');

    await expect(testLimiter(testReq1)).resolves.toBeUndefined();

    await expect(testLimiter(testReq1)).rejects.toBeInstanceOf(ApiError);

    const ip = getClientIp(testReq1);
    expect(ip).toBeDefined();
    expect(rateLimitPresets.strict).toBeDefined();
    expect(rateLimitPresets.moderate).toBeDefined();
  });

  it('creates structured loggers', () => {
    const testReq = new Request('http://localhost:3000/api/test');
    const log = apiLogger()(testReq);

    expect(typeof log.info).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.debug).toBe('function');

    expect(() => logger.info('Test info')).not.toThrow();
    expect(() => logger.debug('Test debug')).not.toThrow();
  });

  it('re-exports utilities from index', async () => {
    const apiIndex = await import('../index');
    const exports = [
      'ApiError',
      'ValidationError',
      'NotFoundError',
      'successResponse',
      'errorResponse',
      'validateBody',
      'rateLimit',
      'apiLogger',
    ];

    const allExported = exports.every((exp) => exp in apiIndex);
    expect(allExported).toBe(true);
  });
});

