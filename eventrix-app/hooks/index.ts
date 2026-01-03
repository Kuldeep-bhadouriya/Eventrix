/**
 * Authentication Hooks
 * 
 * Barrel export for all authentication-related hooks
 */

export {
  useAuth,
  useRole,
  useHasRole,
  useHasAnyRole,
  useHasPermission,
  useRequireAuth,
  useAuthorization,
  useProfileCompleted,
  useIsAdmin,
  useIsOrganizer,
  useIsStudent,
} from "./use-auth";
