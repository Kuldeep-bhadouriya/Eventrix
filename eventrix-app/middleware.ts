import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

// Define route access rules
const routeAccessRules: Record<string, UserRole[]> = {
  "/dashboard": [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN],
  "/organizer": [UserRole.ORGANIZER, UserRole.ADMIN],
  "/admin": [UserRole.ADMIN],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify-email",
  "/auth/verify-request",
  "/auth/reset-password",
  "/auth/complete-profile",
  "/api/auth",
];

// API routes that don't require authentication
const publicApiRoutes = ["/api/auth", "/api/health"];

/**
 * Check if a path matches any of the public routes
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Check if a path matches any of the public API routes
 */
function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(pathname) || isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Files with extensions
  ) {
    return NextResponse.next();
  }

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
    !pathname.startsWith("/api/auth/complete-profile")
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
      // Redirect based on user's role
      let redirectPath = "/dashboard";
      if (userRole === UserRole.ORGANIZER) {
        redirectPath = "/organizer/dashboard";
      } else if (userRole === UserRole.ADMIN) {
        redirectPath = "/admin/dashboard";
      }

      // If user is trying to access unauthorized route, redirect to their dashboard
      const unauthorizedUrl = new URL(redirectPath, request.url);
      unauthorizedUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // User is authenticated and authorized
  return NextResponse.next();
}

// Configure which routes should run middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
