"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthCard,
  FormInput,
  FormButton,
  AlertMessage,
} from "@/components/auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validation-schemas";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setErrorMessage("Invalid or missing reset token");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage("Invalid reset token");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to reset password");
        return;
      }

      setSuccessMessage(
        "Password reset successfully! Redirecting to sign in..."
      );

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <AuthCard
        title="Invalid reset link"
        description="The password reset link is invalid or has expired"
        footer={{
          text: "Need a new link?",
          linkText: "Request password reset",
          linkHref: "/auth/forgot-password",
        }}
      >
        <AlertMessage
          type="error"
          message="This password reset link is invalid or has expired. Please request a new one."
          className="mb-6"
        />
        <div className="space-y-4">
          <Link href="/auth/forgot-password">
            <FormButton fullWidth>Request new reset link</FormButton>
          </Link>
          <Link href="/auth/login">
            <FormButton variant="outline" fullWidth>
              Back to sign in
            </FormButton>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your new password below"
      footer={{
        text: "Remember your password?",
        linkText: "Sign in",
        linkHref: "/auth/login",
      }}
    >
      {/* Success message */}
      {successMessage && (
        <AlertMessage
          type="success"
          message={successMessage}
          className="mb-6"
        />
      )}

      {/* Error message */}
      {errorMessage && (
        <AlertMessage type="error" message={errorMessage} className="mb-6" />
      )}

      {/* Reset password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="password"
          type="password"
          label="New password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          disabled={isLoading || !!successMessage}
          {...register("password")}
        />

        <FormInput
          id="confirmPassword"
          type="password"
          label="Confirm new password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          disabled={isLoading || !!successMessage}
          {...register("confirmPassword")}
        />

        <FormButton
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={!!successMessage}
        >
          Reset password
        </FormButton>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
