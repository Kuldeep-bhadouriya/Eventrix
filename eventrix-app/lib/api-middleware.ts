/**
 * API Middleware Utilities
 * 
 * Middleware functions for protecting and validating API routes
 * in Next.js App Router (Route Handlers)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@prisma/client";
import { checkPermission, hasAnyRole } from "./rbac";

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse["meta"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status: 200 }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return errorResponse(
    "Validation failed",
    422,
    "VALIDATION_ERROR",
    errors
  );
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(
  message: string = "Authentication required"
): NextResponse<ApiResponse> {
  return errorResponse(message, 401, "UNAUTHORIZED");
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(
  message: string = "Insufficient permissions"
): NextResponse<ApiResponse> {
  return errorResponse(message, 403, "FORBIDDEN");
}

/**
 * Create a not found response
 */
export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, 404, "NOT_FOUND");
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(
  message: string = "Internal server error"
): NextResponse<ApiResponse> {
  return errorResponse(message, 500, "INTERNAL_SERVER_ERROR");
}

/**
 * Get the current authenticated session or return an error response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const sessionOrError = await getAuthSession();
 *   
 *   if (sessionOrError instanceof NextResponse) {
 *     return sessionOrError; // Return error response
 *   }
 *   
 *   const { user } = sessionOrError;
 *   // Use user data...
 * }
 * ```
 */
export async function getAuthSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return unauthorizedResponse();
  }

  return session;
}

/**
 * Middleware to require authentication for API routes
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const session = await requireAuth(request);
 *   
 *   if (session instanceof NextResponse) {
 *     return session; // Return error response
 *   }
 *   
 *   // User is authenticated
 *   return successResponse({ message: "Success" });
 * }
 * ```
 */
export async function requireAuth(request?: NextRequest) {
  return await getAuthSession();
}

/**
 * Middleware to require a specific role for API routes
 * 
 * @param requiredRole - The minimum required role
 * @returns Session if authorized, error response otherwise
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const session = await requireRole(UserRole.ORGANIZER);
 *   
 *   if (session instanceof NextResponse) {
 *     return session; // Return error response
 *   }
 *   
 *   // User has ORGANIZER or ADMIN role
 *   return successResponse({ message: "Success" });
 * }
 * ```
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await getAuthSession();

  if (session instanceof NextResponse) {
    return session;
  }

  const hasPermission = checkPermission(session.user.role, requiredRole);

  if (!hasPermission) {
    return forbiddenResponse(
      `This action requires ${requiredRole} role or higher`
    );
  }

  return session;
}

/**
 * Middleware to require any of the specified roles for API routes
 * 
 * @param allowedRoles - Array of acceptable roles
 * @returns Session if authorized, error response otherwise
 * 
 * @example
 * ```typescript
 * export async function DELETE(request: NextRequest) {
 *   const session = await requireAnyRole([UserRole.ORGANIZER, UserRole.ADMIN]);
 *   
 *   if (session instanceof NextResponse) {
 *     return session;
 *   }
 *   
 *   // User has ORGANIZER or ADMIN role
 *   return successResponse({ message: "Deleted" });
 * }
 * ```
 */
export async function requireAnyRole(allowedRoles: UserRole[]) {
  const session = await getAuthSession();

  if (session instanceof NextResponse) {
    return session;
  }

  const hasPermission = hasAnyRole(session.user.role, allowedRoles);

  if (!hasPermission) {
    return forbiddenResponse(
      `This action requires one of the following roles: ${allowedRoles.join(", ")}`
    );
  }

  return session;
}

/**
 * Middleware to check if the user is an admin
 * 
 * @example
 * ```typescript
 * export async function DELETE(request: NextRequest) {
 *   const session = await requireAdmin();
 *   
 *   if (session instanceof NextResponse) {
 *     return session;
 *   }
 *   
 *   // User is admin
 *   return successResponse({ message: "Admin action completed" });
 * }
 * ```
 */
export async function requireAdmin() {
  return await requireRole(UserRole.ADMIN);
}

/**
 * Middleware to check if the user is an organizer or admin
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const session = await requireOrganizer();
 *   
 *   if (session instanceof NextResponse) {
 *     return session;
 *   }
 *   
 *   // User is organizer or admin
 *   return successResponse({ message: "Event created" });
 * }
 * ```
 */
export async function requireOrganizer() {
  return await requireRole(UserRole.ORGANIZER);
}

