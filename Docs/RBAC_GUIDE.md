# Role-Based Access Control (RBAC) Documentation

## Overview

This documentation provides comprehensive information about the Role-Based Access Control (RBAC) system implemented in the Eventrix application. The RBAC system ensures that users can only access resources and perform actions appropriate to their role.

## Table of Contents

1. [User Roles](#user-roles)
2. [RBAC Utilities](#rbac-utilities)
3. [Authentication Hooks](#authentication-hooks)
4. [Middleware Protection](#middleware-protection)
5. [API Route Protection](#api-route-protection)
6. [Error Pages](#error-pages)
7. [Usage Examples](#usage-examples)

## User Roles

The system supports three hierarchical roles:

### Role Hierarchy

```
ADMIN > ORGANIZER > STUDENT
```

- **STUDENT**: Base level access, can browse events, register for events, view certificates
- **ORGANIZER**: Can create and manage events, view participants, issue certificates
- **ADMIN**: Full system access, can manage users, events, and system settings

### Role Definitions

```typescript
enum UserRole {
  STUDENT
  ORGANIZER
  ADMIN
}
```

## RBAC Utilities

Located in `/lib/rbac.ts`, these utilities provide core RBAC functionality.

### Core Functions

#### `checkPermission(userRole, requiredRole)`

Checks if a user has permission based on role hierarchy.

```typescript
import { checkPermission } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

// Check if user can access organizer features
const canAccess = checkPermission(UserRole.ADMIN, UserRole.ORGANIZER); // true
const canAccess = checkPermission(UserRole.STUDENT, UserRole.ORGANIZER); // false
```

**Parameters:**
- `userRole`: The role of the current user
- `requiredRole`: The minimum required role

**Returns:** `boolean` - true if user has sufficient permissions

#### `hasAnyRole(userRole, requiredRoles)`

Checks if a user has any of the specified roles.

```typescript
import { hasAnyRole } from "@/lib/rbac";

const canManage = hasAnyRole(
  userRole,
  [UserRole.ORGANIZER, UserRole.ADMIN]
); // true for ORGANIZER or ADMIN
```

**Parameters:**
- `userRole`: The role of the current user
- `requiredRoles`: Array of acceptable roles

**Returns:** `boolean` - true if user has any of the required roles

#### `redirectUnauthorized(userRole, callbackUrl)`

Redirects unauthorized users to an appropriate page.

```typescript
import { redirectUnauthorized } from "@/lib/rbac";

// Redirect unauthenticated user to login
redirectUnauthorized(undefined, '/admin/dashboard');

// Redirect student trying to access organizer dashboard
redirectUnauthorized(UserRole.STUDENT, '/organizer/dashboard');
```

**Parameters:**
- `userRole`: The role of the current user (undefined if not authenticated)
- `callbackUrl`: The URL the user was trying to access (optional)

**Behavior:**
- Unauthenticated users → `/auth/login?callbackUrl=...`
- Unauthorized users → Their role's dashboard with error message

#### `getDashboardUrl(role)`

Gets the default dashboard URL for a user's role.

```typescript
import { getDashboardUrl } from "@/lib/rbac";

const url = getDashboardUrl(UserRole.ORGANIZER); // "/organizer/dashboard"
```

#### `withAuth(Component, requiredRole, options)`

Higher-order function to protect server components.

```typescript
import { withAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

// Protect with specific role
export default withAuth(OrganizerDashboard, UserRole.ORGANIZER);

// Protect with authentication only
export default withAuth(ProfilePage);

// Protect with multiple allowed roles
export default withAuth(DashboardPage, undefined, {
  allowedRoles: [UserRole.STUDENT, UserRole.ORGANIZER]
});
```

**Parameters:**
- `Component`: The React component to protect
- `requiredRole`: Minimum required role (optional)
- `options`: Additional options
  - `allowedRoles`: Array of acceptable roles
  - `redirectTo`: Custom redirect URL

#### `requireAuth(requiredRole)`

Server-side function to require authentication and optionally a specific role.

```typescript
import { requireAuth } from "@/lib/rbac";

export default async function Page() {
  // Require authentication
  const session = await requireAuth();
  
  // Require specific role
  const session = await requireAuth(UserRole.ORGANIZER);
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

#### `getAuth()`

Get current session without requiring authentication.

```typescript
import { getAuth } from "@/lib/rbac";

export default async function Page() {
  const session = await getAuth();
  
  if (session) {
    return <div>Logged in as {session.user.name}</div>;
  }
  
  return <div>Not logged in</div>;
}
```

#### `checkResourcePermission(userRole, action, resource)`

Check if a user has permission to perform an action on a resource.

```typescript
import { checkResourcePermission } from "@/lib/rbac";

// Check if user can edit events
const canEdit = checkResourcePermission(
  UserRole.ORGANIZER,
  'edit',
  'event'
); // true

// Check if student can delete users
const canDelete = checkResourcePermission(
  UserRole.STUDENT,
  'delete',
  'user'
); // false
```

**Actions:** `create`, `read`, `update`, `delete`
**Resources:** `event`, `user`, `certificate`, `registration`

## Authentication Hooks

Located in `/hooks/use-auth.ts`, these hooks provide client-side authentication state.

### Available Hooks

#### `useAuth()`

Get current authenticated user session.

```typescript
"use client";

import { useAuth } from "@/hooks";

export function ProfileCard() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <div>Welcome, {user.name}!</div>;
}
```

**Returns:**
- `user`: User object from session
- `session`: Full session object
- `isLoading`: Loading state
- `isAuthenticated`: Authentication status
- `isUnauthenticated`: Opposite of isAuthenticated

#### `useRole()`

Get the current user's role.

```typescript
"use client";

import { useRole } from "@/hooks";
import { UserRole } from "@prisma/client";

export function RoleBasedComponent() {
  const role = useRole();

  if (role === UserRole.ADMIN) {
    return <AdminPanel />;
  }

  return <UserPanel />;
}
```

#### `useHasRole(requiredRole)`

Check if user has a specific role.

```typescript
"use client";

import { useHasRole } from "@/hooks";
import { UserRole } from "@prisma/client";

export function OrganizerFeature() {
  const isOrganizer = useHasRole(UserRole.ORGANIZER);

  if (!isOrganizer) return <AccessDenied />;

  return <OrganizerDashboard />;
}
```

#### `useHasAnyRole(roles)`

Check if user has any of the specified roles.

```typescript
"use client";

import { useHasAnyRole } from "@/hooks";
import { UserRole } from "@prisma/client";

export function ManagementPanel() {
  const hasAccess = useHasAnyRole([UserRole.ADMIN, UserRole.ORGANIZER]);

  if (!hasAccess) return null;

  return <ManagementDashboard />;
}
```

#### `useHasPermission(requiredRole)`

Check permission based on role hierarchy.

```typescript
"use client";

import { useHasPermission } from "@/hooks";
import { UserRole } from "@prisma/client";

export function ProtectedComponent() {
  const hasPermission = useHasPermission(UserRole.ORGANIZER);
  // Returns true for ORGANIZER and ADMIN, false for STUDENT

  if (!hasPermission) return <Forbidden />;

  return <ProtectedContent />;
}
```

#### `useRequireAuth(requiredRole, options)`

Require authentication and optionally a specific role with automatic redirection.

```typescript
"use client";

import { useRequireAuth } from "@/hooks";
import { UserRole } from "@prisma/client";

export function OrganizerPage() {
  const { user, isLoading } = useRequireAuth(UserRole.ORGANIZER);

  if (isLoading) return <LoadingSpinner />;

  // User is authenticated and has ORGANIZER or ADMIN role
  return <OrganizerDashboard user={user} />;
}

// Require authentication without specific role
export function ProfilePage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) return <LoadingSpinner />;

  return <Profile user={user} />;
}

// With custom options
export function CustomPage() {
  const { user, isLoading } = useRequireAuth(undefined, {
    allowedRoles: [UserRole.ORGANIZER, UserRole.ADMIN],
    redirectTo: "/events"
  });

  // ...
}
```

**Parameters:**
- `requiredRole`: Minimum required role (optional)
- `options`: Additional options
  - `allowedRoles`: Array of acceptable roles
  - `redirectTo`: Custom redirect URL

#### `useAuthorization(allowedRoles)`

Protect a component with automatic redirection.

```typescript
"use client";

import { useAuthorization } from "@/hooks";
import { UserRole } from "@prisma/client";

export function AdminPanel() {
  const { isAuthorized, isLoading, user } = useAuthorization([UserRole.ADMIN]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return null; // Will redirect automatically

  return <AdminDashboard />;
}
```

#### Convenience Hooks

Quick role checking hooks:

```typescript
"use client";

import {
  useIsAdmin,
  useIsOrganizer,
  useIsStudent,
  useProfileCompleted
} from "@/hooks";

export function Dashboard() {
  const isAdmin = useIsAdmin();
  const isOrganizer = useIsOrganizer();
  const isStudent = useIsStudent();
  const profileComplete = useProfileCompleted();

  // Use for conditional rendering
}
```

## Middleware Protection

The middleware (`/middleware.ts`) automatically protects routes based on user roles.

### Protected Routes

```typescript
const routeAccessRules = {
  "/dashboard": [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN],
  "/organizer": [UserRole.ORGANIZER, UserRole.ADMIN],
  "/admin": [UserRole.ADMIN],
};
```

### Public Routes

These routes are accessible without authentication:

- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/events` - Public events listing
- `/auth/*` - Authentication pages
- `/api/auth/*` - NextAuth API routes
- `/api/health` - Health check

### Behavior

1. **Unauthenticated access to protected route:**
   - Redirects to `/auth/login?callbackUrl=<original-url>`

2. **Authenticated but insufficient role:**
   - Redirects to user's appropriate dashboard
   - Adds `?error=unauthorized` query parameter

3. **Incomplete profile:**
   - Redirects to `/auth/complete-profile`
   - Enforced before role checking

## API Route Protection

Located in `/lib/api-middleware.ts`, these utilities protect API routes.

### Response Helpers

#### Success Response

```typescript
import { successResponse } from "@/lib/api-middleware";

export async function GET() {
  const data = { message: "Success" };
  return successResponse(data);
}

// With pagination metadata
export async function GET(request: NextRequest) {
  const items = await fetchItems();
  return successResponse(items, {
    page: 1,
    limit: 10,
    total: 100
  });
}
```

#### Error Responses

```typescript
import {
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse
} from "@/lib/api-middleware";

// Generic error
return errorResponse("Something went wrong", 400);

// Validation error
return validationErrorResponse({
  email: ["Email is required"],
  password: ["Password must be at least 8 characters"]
});

// Unauthorized (401)
return unauthorizedResponse("Please sign in");

// Forbidden (403)
return forbiddenResponse("Insufficient permissions");

// Not found (404)
return notFoundResponse("Event not found");

// Server error (500)
return serverErrorResponse("Database error");
```

### Authentication Functions

#### `requireAuth()`

Require authentication for API route.

```typescript
import { requireAuth, successResponse } from "@/lib/api-middleware";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);

  if (session instanceof NextResponse) {
    return session; // Return error response
  }

  // User is authenticated
  return successResponse({ user: session.user });
}
```

#### `requireRole(requiredRole)`

Require specific role for API route.

```typescript
import { requireRole, successResponse } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await requireRole(UserRole.ORGANIZER);

  if (session instanceof NextResponse) {
    return session; // Return error response
  }

  // User has ORGANIZER or ADMIN role
  return successResponse({ message: "Event created" });
}
```

#### `requireAnyRole(allowedRoles)`

Require any of the specified roles.

```typescript
import { requireAnyRole, successResponse } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  const session = await requireAnyRole([UserRole.ORGANIZER, UserRole.ADMIN]);

  if (session instanceof NextResponse) {
    return session;
  }

  // User has ORGANIZER or ADMIN role
  return successResponse({ message: "Deleted" });
}
```

#### `requireAdmin()` and `requireOrganizer()`

Convenience functions for common role requirements.

```typescript
import { requireAdmin, requireOrganizer } from "@/lib/api-middleware";

// Admin only
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  // Admin action...
}

// Organizer or Admin
export async function POST(request: NextRequest) {
  const session = await requireOrganizer();
  if (session instanceof NextResponse) return session;
  // Create event...
}
```

### Higher-Order Functions

#### `withAuthApi(handler, requiredRole)`

Wrap API handlers with authentication.

```typescript
import { withAuthApi, successResponse } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

// Require authentication only
export const GET = withAuthApi(async (request, session) => {
  // session is guaranteed to exist
  return successResponse({ user: session.user });
});

// Require specific role
export const POST = withAuthApi(
  async (request, session) => {
    // User has ORGANIZER role or higher
    return successResponse({ message: "Created" });
  },
  UserRole.ORGANIZER
);
```

#### `withRoles(handler, allowedRoles)`

Wrap API handlers with role-based authorization.

```typescript
import { withRoles, successResponse } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

export const DELETE = withRoles(
  async (request, session) => {
    return successResponse({ message: "Deleted" });
  },
  [UserRole.ORGANIZER, UserRole.ADMIN]
);
```

### Utility Functions

#### `validateMethod(request, allowedMethods)`

Validate HTTP method.

```typescript
import { validateMethod } from "@/lib/api-middleware";

export async function handler(request: NextRequest) {
  const methodError = validateMethod(request, ["GET", "POST"]);
  if (methodError) return methodError;

  // Method is valid...
}
```

#### `parseBody(request)`

Parse and validate JSON body.

```typescript
import { parseBody } from "@/lib/api-middleware";

export async function POST(request: NextRequest) {
  const body = await parseBody(request);

  if (body instanceof NextResponse) {
    return body; // Return error response
  }

  // Use body...
}
```

#### `getPagination(request, defaultLimit)`

Get pagination parameters from URL.

```typescript
import { getPagination, successResponse } from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  const { page, limit, skip } = getPagination(request, 20);

  const items = await prisma.event.findMany({
    skip,
    take: limit,
  });

  const total = await prisma.event.count();

  return successResponse(items, { page, limit, total });
}
```

#### `handleApiError(error)`

Handle and convert errors to responses.

```typescript
import { handleApiError } from "@/lib/api-middleware";

export async function POST(request: NextRequest) {
  try {
    // API logic...
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Error Pages

### 403 Unauthorized

Located at `/app/unauthorized/page.tsx`

**Features:**
- Displays 403 error code
- Shows user's current role
- Provides navigation options based on authentication state
- Link to contact support

**Access:** `/unauthorized`

### 404 Not Found

Located at `/app/not-found.tsx`

**Features:**
- Displays 404 error code
- Quick links to common pages
- Role-based navigation suggestions
- Back button functionality

**Access:** Automatic for non-existent routes

## Usage Examples

### Protecting Server Components

```typescript
// app/organizer/dashboard/page.tsx
import { withAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

async function OrganizerDashboard() {
  return <div>Organizer Dashboard</div>;
}

export default withAuth(OrganizerDashboard, UserRole.ORGANIZER);
```

### Protecting Client Components

```typescript
// components/AdminPanel.tsx
"use client";

import { useRequireAuth } from "@/hooks";
import { UserRole } from "@prisma/client";

export function AdminPanel() {
  const { user, isLoading } = useRequireAuth(UserRole.ADMIN);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <div>Admin Panel for {user.name}</div>;
}
```

### Protecting API Routes

```typescript
// app/api/events/route.ts
import { withAuthApi, successResponse } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";

export const POST = withAuthApi(
  async (request: NextRequest, session) => {
    const body = await request.json();

    // Create event logic...

    return successResponse({ message: "Event created" });
  },
  UserRole.ORGANIZER
);
```

### Conditional Rendering

```typescript
"use client";

import { useAuth, useHasPermission } from "@/hooks";
import { UserRole } from "@prisma/client";

export function EventCard({ event }) {
  const { user } = useAuth();
  const canManage = useHasPermission(UserRole.ORGANIZER);

  return (
    <div>
      <h3>{event.title}</h3>
      {canManage && (
        <button>Edit Event</button>
      )}
      {user?.role === UserRole.STUDENT && (
        <button>Register</button>
      )}
    </div>
  );
}
```

### Server Actions with RBAC

```typescript
// app/actions/events.ts
"use server";

import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { checkPermission } from "@/lib/rbac";

export async function createEvent(formData: FormData) {
  const session = await requireAuth(UserRole.ORGANIZER);

  // Create event...

  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const session = await requireAuth();

  // Check if user can delete this specific event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (
    session.user.role !== UserRole.ADMIN &&
    event.organizerId !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  // Delete event...
}
```

## Best Practices

1. **Always validate on server-side**: Client-side checks can be bypassed
2. **Use middleware for route protection**: Centralized and consistent
3. **Provide clear error messages**: Help users understand why they can't access something
4. **Log authorization failures**: For security auditing
5. **Test with different roles**: Ensure proper access control
6. **Keep role hierarchy simple**: Easier to maintain and understand
7. **Document permission requirements**: In code comments and API docs

## Testing

### Testing Protected Routes

```typescript
// __tests__/protected-routes.test.ts
import { checkPermission, hasAnyRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

describe("RBAC", () => {
  describe("checkPermission", () => {
    it("should allow admin to access organizer routes", () => {
      expect(checkPermission(UserRole.ADMIN, UserRole.ORGANIZER)).toBe(true);
    });

    it("should not allow student to access organizer routes", () => {
      expect(checkPermission(UserRole.STUDENT, UserRole.ORGANIZER)).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("should return true if user has one of the roles", () => {
      expect(hasAnyRole(UserRole.ORGANIZER, [UserRole.ORGANIZER, UserRole.ADMIN])).toBe(true);
    });

    it("should return false if user doesn't have any role", () => {
      expect(hasAnyRole(UserRole.STUDENT, [UserRole.ORGANIZER, UserRole.ADMIN])).toBe(false);
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Infinite redirect loops**
   - Check middleware config matcher
   - Ensure auth routes are in public routes list
   - Verify NEXTAUTH_SECRET is set

2. **Session not available**
   - Ensure SessionProvider wraps app
   - Check NEXTAUTH_URL environment variable
   - Verify auth.ts configuration

3. **Role not updating**
   - Session needs to be updated using `update()` from useSession
   - JWT callback should handle token updates

4. **API routes not protected**
   - Ensure using requireAuth or withAuthApi
   - Check that route is not in publicApiRoutes

## Security Considerations

1. **Never trust client-side checks**: Always validate on server
2. **Use HTTPS in production**: Protect session tokens
3. **Implement rate limiting**: Prevent brute force attacks
4. **Log security events**: Monitor unauthorized access attempts
5. **Regular security audits**: Review and update permissions
6. **Principle of least privilege**: Grant minimum necessary permissions

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

---

Last Updated: January 3, 2026
Version: 1.0.0
