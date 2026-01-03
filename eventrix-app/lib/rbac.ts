/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * This module provides utilities for implementing role-based access control
 * in the Eventrix application, including permission checking and route protection.
 * 
 * NOTE: This file contains server-side utilities and should NOT be imported 
 * in client components. Use hooks from /hooks/use-auth.ts for client components.
 */

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Session } from "next-auth";
import { ReactElement } from "react";
import { getDashboardUrl as getSharedDashboardUrl } from "./utils-shared";

/**
 * Role hierarchy for permission checking
 * Higher index = more permissions
 */
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.STUDENT,
  UserRole.ORGANIZER,
  UserRole.ADMIN,
];

/**
 * Get the hierarchy level of a role
 */
function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if a user has permission to access a resource
 * 
 * @param userRole - The role of the current user
 * @param requiredRole - The minimum required role to access the resource
 * @returns true if the user has permission, false otherwise
 * 
 * @example
 * ```typescript
 * // Check if a student can access organizer dashboard
 * const canAccess = checkPermission(UserRole.STUDENT, UserRole.ORGANIZER); // false
 * 
 * // Check if an admin can access student dashboard
 * const canAccess = checkPermission(UserRole.ADMIN, UserRole.STUDENT); // true
 * ```
 */
export function checkPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);

  // User has permission if their role level is greater than or equal to required level
  return userLevel >= requiredLevel;
}

/**
 * Check if a user has any of the required roles
 * 
 * @param userRole - The role of the current user
 * @param requiredRoles - Array of acceptable roles
 * @returns true if the user has any of the required roles
 */
export function hasAnyRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if a user has all of the required roles
 * Note: In this system, users can only have one role at a time
 * 
 * @param userRole - The role of the current user
 * @param requiredRoles - Array of required roles
 * @returns true if the user has all required roles
 */
export function hasAllRoles(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  // Since users can only have one role, this checks if user's role is in the array
  return requiredRoles.length === 1 && requiredRoles.includes(userRole);
}

/**
 * Redirect unauthorized users to an appropriate page based on their role
 * 
 * @param userRole - The role of the current user (undefined if not authenticated)
 * @param callbackUrl - The URL the user was trying to access
 * 
 * @example
 * ```typescript
 * // Redirect unauthenticated user to login
 * redirectUnauthorized(undefined, '/admin/dashboard');
 * 
 * // Redirect student trying to access organizer dashboard
 * redirectUnauthorized(UserRole.STUDENT, '/organizer/dashboard');
 * ```
 */
export function redirectUnauthorized(
  userRole?: UserRole,
  callbackUrl?: string
): never {
  // If user is not authenticated, redirect to login
  if (!userRole) {
    const loginUrl = callbackUrl
      ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/login";
    redirect(loginUrl);
  }

  // If user is authenticated but doesn't have permission, redirect to their dashboard
  let dashboardUrl = "/dashboard";
  switch (userRole) {
    case UserRole.STUDENT:
      dashboardUrl = "/dashboard";
      break;
    case UserRole.ORGANIZER:
      dashboardUrl = "/organizer/dashboard";
      break;
    case UserRole.ADMIN:
      dashboardUrl = "/admin/dashboard";
      break;
  }

  redirect(`${dashboardUrl}?error=unauthorized`);
}

/**
 * Get the default dashboard URL for a user based on their role
 * 
 * @param role - The user's role
 * @returns The dashboard URL for the user's role
 */
export function getDashboardUrl(role: UserRole): string {
  return getSharedDashboardUrl(role);
}

/**
 * Higher-order function to protect server components with authentication and authorization
 * 
 * @param Component - The React component to protect
 * @param requiredRole - The minimum required role to access the component (optional)
 * @param options - Additional options for authorization
 * @returns Protected component that redirects unauthorized users
 * 
 * @example
 * ```typescript
 * // Protect a page that requires ORGANIZER role
 * export default withAuth(OrganizerDashboard, UserRole.ORGANIZER);
 * 
 * // Protect a page that requires authentication but no specific role
 * export default withAuth(ProfilePage);
 * 
 * // Protect with multiple allowed roles
 * export default withAuth(DashboardPage, undefined, {
 *   allowedRoles: [UserRole.STUDENT, UserRole.ORGANIZER]
 * });
 * ```
 */
export function withAuth<P extends object>(
  Component: (props: P) => Promise<ReactElement> | ReactElement,
  requiredRole?: UserRole,
  options?: {
    allowedRoles?: UserRole[];
    redirectTo?: string;
  }
) {
  return async function ProtectedComponent(props: P): Promise<ReactElement> {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      redirectUnauthorized(undefined, options?.redirectTo);
    }

    const userRole = session.user.role;

    // If specific role is required, check permission
    if (requiredRole) {
      if (!checkPermission(userRole, requiredRole)) {
        redirectUnauthorized(userRole, options?.redirectTo);
      }
    }

    // If allowed roles are specified, check if user has any of them
    if (options?.allowedRoles) {
      if (!hasAnyRole(userRole, options.allowedRoles)) {
        redirectUnauthorized(userRole, options?.redirectTo);
      }
    }

    // User is authenticated and authorized
    const element = Component(props);
    return element instanceof Promise ? await element : element;
  };
}

/**
 * Get the current session or redirect to login
 * Useful for server components that need the session
 * 
 * @param requiredRole - The minimum required role (optional)
 * @returns The current session
 * 
 * @example
 * ```typescript
 * // In a server component
 * const session = await requireAuth();
 * console.log(session.user.name);
 * 
 * // Require specific role
 * const session = await requireAuth(UserRole.ORGANIZER);
 * ```
 */
export async function requireAuth(
  requiredRole?: UserRole
): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (requiredRole && !checkPermission(session.user.role, requiredRole)) {
    redirectUnauthorized(session.user.role);
  }

  return session;
}

/**
 * Check if the current user is authenticated
 * Returns session if authenticated, null otherwise
 * 
 * @returns The session or null
 */
export async function getAuth(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Check if a user has permission to perform an action on a resource
 * 
 * @param userRole - The role of the current user
 * @param action - The action to perform
 * @param resource - The resource being accessed
 * @returns true if the user has permission
 * 
 * @example
 * ```typescript
 * // Check if user can edit an event
 * const canEdit = checkResourcePermission(
 *   UserRole.ORGANIZER,
 *   'edit',
 *   'event'
 * );
 * ```
 */
export function checkResourcePermission(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete",
  resource: "event" | "user" | "certificate" | "registration"
): boolean {
  // Define resource permissions
  const permissions: Record<UserRole, Record<string, string[]>> = {
    [UserRole.STUDENT]: {
      event: ["read"],
      user: ["read", "update"], // Own profile
      certificate: ["read"],
      registration: ["create", "read", "delete"], // Own registrations
    },
    [UserRole.ORGANIZER]: {
      event: ["create", "read", "update", "delete"], // Own events
      user: ["read", "update"], // Own profile
      certificate: ["create", "read"], // For own events
      registration: ["read"], // For own events
    },
    [UserRole.ADMIN]: {
      event: ["create", "read", "update", "delete"], // All events
      user: ["create", "read", "update", "delete"], // All users
      certificate: ["create", "read", "update", "delete"], // All certificates
      registration: ["create", "read", "update", "delete"], // All registrations
    },
  };

  const rolePermissions = permissions[userRole];
  const resourcePermissions = rolePermissions[resource] || [];

  return resourcePermissions.includes(action);
}
