/**
 * Rate Limiter Middleware
 * 
 * Implements rate limiting for API routes using in-memory store.
 * Supports IP-based and user-based rate limiting with configurable windows.
 * 
 * For production, consider using Redis for distributed rate limiting.
 */

import { RateLimitError } from './api-error';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Time window in seconds
   */
  windowMs: number;
  /**
   * Maximum requests per window
   */
  max: number;
  /**
   * Message shown when limit exceeded
   */
  message?: string;
  /**
   * Skip rate limiting for specific conditions
   */
  skip?: (req: Request) => boolean | Promise<boolean>;
  /**
   * Custom key generator (default: IP address)
   */
  keyGenerator?: (req: Request) => string | Promise<string>;
}

/**
 * Rate limit store entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 * In production, replace with Redis or similar distributed cache
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get current count for a key
   */
  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && entry.resetTime > Date.now()) {
      return entry;
    }
    // Entry expired
    this.store.delete(key);
    return undefined;
  }

  /**
   * Increment count for a key
   */
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const entry = this.get(key);

    if (entry) {
      entry.count++;
      this.store.set(key, entry);
      return entry;
    }

    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    this.store.set(key, newEntry);
    return newEntry;
  }

  /**
   * Reset count for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get store size (for monitoring)
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup interval (call on shutdown)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global store instance
const globalStore = new RateLimitStore();

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  // Check various headers for IP address
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to 'unknown' if no IP found
  return 'unknown';
}

/**
 * Default key generator using IP address
 */
async function defaultKeyGenerator(req: Request): Promise<string> {
  const ip = getClientIp(req);
  const url = new URL(req.url);
  return `${ip}:${url.pathname}`;
}

/**
 * Create a rate limiter middleware
 * 
 * @example
 * // Limit to 100 requests per 15 minutes
 * const limiter = rateLimit({
 *   windowMs: 15 * 60 * 1000,
 *   max: 100,
 * });
 * 
 * export async function GET(req: Request) {
 *   await limiter(req);
 *   // Your handler code
 * }
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    skip,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (req: Request): Promise<void> => {
    // Check if should skip rate limiting
    if (skip && (await skip(req))) {
      return;
    }

    // Generate key for this request
    const key = await keyGenerator(req);

    // Get or increment count
    const entry = globalStore.increment(key, windowMs);

    // Check if limit exceeded
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      throw new RateLimitError(message, retryAfter);
    }
  };
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimitPresets = {
  /**
   * Strict rate limit (10 requests per minute)
   * Use for sensitive operations like login, signup
   */
  strict: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many attempts, please try again in a minute',
  }),

  /**
   * Moderate rate limit (100 requests per 15 minutes)
   * Use for general API endpoints
   */
  moderate: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  }),

  /**
   * Generous rate limit (1000 requests per hour)
   * Use for public read endpoints
   */
  generous: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
  }),

  /**
   * Authentication rate limit (5 attempts per 15 minutes)
   * Use for login, password reset
   */
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later',
  }),

  /**
   * API key rate limit (10,000 requests per hour)
   * Use for authenticated API endpoints
   */
  api: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000,
  }),
};

/**
 * User-based rate limiter (requires user ID)
 * 
 * @example
 * const limiter = userRateLimit(100, 15 * 60 * 1000);
 * await limiter(req, userId);
 */
export function userRateLimit(max: number, windowMs: number) {
  return async (req: Request, userId: string): Promise<void> => {
    const url = new URL(req.url);
    const key = `user:${userId}:${url.pathname}`;

    const entry = globalStore.increment(key, windowMs);

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      throw new RateLimitError('User rate limit exceeded', retryAfter);
    }
  };
}

/**
 * Reset rate limit for a specific key
 * Useful for testing or manual intervention
 */
export function resetRateLimit(key: string): void {
  globalStore.reset(key);
}

/**
 * Clear all rate limit entries
 * Useful for testing
 */
export function clearRateLimits(): void {
  globalStore.clear();
}

/**
 * Get rate limit store size
 * Useful for monitoring
 */
export function getRateLimitStoreSize(): number {
  return globalStore.size;
}

/**
 * Create a combined rate limiter with multiple limits
 * 
 * @example
 * // 5 per minute AND 100 per hour
 * const limiter = combineRateLimits([
 *   rateLimit({ windowMs: 60_000, max: 5 }),
 *   rateLimit({ windowMs: 3600_000, max: 100 }),
 * ]);
 */
export function combineRateLimits(
  limiters: Array<(req: Request) => Promise<void>>
) {
  return async (req: Request): Promise<void> => {
    for (const limiter of limiters) {
      await limiter(req);
    }
  };
}

/**
 * Create a rate limiter with sliding window
 * More accurate than fixed window but uses more memory
 */
class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private max: number;

  constructor(windowMs: number, max: number) {
    this.windowMs = windowMs;
    this.max = max;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async limit(key: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request timestamps for this key
    let timestamps = this.requests.get(key) || [];

    // Remove timestamps outside the window
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= this.max) {
      const oldestTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);
      throw new RateLimitError('Rate limit exceeded', retryAfter);
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(key, timestamps);
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((ts) => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  clear(): void {
    this.requests.clear();
  }
}

/**
 * Create sliding window rate limiter
 * 
 * @example
 * const limiter = slidingWindowRateLimit(100, 15 * 60 * 1000);
 */
export function slidingWindowRateLimit(max: number, windowMs: number) {
  const limiter = new SlidingWindowRateLimiter(windowMs, max);

  return async (req: Request): Promise<void> => {
    const key = await defaultKeyGenerator(req);
    await limiter.limit(key);
  };
}

/**
 * Export store for advanced use cases
 */
export { globalStore as rateLimitStore };