/**
 * Higher-order function to wrap API route handlers with authentication
 * 
 * @param handler - The API route handler function
 * @param requiredRole - Optional minimum required role
 * @returns Wrapped handler with authentication
 * 
 * @example
 * ```typescript
 * export const GET = withAuthApi(async (request, session) => {
 *   // session is guaranteed to exist
 *   return successResponse({ user: session.user });
 * });
 * 
 * // With role requirement
 * export const POST = withAuthApi(
 *   async (request, session) => {
 *     // User has ORGANIZER role or higher
 *     return successResponse({ message: "Created" });
 *   },
 *   UserRole.ORGANIZER
 * );
 * ```
 */
export function withAuthApi(
  handler: (
    request: NextRequest,
    session: Awaited<ReturnType<typeof getAuthSession>>
  ) => Promise<NextResponse>,
  requiredRole?: UserRole
) {
  return async (request: NextRequest) => {
    try {
      // Check authentication
      const session = requiredRole
        ? await requireRole(requiredRole)
        : await requireAuth(request);

      // If session is a NextResponse, it's an error response
      if (session instanceof NextResponse) {
        return session;
      }

      // Call the handler with the session
      return await handler(request, session);
    } catch (error) {
      console.error("API Error:", error);
      return serverErrorResponse(
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  };
}

/**
 * Higher-order function to wrap API handlers with role-based authorization
 * 
 * @param handler - The API route handler function
 * @param allowedRoles - Array of roles allowed to access the route
 * @returns Wrapped handler with authorization
 * 
 * @example
 * ```typescript
 * export const DELETE = withRoles(
 *   async (request, session) => {
 *     return successResponse({ message: "Deleted" });
 *   },
 *   [UserRole.ORGANIZER, UserRole.ADMIN]
 * );
 * ```
 */
export function withRoles(
  handler: (
    request: NextRequest,
    session: Awaited<ReturnType<typeof getAuthSession>>
  ) => Promise<NextResponse>,
  allowedRoles: UserRole[]
) {
  return async (request: NextRequest) => {
    try {
      // Check authentication and authorization
      const session = await requireAnyRole(allowedRoles);

      // If session is a NextResponse, it's an error response
      if (session instanceof NextResponse) {
        return session;
      }

      // Call the handler with the session
      return await handler(request, session);
    } catch (error) {
      console.error("API Error:", error);
      return serverErrorResponse(
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  };
}

/**
 * Validate HTTP method for an API route
 * 
 * @param request - The NextRequest object
 * @param allowedMethods - Array of allowed HTTP methods
 * @returns null if valid, error response if invalid
 * 
 * @example
 * ```typescript
 * export async function handler(request: NextRequest) {
 *   const methodError = validateMethod(request, ["GET", "POST"]);
 *   if (methodError) return methodError;
 *   
 *   // Method is valid...
 * }
 * ```
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: `Method ${request.method} not allowed`,
          code: "METHOD_NOT_ALLOWED",
        },
      },
      {
        status: 405,
        headers: {
          Allow: allowedMethods.join(", "),
        },
      }
    );
  }

  return null;
}

/**
 * Parse and validate JSON body from request
 * 
 * @param request - The NextRequest object
 * @returns Parsed body or error response
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const body = await parseBody(request);
 *   
 *   if (body instanceof NextResponse) {
 *     return body; // Return error response
 *   }
 *   
 *   // Use body...
 * }
 * ```
 */
export async function parseBody<T = any>(
  request: NextRequest
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    return errorResponse("Invalid JSON body", 400, "INVALID_JSON");
  }
}

/**
 * Get pagination parameters from request URL
 * 
 * @param request - The NextRequest object
 * @param defaultLimit - Default items per page (default: 10)
 * @returns Pagination parameters
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { page, limit, skip } = getPagination(request);
 *   
 *   const items = await prisma.event.findMany({
 *     skip,
 *     take: limit,
 *   });
 *   
 *   return successResponse(items, { page, limit, total: count });
 * }
 * ```
 */
export function getPagination(request: NextRequest, defaultLimit: number = 10) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || String(defaultLimit), 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Handle API errors and convert them to appropriate responses
 * 
 * @param error - The error object
 * @returns Error response
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   try {
 *     // API logic...
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === "PrismaClientKnownRequestError") {
      return errorResponse(
        "Database error occurred",
        500,
        "DATABASE_ERROR"
      );
    }

    if (error.message.includes("validation")) {
      return validationErrorResponse({ error: [error.message] });
    }

    return serverErrorResponse(error.message);
  }

  return serverErrorResponse();
}
