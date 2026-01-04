/**
 * Authentication Hooks
 * 
 * Custom React hooks for managing authentication state and user roles
 * in client components.
 */

"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { UserRole } from "@prisma/client";
import { 
  getDashboardUrl, 
  checkPermissionClient
} from "@/lib/utils-shared";

/**
 * Hook to get the current authenticated user session
 * 
 * @returns Object containing user session, loading state, and authentication status
 * 
 * @example
 * ```typescript
 * function ProfileCard() {
 *   const { user, isLoading, isAuthenticated } = useAuth();
 * 
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <LoginPrompt />;
 * 
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return {
    user: session?.user,
    session,
    isLoading,
    isAuthenticated,
    isUnauthenticated: status === "unauthenticated",
  };
}

/**
 * Hook to get the current user's role
 * 
 * @returns The user's role or undefined if not authenticated
 * 
 * @example
 * ```typescript
 * function RoleBasedComponent() {
 *   const role = useRole();
 * 
 *   if (role === UserRole.ADMIN) {
 *     return <AdminPanel />;
 *   }
 *   return <UserPanel />;
 * }
 * ```
 */
export function useRole(): UserRole | undefined {
  const { user } = useAuth();
  return user?.role;
}

/**
 * Hook to check if the current user has a specific role
 * 
 * @param requiredRole - The role to check for
 * @returns true if the user has the required role
 * 
 * @example
 * ```typescript
 * function OrganizerFeature() {
 *   const isOrganizer = useHasRole(UserRole.ORGANIZER);
 * 
 *   if (!isOrganizer) {
 *     return <AccessDenied />;
 *   }
 *   return <OrganizerDashboard />;
 * }
 * ```
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const role = useRole();
  return role === requiredRole;
}

/**
 * Hook to check if the current user has any of the specified roles
 * 
 * @param roles - Array of acceptable roles
 * @returns true if the user has any of the specified roles
 * 
 * @example
 * ```typescript
 * function AdminOrOrganizerPanel() {
 *   const hasAccess = useHasAnyRole([UserRole.ADMIN, UserRole.ORGANIZER]);
 * 
 *   if (!hasAccess) return null;
 *   return <ManagementPanel />;
 * }
 * ```
 */
export function useHasAnyRole(roles: UserRole[]): boolean {
  const role = useRole();
  return role ? roles.includes(role) : false;
}

/**
 * Hook to check if the current user has permission based on role hierarchy
 * ADMIN > ORGANIZER > STUDENT
 * 
 * @param requiredRole - The minimum required role
 * @returns true if the user's role is equal to or higher than the required role
 * 
 * @example
 * ```typescript
 * function ProtectedComponent() {
 *   const hasPermission = useHasPermission(UserRole.ORGANIZER);
 *   // Returns true for ORGANIZER and ADMIN, false for STUDENT
 * 
 *   if (!hasPermission) return <Forbidden />;
 *   return <ProtectedContent />;
 * }
 * ```
 */
export function useHasPermission(requiredRole: UserRole): boolean {
  const role = useRole();

  if (!role) return false;

  return checkPermissionClient(role, requiredRole);
}

/**
 * Hook to require authentication and optionally a specific role
 * Redirects to login or appropriate dashboard if unauthorized
 * 
 * @param requiredRole - The minimum required role (optional)
 * @param options - Additional options for redirection
 * @returns Object containing user session and loading state
 * 
 * @example
 * ```typescript
 * function OrganizerPage() {
 *   const { user, isLoading } = useRequireAuth(UserRole.ORGANIZER);
 * 
 *   if (isLoading) return <LoadingSpinner />;
 * 
 *   // User is authenticated and has ORGANIZER or ADMIN role
 *   return <OrganizerDashboard user={user} />;
 * }
 * 
 * // Or require authentication without specific role
 * function ProfilePage() {
 *   const { user, isLoading } = useRequireAuth();
 * 
 *   if (isLoading) return <LoadingSpinner />;
 * 
 *   return <Profile user={user} />;
 * }
 * ```
 */
export function useRequireAuth(
  requiredRole?: UserRole,
  options?: {
    redirectTo?: string;
    allowedRoles?: UserRole[];
  }
) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(
        pathname || options?.redirectTo || "/"
      )}`;
      router.push(loginUrl);
      return;
    }

    // If authenticated but no user data, something went wrong
    if (!user) {
      router.push("/auth/error");
      return;
    }

    // Check specific role requirement
    if (requiredRole) {
      const hasPermission = checkPermissionClient(user.role, requiredRole);

      if (!hasPermission) {
        // Redirect to user's appropriate dashboard
        const dashboardUrl = getDashboardUrl(user.role);
        router.push(`${dashboardUrl}?error=unauthorized`);
        return;
      }
    }

    // Check allowed roles if specified
    if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
      const dashboardUrl = getDashboardUrl(user.role);
      router.push(`${dashboardUrl}?error=unauthorized`);
      return;
    }
  }, [isLoading, isAuthenticated, user, requiredRole, options, router, pathname]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Hook to protect a component and redirect unauthorized users
 * Similar to useRequireAuth but specifically designed for route protection
 * 
 * @param allowedRoles - Array of roles that can access the component
 * @returns Object containing authorization status and user data
 * 
 * @example
 * ```typescript
 * function AdminPanel() {
 *   const { isAuthorized, isLoading, user } = useAuthorization([UserRole.ADMIN]);
 * 
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!isAuthorized) return null; // Will redirect automatically
 * 
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useAuthorization(allowedRoles: UserRole[]) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return allowedRoles.includes(user.role);
  }, [isAuthenticated, user, allowedRoles]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;
      router.push(loginUrl);
      return;
    }

    if (!isAuthorized && user) {
      const dashboardUrl = getDashboardUrl(user.role);
      router.push(`${dashboardUrl}?error=unauthorized`);
    }
  }, [isLoading, isAuthenticated, isAuthorized, user, router, pathname]);

  return {
    isAuthorized,
    isLoading,
    user,
  };
}

/**
 * Hook to get user profile completion status
 * 
 * @returns true if the user has completed their profile
 * 
 * @example
 * ```typescript
 * function Dashboard() {
 *   const isProfileComplete = useProfileCompleted();
 * 
 *   if (!isProfileComplete) {
 *     return <CompleteProfileBanner />;
 *   }
 *   return <DashboardContent />;
 * }
 * ```
 */
export function useProfileCompleted(): boolean {
  const { user } = useAuth();
  return user?.profileCompleted || false;
}

/**
 * Hook to check if the current user is an admin
 * 
 * @returns true if the user is an admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(UserRole.ADMIN);
}

/**
 * Hook to check if the current user is an organizer
 * 
 * @returns true if the user is an organizer
 */
export function useIsOrganizer(): boolean {
  return useHasRole(UserRole.ORGANIZER);
}

/**
 * Hook to check if the current user is a student
 * 
 * @returns true if the user is a student
 */
export function useIsStudent(): boolean {
  return useHasRole(UserRole.STUDENT);
}
