/**
 * API Error Classes
 * 
 * Custom error classes for handling various API error scenarios.
 * Provides consistent error structure and HTTP status codes.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'METHOD_NOT_ALLOWED'
  | 'SERVICE_UNAVAILABLE'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_API_ERROR';

export interface ApiErrorDetails {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Base API Error class
 * All custom API errors extend this class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ApiErrorDetails[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: ApiErrorDetails[],
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }
}

/**
 * Validation Error (400)
 * Thrown when request validation fails
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: ApiErrorDetails[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication Error (401)
 * Thrown when user is not authenticated
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error (403)
 * Thrown when user lacks required permissions
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error (404)
 * Thrown when requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict Error (409)
 * Thrown when there's a conflict with existing data
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists', details?: ApiErrorDetails[]) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Rate Limit Error (429)
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
        retryAfter: this.retryAfter,
      },
    };
  }
}

/**
 * Bad Request Error (400)
 * Thrown when request is malformed or invalid
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', details?: ApiErrorDetails[]) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * Method Not Allowed Error (405)
 * Thrown when HTTP method is not supported
 */
export class MethodNotAllowedError extends ApiError {
  constructor(method: string, allowedMethods: string[] = []) {
    const message = allowedMethods.length
      ? `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
      : `Method ${method} not allowed`;
    super(message, 405, 'METHOD_NOT_ALLOWED');
  }
}

/**
 * Internal Server Error (500)
 * Thrown for unexpected server errors
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', isOperational = false) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', undefined, isOperational);
  }
}

/**
 * Service Unavailable Error (503)
 * Thrown when service is temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Database Error (500)
 * Thrown for database operation failures
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', isOperational = true) {
    super(message, 500, 'DATABASE_ERROR', undefined, isOperational);
  }
}

/**
 * External API Error (502)
 * Thrown when external API call fails
 */
export class ExternalApiError extends ApiError {
  constructor(service: string, message?: string) {
    const errorMessage = message || `Failed to communicate with ${service}`;
    super(errorMessage, 502, 'EXTERNAL_API_ERROR');
  }
}

/**
 * Check if error is an ApiError instance
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert unknown error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message, false);
  }

  return new InternalServerError('An unexpected error occurred', false);
}
