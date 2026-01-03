/**
 * API Utilities Index
 * 
 * Central export point for all API utilities
 */

// Error classes and utilities
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  MethodNotAllowedError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalApiError,
  isApiError,
  isOperationalError,
  toApiError,
  type ErrorCode,
  type ApiErrorDetails,
} from './api-error';

// Response utilities
export {
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
  handleApiError,
  parsePagination,
  createPaginationLinks,
  formatPaginationHeaders,
  parseRequestBody,
  getRequestId,
  checkMethod,
  type ApiResponse,
  type PaginationMeta,
} from './api-response';

// Validation utilities
export {
  validateBody,
  validateQuery,
  validateParams,
  validate,
  safeValidate,
  formatZodErrors,
  commonSchemas,
  withValidation,
  withQueryValidation,
  mergeSchemas,
  partialSchema,
  sanitize,
} from './api-validator';

// Rate limiting
export {
  rateLimit,
  rateLimitPresets,
  userRateLimit,
  resetRateLimit,
  clearRateLimits,
  getRateLimitStoreSize,
  combineRateLimits,
  slidingWindowRateLimit,
  getClientIp,
  rateLimitStore,
  type RateLimitConfig,
} from './rate-limiter';

// Logging
export {
  apiLogger,
  withLogging,
  logger,
  LogLevel,
  type LogEntry,
  type LoggerConfig,
} from './api-logger';
