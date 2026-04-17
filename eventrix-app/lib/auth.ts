import { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { verifyPassword } from "./auth-utils";
import { UserRole } from "@prisma/client";

// Extend NextAuth types to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      avatar?: string | null;
      profileCompleted: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string | null;
    profileCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    avatar?: string | null;
    profileCompleted: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database sessions (optional with JWT)
  adapter: PrismaAdapter(prisma) as any,

  // Configure session strategy to use JWT
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Configure authentication providers
  providers: [
    // Email/Password credentials provider
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check if user has a password (not OAuth-only account)
        if (!user.password) {
          throw new Error(
            "This account uses social login. Please sign in with Google."
          );
        }

        // Verify password
        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Check if email is verified (optional - can be enforced)
        // if (!user.emailVerified) {
        //   throw new Error("Please verify your email before signing in");
        // }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          profileCompleted: user.profileCompleted || false,
        };
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          role: UserRole.STUDENT, // Default role for OAuth users
          emailVerified: profile.email_verified ? new Date() : null,
          profileCompleted: false, // New users need to complete profile
        };
      },
    }),
  ],

  // Configure custom pages
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/complete-profile", // Redirect new users to complete profile
  },

  // Configure callbacks
  callbacks: {
    // JWT callback - called whenever a JWT is created or updated
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        token.profileCompleted = user.profileCompleted || false;
      }

      // Handle Google OAuth sign in
      if (account?.provider === "google" && user) {
        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          token.id = existingUser.id;
          token.role = existingUser.role;
          token.avatar = existingUser.avatar;
          token.profileCompleted = existingUser.profileCompleted;
        } else {
          // Create new user for OAuth
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              avatar: user.avatar,
              role: UserRole.STUDENT,
              emailVerified: new Date(),
              profileCompleted: false,
            },
          });
          token.id = newUser.id;
          token.role = newUser.role;
          token.avatar = newUser.avatar;
          token.profileCompleted = newUser.profileCompleted;
        }
      }

      // Handle session updates (when calling update() from client)
      if (trigger === "update") {
        if (session) {
          if (session.name !== undefined) {
            token.name = session.name;
          }

          if (session.avatar !== undefined) {
            token.avatar = session.avatar;
          }
        }

        // Always refresh profile completion from DB, even when update() has no payload.
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { profileCompleted: true },
        });

        if (refreshedUser) {
          token.profileCompleted = refreshedUser.profileCompleted;
        }
      }

      return token;
    },

    // Session callback - called whenever a session is checked
    async session({ session, token }): Promise<Session> {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.profileCompleted = token.profileCompleted;
      }
      return session;
    },

    // Sign in callback - control if user can sign in
    async signIn({ user: _user, account, profile: _profile }) {
      // Allow OAuth sign ins
      if (account?.provider === "google") {
        // Additional checks can be added here
        return true;
      }

      // Allow credentials sign in
      if (account?.provider === "credentials") {
        return true;
      }

      return true;
    },

    // Redirect callback - control where users are redirected after sign in
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },

  // Configure events
  events: {
    async signIn({ user, account: _account, profile: _profile, isNewUser: _isNewUser }) {
      console.log("User signed in:", user.email);
      // You can add additional logic here like logging, analytics, etc.
    },
    async signOut({ token }) {
      console.log("User signed out:", token.email);
    },
    async createUser({ user }) {
      console.log("New user created:", user.email);
    },
    async linkAccount({ user, account }) {
      console.log("Account linked:", user.email, account.provider);
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};
