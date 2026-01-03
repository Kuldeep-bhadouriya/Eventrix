# NextAuth.js Authentication Setup

This document provides comprehensive information about the NextAuth.js authentication implementation in Eventrix.

## Overview

The authentication system uses NextAuth.js v5 with the following features:
- **Credentials Provider**: Email/password authentication
- **Google OAuth Provider**: Social login with Google
- **JWT Strategy**: Stateless session management
- **Role-Based Access Control**: Protecting routes based on user roles
- **Email Verification**: Token-based email verification system
- **Secure Password Handling**: bcrypt hashing with salt rounds

## File Structure

```
eventrix-app/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts          # NextAuth API handler
│   │       ├── signup/
│   │       │   └── route.ts          # User registration endpoint
│   │       └── verify-email/
│   │           └── route.ts          # Email verification endpoint
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx             # Sign-in UI page
│   │   ├── signup/
│   │   │   └── page.tsx             # Sign-up UI page
│   │   └── error/
│   │       └── page.tsx             # Error handling page
│   └── layout.tsx                   # Root layout with SessionProvider
├── components/
│   └── providers/
│       └── session-provider.tsx     # Client-side session provider
├── lib/
│   ├── auth.ts                      # NextAuth configuration
│   └── auth-utils.ts                # Authentication utilities
├── middleware.ts                    # Route protection middleware
└── prisma/
    └── schema.prisma                # Database schema with auth models
```

## Database Models

### User Model
The User model has been extended with authentication-related fields:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?   // Nullable for OAuth-only users
  role          UserRole  @default(STUDENT)
  avatar        String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  // ... other relations
}
```

### NextAuth Models
Three additional models support NextAuth functionality:

1. **Account**: Stores OAuth account information
2. **Session**: Stores session data (optional with JWT strategy)
3. **VerificationToken**: Stores email verification tokens

## Environment Variables

Required environment variables (add to `.env.local`):

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars-long

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Choose one)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@eventrix.com
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### Email Configuration Options

#### Option 1: Gmail
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-specific-password
```

**Note**: Enable 2FA and generate an App-Specific Password in Google Account settings.

#### Option 2: SendGrid
```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
```

#### Option 3: Mailgun
```bash
EMAIL_SERVER_HOST=smtp.mailgun.org
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=postmaster@your-domain.mailgun.org
EMAIL_SERVER_PASSWORD=your-mailgun-smtp-password
```

## Authentication Configuration

### NextAuth Options (`lib/auth.ts`)

Key configurations:

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({...}),
    GoogleProvider({...}),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {...},
    session: async ({ session, token }) => {...},
  },
};
```

### Session Data Structure

The session includes:

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string | null;
  }
}
```

## Middleware & Route Protection

The middleware (`middleware.ts`) protects routes based on user roles:

### Route Access Rules

```typescript
const routeAccessRules = {
  "/dashboard": [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN],
  "/organizer": [UserRole.ORGANIZER, UserRole.ADMIN],
  "/admin": [UserRole.ADMIN],
};
```

### Public Routes

These routes are accessible without authentication:
- `/` (home)
- `/auth/signin`
- `/auth/signup`
- `/auth/error`
- `/auth/verify-email`
- `/api/auth/*`

### Unauthorized Access

When users try to access unauthorized routes:
1. Unauthenticated users → Redirect to `/auth/signin`
2. Authenticated but unauthorized → Redirect to role-appropriate dashboard with error parameter

## Authentication Utilities

### Password Security (`lib/auth-utils.ts`)

```typescript
// Hash password with bcrypt (12 salt rounds)
const hashedPassword = await hashPassword(password);

// Verify password
const isValid = await verifyPassword(password, hashedPassword);

// Validate password strength
const validation = validatePasswordStrength(password);
// Requirements:
// - Min 8 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
```

### Email Functions

```typescript
// Generate verification token
const token = generateVerificationToken();

// Send verification email
await sendVerificationEmail(email, token, "verification");

// Send password reset email
await sendVerificationEmail(email, token, "reset");
```

## API Endpoints

### POST `/api/auth/signup`

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "STUDENT" // Optional: STUDENT | ORGANIZER
}
```

**Response (201):**
```json
{
  "message": "Account created successfully! Please check your email...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
  }
}
```

**Errors:**
- 400: Invalid input, weak password
- 409: Email already exists
- 500: Server error

### POST `/api/auth/verify-email`

Verify user's email address.

**Request:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully! You can now sign in."
}
```

**Errors:**
- 400: Invalid/expired token
- 500: Server error

### NextAuth Endpoints

NextAuth automatically provides:
- `GET/POST /api/auth/signin`
- `GET/POST /api/auth/signout`
- `GET/POST /api/auth/callback/:provider`
- `GET /api/auth/session`
- `GET /api/auth/csrf`
- `GET /api/auth/providers`

## Client-Side Usage

### Using Session in Client Components

```tsx
"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Access Denied</div>;

  return (
    <div>
      <h1>Welcome, {session?.user.name}</h1>
      <p>Role: {session?.user.role}</p>
    </div>
  );
}
```

### Sign In Programmatically

```tsx
import { signIn } from "next-auth/react";

// Credentials sign in
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  callbackUrl: "/dashboard",
});

// Google sign in
await signIn("google", {
  callbackUrl: "/dashboard",
});
```

### Sign Out

```tsx
import { signOut } from "next-auth/react";

await signOut({
  callbackUrl: "/",
});
```

## Server-Side Usage

### Using Session in Server Components

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### Protecting API Routes

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check role
  if (session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  // Proceed with authorized logic
  return Response.json({ data: "..." });
}
```

## Migrating Database

After updating the Prisma schema:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_nextauth_models

# Open Prisma Studio to view data
npx prisma studio
```

## Security Best Practices

1. **NEXTAUTH_SECRET**: Use a strong, random secret (min 32 characters)
2. **Password Storage**: Never store plain text passwords
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure proper CORS policies
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **Session Timeout**: Configure appropriate session expiration
7. **Email Verification**: Enforce email verification before allowing access
8. **Password Requirements**: Enforce strong password policies
9. **OAuth Scope**: Request only necessary OAuth scopes
10. **Token Expiry**: Set appropriate token expiration times

## Testing Authentication

### Test User Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "STUDENT"
  }'
```

### Test Sign In

Visit `http://localhost:3000/auth/signin` and use the credentials.

## Troubleshooting

### Common Issues

1. **"Configuration" error**
   - Check `NEXTAUTH_SECRET` is set
   - Verify `NEXTAUTH_URL` matches your app URL

2. **OAuth not working**
   - Verify redirect URIs in Google Console
   - Check client ID and secret are correct
   - Ensure OAuth consent screen is configured

3. **Email not sending**
   - Verify SMTP credentials
   - Check email server allows SMTP connections
   - For Gmail, ensure App-Specific Password is used

4. **Session not persisting**
   - Check cookies are enabled
   - Verify `NEXTAUTH_URL` matches current domain
   - Clear browser cookies and try again

5. **Middleware redirecting incorrectly**
   - Check route patterns in `middleware.ts`
   - Verify role assignments in database
   - Review `routeAccessRules` configuration

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Adapter Documentation](https://authjs.dev/reference/adapter/prisma)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review NextAuth.js documentation
3. Create an issue in the project repository
