import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getDashboardUrl } from "./lib/utils-shared";

// Define route access rules
// Routes are matched using startsWith, so "/dashboard" matches "/dashboard/*"
const routeAccessRules: Record<string, UserRole[]> = {
  "/dashboard": [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN],
  "/organizer": [UserRole.ORGANIZER, UserRole.ADMIN],
  "/admin": [UserRole.ADMIN],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/events",
  "/auth/login",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify-email",
  "/auth/verify-request",
  "/auth/reset-password",
  "/auth/forgot-password",
  "/auth/complete-profile",
  "/unauthorized",
  "/api/auth",
];

// API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth",
  "/api/health",
  "/api/events", // Public events listing
  "/api/contact", // Contact form
];

/**
 * Check if a path matches any of the public routes
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    // Exact match
    if (route === pathname) return true;
    // Route with parameters (e.g., /events/123)
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Check if a path matches any of the public API routes
 */
function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some((route) => {
    // Exact match
    if (route === pathname) return true;
    // Allow specific public API endpoints
    if (pathname.startsWith(route + "/")) {
      // Allow GET requests for event details (public)
      if (pathname.match(/^\/api\/events\/[^/]+$/)) return true;
    }
    return false;
  });
}

/**
 * Get the required role for a given path
 */
function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(routeAccessRules)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return roles;
    }
  }
  return null;
}

/**
 * Check if user has access to the route
 */
function hasAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".") // Files with extensions (e.g., .js, .css, .png)
  ) {
    return NextResponse.next();
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token, redirect to sign in
    if (!token) {
      const signInUrl = new URL("/auth/login", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user needs to complete profile (except for complete-profile page itself)
    if (
      token.profileCompleted === false &&
      pathname !== "/auth/complete-profile" &&
      !pathname.startsWith("/api/auth/complete-profile") &&
      !pathname.startsWith("/api/user/profile") // Allow profile API calls
    ) {
      const completeProfileUrl = new URL("/auth/complete-profile", request.url);
      return NextResponse.redirect(completeProfileUrl);
    }

    // Check if route requires specific roles
    const requiredRoles = getRequiredRoles(pathname);

    if (requiredRoles) {
      const userRole = token.role as UserRole;

      // Check if user has required role
      if (!hasAccess(userRole, requiredRoles)) {
        // Redirect to user's appropriate dashboard with error message
        const dashboardUrl = getDashboardUrl(userRole);
        const unauthorizedUrl = new URL(dashboardUrl, request.url);
        unauthorizedUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    // User is authenticated and authorized
    return NextResponse.next();
  } catch (error) {
    // Log error and redirect to error page
    console.error("Proxy error:", error);
    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", "Configuration");
    return NextResponse.redirect(errorUrl);
  }
}

// Configure which routes should run proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!monitoring|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
