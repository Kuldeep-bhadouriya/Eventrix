# RBAC Quick Reference

## Import Statements

```typescript
// Server-side utilities
import { 
  checkPermission, 
  hasAnyRole,
  redirectUnauthorized,
  getDashboardUrl,
  withAuth,
  requireAuth,
  getAuth,
  checkResourcePermission
} from "@/lib/rbac";

// Client-side hooks
import {
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
  useIsStudent
} from "@/hooks";

// API middleware
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  requireAuth,
  requireRole,
  requireAnyRole,
  requireAdmin,
  requireOrganizer,
  withAuthApi,
  withRoles,
  getPagination,
  parseBody,
  handleApiError
} from "@/lib/api-middleware";

// Types
import { UserRole } from "@prisma/client";
```

## Server Components

```typescript
// Protect page with role
export default withAuth(Page, UserRole.ORGANIZER);

// Require authentication in component
export default async function Page() {
  const session = await requireAuth(UserRole.ADMIN);
  return <div>{session.user.name}</div>;
}

// Check permission
const canAccess = checkPermission(userRole, UserRole.ORGANIZER);
```

## Client Components

```typescript
"use client";

// Get current user
const { user, isLoading, isAuthenticated } = useAuth();

// Require authentication
const { user, isLoading } = useRequireAuth(UserRole.ORGANIZER);

// Check role
const role = useRole();
const isAdmin = useIsAdmin();
const hasPermission = useHasPermission(UserRole.ORGANIZER);
```

## API Routes

```typescript
// With HOF
export const POST = withAuthApi(
  async (request, session) => {
    return successResponse({ data: "..." });
  },
  UserRole.ORGANIZER
);

// Manual check
export async function GET(request: NextRequest) {
  const session = await requireRole(UserRole.ADMIN);
  if (session instanceof NextResponse) return session;
  
  return successResponse({ data: "..." });
}

// Multiple roles
export const DELETE = withRoles(
  async (request, session) => {
    return successResponse({ message: "Deleted" });
  },
  [UserRole.ORGANIZER, UserRole.ADMIN]
);
```

## Common Patterns

### Protected Page

```typescript
// app/organizer/page.tsx
import { withAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

async function OrganizerPage() {
  return <div>Organizer Dashboard</div>;
}

export default withAuth(OrganizerPage, UserRole.ORGANIZER);
```

### Client Component Protection

```typescript
"use client";
import { useRequireAuth } from "@/hooks";
import { UserRole } from "@prisma/client";

export function AdminPanel() {
  const { user, isLoading } = useRequireAuth(UserRole.ADMIN);
  if (isLoading) return <Spinner />;
  return <div>Admin: {user.name}</div>;
}
```

### API Route Protection

```typescript
import { withAuthApi, successResponse } from "@/lib/api-middleware";
import { UserRole } from "@prisma/client";

export const POST = withAuthApi(
  async (request, session) => {
    const body = await request.json();
    // Logic here
    return successResponse({ id: "123" });
  },
  UserRole.ORGANIZER
);
```

### Conditional Rendering

```typescript
"use client";
import { useAuth, useHasPermission } from "@/hooks";
import { UserRole } from "@prisma/client";

export function Actions() {
  const { user } = useAuth();
  const canEdit = useHasPermission(UserRole.ORGANIZER);
  
  return (
    <>
      {canEdit && <button>Edit</button>}
      {user?.role === UserRole.ADMIN && <button>Delete</button>}
    </>
  );
}
```

## Role Hierarchy

```
ADMIN (highest)
  ↓
ORGANIZER
  ↓
STUDENT (lowest)
```

- `checkPermission(UserRole.ADMIN, UserRole.STUDENT)` → `true`
- `checkPermission(UserRole.STUDENT, UserRole.ADMIN)` → `false`

## Protected Routes (Middleware)

```typescript
"/dashboard/*"   → STUDENT, ORGANIZER, ADMIN
"/organizer/*"   → ORGANIZER, ADMIN
"/admin/*"       → ADMIN
```

## Error Pages

- `/unauthorized` → 403 Access Denied
- `/not-found` → 404 Page Not Found (automatic)

## Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100 }
}

// Error
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Checklist

### Protecting a Page
- [ ] Import `withAuth` or `requireAuth`
- [ ] Specify required role
- [ ] Handle loading state in client components
- [ ] Test with different roles

### Protecting an API Route
- [ ] Import middleware functions
- [ ] Add authentication check
- [ ] Return proper error responses
- [ ] Test with/without authentication

### Adding New Role
- [ ] Update UserRole enum in schema
- [ ] Run migration
- [ ] Update ROLE_HIERARCHY in rbac.ts
- [ ] Update middleware rules
- [ ] Update getDashboardUrl
- [ ] Test thoroughly
