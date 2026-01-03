/**
 * Health Check API Endpoint
 * 
 * Provides system health status including database connectivity,
 * memory usage, and uptime information.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/api-response';
import { getRateLimitStoreSize } from '@/lib/api/rate-limiter';

/**
 * Health status enum
 */
enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Health check response
 */
interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: CheckResult;
    memory: CheckResult;
    rateLimit: CheckResult;
  };
  info?: {
    nodeVersion: string;
    platform: string;
    environment: string;
  };
}

/**
 * Individual check result
 */
interface CheckResult {
  status: HealthStatus;
  message?: string;
  details?: Record<string, unknown>;
  responseTime?: number;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    // Check if response time is acceptable
    if (responseTime > 1000) {
      return {
        status: HealthStatus.DEGRADED,
        message: 'Database responding slowly',
        responseTime,
        details: {
          threshold: '1000ms',
          actual: `${responseTime}ms`,
        },
      };
    }

    return {
      status: HealthStatus.HEALTHY,
      message: 'Database connection successful',
      responseTime,
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: 'Database connection failed',
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): CheckResult {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);

  // Calculate heap usage percentage
  const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  // Thresholds
  const degradedThreshold = 80; // 80% heap usage
  const unhealthyThreshold = 95; // 95% heap usage

  let status = HealthStatus.HEALTHY;
  let message = 'Memory usage normal';

  if (heapUsagePercent >= unhealthyThreshold) {
    status = HealthStatus.UNHEALTHY;
    message = 'Critical memory usage';
  } else if (heapUsagePercent >= degradedThreshold) {
    status = HealthStatus.DEGRADED;
    message = 'High memory usage';
  }

  return {
    status,
    message,
    details: {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      heapUsagePercent: `${heapUsagePercent.toFixed(2)}%`,
      rss: `${rssMB}MB`,
    },
  };
}

/**
 * Check rate limit store
 */
function checkRateLimit(): CheckResult {
  try {
    const storeSize = getRateLimitStoreSize();

    // Threshold for large store (may indicate memory issues)
    const threshold = 10000;

    if (storeSize > threshold) {
      return {
        status: HealthStatus.DEGRADED,
        message: 'Rate limit store is large',
        details: {
          size: storeSize,
          threshold,
        },
      };
    }

    return {
      status: HealthStatus.HEALTHY,
      message: 'Rate limiter operational',
      details: {
        size: storeSize,
      },
    };
  } catch (error) {
    return {
      status: HealthStatus.DEGRADED,
      message: 'Could not check rate limiter',
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Determine overall health status
 */
function getOverallStatus(checks: HealthCheckResponse['checks']): HealthStatus {
  const statuses = Object.values(checks).map((check) => check.status);

  if (statuses.includes(HealthStatus.UNHEALTHY)) {
    return HealthStatus.UNHEALTHY;
  }

  if (statuses.includes(HealthStatus.DEGRADED)) {
    return HealthStatus.DEGRADED;
  }

  return HealthStatus.HEALTHY;
}

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    // Run all checks in parallel
    const [databaseCheck, memoryCheck, rateLimitCheck] = await Promise.all([
      checkDatabase(),
      checkMemory(),
      Promise.resolve(checkRateLimit()),
    ]);

    const checks = {
      database: databaseCheck,
      memory: memoryCheck,
      rateLimit: rateLimitCheck,
    };

    const overallStatus = getOverallStatus(checks);

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      info: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development',
      },
    };

    // Set appropriate HTTP status code
    const statusCode =
      overallStatus === HealthStatus.HEALTHY
        ? 200
        : overallStatus === HealthStatus.DEGRADED
        ? 200 // Still return 200 for degraded but indicate in response
        : 503; // Service unavailable for unhealthy

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('[Health Check Error]', error);

    return errorResponse(
      new Error('Health check failed: ' + (error instanceof Error ? error.message : String(error)))
    );
  }
}

/**
 * HEAD /api/health
 * Lightweight health check (no response body)
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
