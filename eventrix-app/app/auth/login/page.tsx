"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle URL errors
  const getErrorMessage = (error: string | null) => {
    if (!error) return null;
    
    const errorMessages: Record<string, string> = {
      OAuthSignin: "Error connecting to authentication provider",
      OAuthCallback: "Error during authentication callback",
      OAuthCreateAccount: "Error creating account with provider",
      EmailCreateAccount: "Error creating account with email",
      Callback: "Error during authentication",
      OAuthAccountNotLinked: "Account already exists with different provider",
      EmailSignin: "Error sending verification email",
      CredentialsSignin: "Email/password login is disabled. Use Google sign-in.",
      SessionRequired: "Please sign in to access this page",
      default: "An error occurred during authentication",
    };

    return errorMessages[error] || errorMessages.default;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    
    try {
      await signIn("google", {
        callbackUrl: "/auth/post-login",
      });
    } catch (_error) {
      setErrorMessage("Failed to connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const displayError = errorMessage || getErrorMessage(urlError);

  return (
    <div className="relative min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.55),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <Image
                src="/assets/Logo.png"
                alt="Eventrix logo"
                fill
                className="object-cover"
                sizes="40px"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-slate-100">Eventrix</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Member login</p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sign in with Google to continue to your dashboard.
            </p>
          </div>

          {displayError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {displayError}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="mt-6 h-11 w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={isGoogleLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            New here? Use Google sign-in to create your account.
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Need help? Visit the{" "}
            <Link href="/contact" className="font-medium text-slate-900 underline underline-offset-4 dark:text-slate-100">
              support page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-slate-700 dark:border-slate-200"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
