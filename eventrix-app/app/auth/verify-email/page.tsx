"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { AuthCard, FormButton, AlertMessage } from "@/components/auth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to verify email");
        setIsSuccess(false);
        return;
      }

      setIsSuccess(true);
      setErrorMessage(null);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (_error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setErrorMessage("Email address is required to resend verification");
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to resend verification email");
        return;
      }

      setResendSuccess(true);
    } catch (_error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Verifying state
  if (isVerifying) {
    return (
      <AuthCard title="Verifying your email" description="Please wait...">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-16 w-16 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your email address...
          </p>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthCard
        title="Email verified!"
        description="Your email has been successfully verified"
        footer={{
          text: "Ready to get started?",
          linkText: "Sign in",
          linkHref: "/auth/login",
        }}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6 rounded-full bg-green-100 dark:bg-green-950 p-6">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verification successful!
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Your email has been verified. You can now sign in to your account.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to sign in...
          </p>
        </div>
      </AuthCard>
    );
  }

  // Error state with token
  if (token && errorMessage) {
    return (
      <AuthCard
        title="Verification failed"
        description="We couldn&apos;t verify your email address"
        footer={{
          text: "Need help?",
          linkText: "Contact support",
          linkHref: "/contact",
        }}
      >
        <AlertMessage type="error" message={errorMessage} className="mb-6" />

        <div className="space-y-4">
          {email && (
            <>
              {resendSuccess ? (
                <AlertMessage
                  type="success"
                  message="Verification email sent! Please check your inbox."
                  className="mb-4"
                />
              ) : (
                <FormButton
                  fullWidth
                  onClick={handleResendEmail}
                  isLoading={isResending}
                >
                  Resend verification email
                </FormButton>
              )}
            </>
          )}
          <Link href="/auth/login">
            <FormButton variant="outline" fullWidth>
              Back to sign in
            </FormButton>
          </Link>
        </div>
      </AuthCard>
    );
  }

  // Waiting for verification (no token provided)
  return (
    <AuthCard
      title="Verify your email"
      description="Check your inbox for the verification link"
      footer={{
        text: "Already verified?",
        linkText: "Sign in",
        linkHref: "/auth/login",
      }}
    >
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-6 rounded-full bg-purple-100 dark:bg-purple-950 p-6">
          <Mail className="h-16 w-16 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Check your email
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
          We&apos;ve sent a verification link to <strong>{email || "your email"}</strong>.
          Click the link in the email to verify your account.
        </p>

        {/* Resend verification */}
        <div className="w-full space-y-4">
          {resendSuccess ? (
            <AlertMessage
              type="success"
              message="Verification email sent! Please check your inbox."
            />
          ) : (
            <>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Didn&apos;t receive the email?
              </p>
              {email && (
                <FormButton
                  fullWidth
                  variant="outline"
                  onClick={handleResendEmail}
                  isLoading={isResending}
                >
                  Resend verification email
                </FormButton>
              )}
            </>
          )}
        </div>

        {errorMessage && (
          <AlertMessage type="error" message={errorMessage} className="mt-4" />
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
