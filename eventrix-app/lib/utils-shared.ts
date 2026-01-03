/**
 * Shared utilities that can be used in both client and server components
 * This file should NOT import any server-side dependencies
 */

import { UserRole } from "@prisma/client";

/**
 * Get the appropriate dashboard URL based on user role
 * This is a pure utility function with no server dependencies
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.STUDENT:
      return "/dashboard";
    case UserRole.ORGANIZER:
      return "/organizer/dashboard";
    case UserRole.ADMIN:
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
}

/**
 * Role hierarchy levels for permission checking
 */
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.STUDENT,
  UserRole.ORGANIZER,
  UserRole.ADMIN,
];

/**
 * Get the hierarchy level of a role
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if a user has permission based on role hierarchy (client-safe)
 */
export function checkPermissionClient(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Check if a user has any of the required roles (client-safe)
 */
export function hasAnyRoleClient(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}
