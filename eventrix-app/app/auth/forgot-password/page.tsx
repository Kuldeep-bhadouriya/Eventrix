"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import {
  AuthCard,
  FormInput,
  FormButton,
  AlertMessage,
} from "@/components/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validation-schemas";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to send reset email");
        return;
      }

      setSuccessMessage(
        "If an account exists with this email, you will receive a password reset link shortly."
      );
    } catch (_error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot password?"
      description="Enter your email address and we&apos;ll send you a link to reset your password"
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

      {/* Info message */}
      {!successMessage && !errorMessage && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            We&apos;ll send you an email with instructions to reset your password.
          </p>
        </div>
      )}

      {/* Forgot password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          disabled={isLoading || !!successMessage}
          {...register("email")}
        />

        <FormButton
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={!!successMessage}
        >
          Send reset link
        </FormButton>
      </form>

      {/* Additional links */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
