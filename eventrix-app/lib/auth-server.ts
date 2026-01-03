import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Get the current session on the server side
 * Use this in Server Components, API Routes, and Server Actions
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Get the current session with full details on the server side
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes or server actions
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

/**
 * Require specific role - throws error if user doesn't have required role
 */
export async function requireRole(roles: string | string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Authentication required");
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  return session;
}
