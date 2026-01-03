/**
 * API Validator Utilities
 * 
 * Request validation helpers using Zod schemas.
 * Provides consistent validation error formatting.
 */

import { ZodSchema, ZodError, z } from 'zod';
import { ValidationError, BadRequestError } from './api-error';
import type { ApiErrorDetails } from './api-error';

/**
 * Validate request body against Zod schema
 * 
 * @example
 * const schema = z.object({ name: z.string(), email: z.string().email() });
 * const data = await validateBody(req, schema);
 */
export async function validateBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Request body validation failed', formatZodErrors(error));
    }
    throw new BadRequestError('Invalid request body');
  }
}

/**
 * Validate query parameters against Zod schema
 * 
 * @example
 * const schema = z.object({ page: z.coerce.number().min(1), limit: z.coerce.number().max(100) });
 * const params = validateQuery(req, schema);
 */
export function validateQuery<T>(
  req: Request,
  schema: ZodSchema<T>
): T {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Query parameters validation failed', formatZodErrors(error));
    }
    throw new BadRequestError('Invalid query parameters');
  }
}

/**
 * Validate route parameters against Zod schema
 * 
 * @example
 * const schema = z.object({ id: z.string().uuid() });
 * const params = validateParams({ id: '123' }, schema);
 */
export function validateParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Route parameters validation failed', formatZodErrors(error));
    }
    throw new BadRequestError('Invalid route parameters');
  }
}

/**
 * Validate data against Zod schema (generic)
 * 
 * @example
 * const schema = z.object({ userId: z.number() });
 * const data = validate({ userId: 123 }, schema);
 */
export function validate<T>(
  data: unknown,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', formatZodErrors(error));
    }
    throw new BadRequestError('Invalid data');
  }
}

/**
 * Safely validate data without throwing errors
 * Returns result object with success flag
 * 
 * @example
 * const result = safeValidate(data, schema);
 * if (!result.success) {
 *   return errorResponse(new ValidationError('Invalid data', result.errors));
 * }
 */
export function safeValidate<T>(
  data: unknown,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; errors: ApiErrorDetails[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    return {
      success: false,
      errors: [{ message: 'Validation failed' }],
    };
  }
}

/**
 * Format Zod errors into standardized error details
 */
export function formatZodErrors(error: ZodError): ApiErrorDetails[] {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  /**
   * Pagination query parameters
   */
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),

  /**
   * Search query parameter
   */
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    search: z.string().min(1).max(100).optional(),
  }),

  /**
   * Date range query parameters
   */
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),

  /**
   * Sort query parameters
   */
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    orderBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),

  /**
   * UUID parameter
   */
  uuid: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  /**
   * Numeric ID parameter
   */
  numericId: z.object({
    id: z.coerce.number().int().positive('Invalid ID'),
  }),

  /**
   * Email validation
   */
  email: z.string().email('Invalid email address').toLowerCase(),

  /**
   * Password validation (min 8 chars, uppercase, lowercase, number, special char)
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  /**
   * Strong password validation (alternative)
   */
  strongPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letters')
    .regex(/[a-z]/, 'Password must contain lowercase letters')
    .regex(/[0-9]/, 'Password must contain numbers')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),

  /**
   * URL validation
   */
  url: z.string().url('Invalid URL format'),

  /**
   * Phone number validation (basic)
   */
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  /**
   * Date validation (ISO 8601)
   */
  isoDate: z.string().datetime('Invalid date format (ISO 8601 required)'),

  /**
   * Boolean query parameter
   */
  booleanQuery: z
    .enum(['true', 'false', '1', '0', 'yes', 'no'])
    .transform((val) => val === 'true' || val === '1' || val === 'yes'),
};

/**
 * Create a validation middleware wrapper
 * 
 * @example
 * const validateCreateUser = withValidation(createUserSchema);
 * export const POST = validateCreateUser(async (req, validData) => {
 *   const user = await createUser(validData);
 *   return successResponse(user);
 * });
 */
export function withValidation<T>(schema: ZodSchema<T>) {
  return function (
    handler: (req: Request, validatedData: T, ...args: any[]) => Promise<Response>
  ) {
    return async (req: Request, ...args: any[]): Promise<Response> => {
      const validatedData = await validateBody(req, schema);
      return handler(req, validatedData, ...args);
    };
  };
}

/**
 * Create a query validation middleware wrapper
 * 
 * @example
 * const validateListParams = withQueryValidation(commonSchemas.pagination);
 * export const GET = validateListParams(async (req, validParams) => {
 *   const users = await getUsers(validParams);
 *   return successResponse(users);
 * });
 */
export function withQueryValidation<T>(schema: ZodSchema<T>) {
  return function (
    handler: (req: Request, validatedQuery: T, ...args: any[]) => Promise<Response>
  ) {
    return async (req: Request, ...args: any[]): Promise<Response> => {
      const validatedQuery = validateQuery(req, schema);
      return handler(req, validatedQuery, ...args);
    };
  };
}

/**
 * Merge multiple validation schemas
 * 
 * @example
 * const listSchema = mergeSchemas(commonSchemas.pagination, commonSchemas.search);
 */
export function mergeSchemas<T extends ZodSchema, U extends ZodSchema>(
  schema1: T,
  schema2: U
): z.ZodIntersection<T, U> {
  return z.intersection(schema1, schema2);
}

/**
 * Create partial schema (all fields optional)
 * 
 * @example
 * const updateUserSchema = partialSchema(createUserSchema);
 */
export function partialSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  return schema.partial();
}

/**
 * Sanitize string input (trim, remove special chars, etc.)
 */
export const sanitize = {
  /**
   * Trim whitespace
   */
  trim: z.string().transform((val) => val.trim()),

  /**
   * Lowercase string
   */
  lowercase: z.string().transform((val) => val.toLowerCase()),

  /**
   * Uppercase string
   */
  uppercase: z.string().transform((val) => val.toUpperCase()),

  /**
   * Remove extra whitespace
   */
  normalizeWhitespace: z.string().transform((val) => val.replace(/\s+/g, ' ').trim()),

  /**
   * Remove HTML tags
   */
  stripHtml: z.string().transform((val) => val.replace(/<[^>]*>/g, '')),

  /**
   * Remove non-alphanumeric characters
   */
  alphanumeric: z.string().transform((val) => val.replace(/[^a-zA-Z0-9]/g, '')),
};
