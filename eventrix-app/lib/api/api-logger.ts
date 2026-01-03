/**
 * API Logger Middleware
 * 
 * Request and response logging for API routes.
 * Provides detailed logging with performance metrics and error tracking.
 */

import { getClientIp } from './rate-limiter';
import { isApiError } from './api-error';

/**
 * Log level enum
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  ip: string;
  userAgent?: string;
  userId?: string;
  requestId?: string;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Enable/disable logging
   */
  enabled?: boolean;
  /**
   * Minimum log level to output
   */
  level?: LogLevel;
  /**
   * Include request/response body in logs
   */
  includeBody?: boolean;
  /**
   * Include headers in logs
   */
  includeHeaders?: boolean;
  /**
   * Paths to exclude from logging (e.g., /health, /metrics)
   */
  excludePaths?: string[];
  /**
   * Custom logger function
   */
  logFn?: (entry: LogEntry) => void;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV !== 'test',
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  includeBody: process.env.NODE_ENV !== 'production',
  includeHeaders: false,
  excludePaths: ['/api/health', '/favicon.ico'],
};

/**
 * Check if path should be excluded from logging
 */
function shouldExclude(path: string, excludePaths: string[] = []): boolean {
  return excludePaths.some((excludePath) => path.startsWith(excludePath));
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, method, path, statusCode, duration, ip, error } = entry;

  const statusEmoji = statusCode
    ? statusCode < 300
      ? '✓'
      : statusCode < 400
      ? '↻'
      : statusCode < 500
      ? '⚠'
      : '✗'
    : '·';

  const colorCode =
    level === LogLevel.ERROR
      ? '\x1b[31m'
      : level === LogLevel.WARN
      ? '\x1b[33m'
      : level === LogLevel.INFO
      ? '\x1b[36m'
      : '\x1b[90m';

  const reset = '\x1b[0m';

  let logMessage = `${colorCode}[${timestamp}] ${statusEmoji} ${method} ${path}${reset}`;

  if (statusCode) {
    logMessage += ` ${colorCode}${statusCode}${reset}`;
  }

  if (duration) {
    logMessage += ` ${colorCode}${duration}ms${reset}`;
  }

  if (ip && ip !== 'unknown') {
    logMessage += ` ${colorCode}(${ip})${reset}`;
  }

  if (error) {
    logMessage += `\n${colorCode}  Error: ${error.message}${reset}`;
    if (error.code) {
      logMessage += `\n${colorCode}  Code: ${error.code}${reset}`;
    }
  }

  return logMessage;
}

/**
 * Default console logger
 */
function defaultLogFn(entry: LogEntry): void {
  const formatted = formatLogEntry(entry);

  switch (entry.level) {
    case LogLevel.ERROR:
      console.error(formatted);
      if (entry.error?.stack) {
        console.error(entry.error.stack);
      }
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
  }
}

/**
 * Create API logger middleware
 * 
 * @example
 * const logger = apiLogger({ level: LogLevel.INFO });
 * 
 * export async function GET(req: Request) {
 *   const log = logger(req);
 *   
 *   try {
 *     const data = await fetchData();
 *     const response = successResponse(data);
 *     log.success(response);
 *     return response;
 *   } catch (error) {
 *     log.error(error);
 *     throw error;
 *   }
 * }
 */
export function apiLogger(config: LoggerConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  const logFn = mergedConfig.logFn || defaultLogFn;

  return (req: Request, requestId?: string) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || undefined;

    // Skip if disabled or path excluded
    if (!mergedConfig.enabled || shouldExclude(path, mergedConfig.excludePaths)) {
      return {
        success: () => {},
        error: () => {},
        info: () => {},
        warn: () => {},
        debug: () => {},
      };
    }

    /**
     * Create base log entry
     */
    function createEntry(
      level: LogLevel,
      statusCode?: number,
      error?: unknown
    ): LogEntry {
      const duration = Date.now() - startTime;

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        method,
        path,
        ip,
        userAgent,
        requestId,
        duration,
      };

      if (statusCode) {
        entry.statusCode = statusCode;
      }

      if (error) {
        if (isApiError(error)) {
          entry.error = {
            message: error.message,
            code: error.code,
            stack: error.stack,
          };
        } else if (error instanceof Error) {
          entry.error = {
            message: error.message,
            stack: error.stack,
          };
        } else {
          entry.error = {
            message: String(error),
          };
        }
      }

      return entry;
    }

    /**
     * Log successful response
     */
    function success(response: Response): void {
      const entry = createEntry(LogLevel.INFO, response.status);
      logFn(entry);
    }

    /**
     * Log error response
     */
    function error(err: unknown, statusCode?: number): void {
      const entry = createEntry(LogLevel.ERROR, statusCode, err);
      logFn(entry);
    }

    /**
     * Log info message
     */
    function info(message: string, metadata?: Record<string, unknown>): void {
      const entry = createEntry(LogLevel.INFO);
      entry.metadata = { message, ...metadata };
      logFn(entry);
    }

    /**
     * Log warning message
     */
    function warn(message: string, metadata?: Record<string, unknown>): void {
      const entry = createEntry(LogLevel.WARN);
      entry.metadata = { message, ...metadata };
      logFn(entry);
    }

    /**
     * Log debug message
     */
    function debug(message: string, metadata?: Record<string, unknown>): void {
      if (mergedConfig.level === LogLevel.DEBUG) {
        const entry = createEntry(LogLevel.DEBUG);
        entry.metadata = { message, ...metadata };
        logFn(entry);
      }
    }

    // Log incoming request
    const entry = createEntry(LogLevel.DEBUG);
    entry.metadata = { type: 'request' };
    logFn(entry);

    return {
      success,
      error,
      info,
      warn,
      debug,
    };
  };
}

/**
 * Create a wrapped handler with automatic logging
 * 
 * @example
 * export const GET = withLogging(async (req, log) => {
 *   log.debug('Fetching users');
 *   const users = await getUsers();
 *   log.info(`Found ${users.length} users`);
 *   const response = successResponse(users);
 *   log.success(response);
 *   return response;
 * });
 */
export function withLogging(
  handler: (req: Request, log: ReturnType<ReturnType<typeof apiLogger>>, ...args: any[]) => Promise<any>,
  config?: LoggerConfig
) {
  const logger = apiLogger(config);

  return async (req: Request, ...args: any[]): Promise<any> => {
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    const log = logger(req, requestId);

    try {
      const response = await handler(req, log, ...args);
      log.success(response);
      return response;
    } catch (error) {
      log.error(error);
      throw error;
    }
  };
}

/**
 * Structured logger for non-request logging
 */
export const logger = {
  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      method: '',
      path: '',
      ip: '',
      metadata: { message, ...metadata },
    };
    defaultLogFn(entry);
  },

  /**
   * Log error message
   */
  error(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      method: '',
      path: '',
      ip: '',
      metadata: { message, ...metadata },
    };

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          message: error.message,
          stack: error.stack,
        };
      } else {
        entry.error = {
          message: String(error),
        };
      }
    }

    defaultLogFn(entry);
  },

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      method: '',
      path: '',
      ip: '',
      metadata: { message, ...metadata },
    };
    defaultLogFn(entry);
  },

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        method: '',
        path: '',
        ip: '',
        metadata: { message, ...metadata },
      };
      defaultLogFn(entry);
    }
  },
};
