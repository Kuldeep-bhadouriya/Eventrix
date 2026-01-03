"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import {
  AuthCard,
  FormInput,
  FormButton,
  OAuthButton,
  AlertMessage,
  Divider,
} from "@/components/auth";
import { signupSchema, type SignupFormData } from "@/lib/validation-schemas";

export default function SignUpPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "STUDENT",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to create account");
        return;
      }

      setSuccessMessage(
        "Account created successfully! Please check your email to verify your account."
      );

      // Redirect to verification page after 3 seconds
      setTimeout(() => {
        router.push("/auth/verify-email?email=" + encodeURIComponent(data.email));
      }, 3000);
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      setErrorMessage("Failed to connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Join Eventrix and start discovering events"
      footer={{
        text: "Already have an account?",
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

      {/* OAuth providers */}
      <OAuthButton
        icon={
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        }
        provider="Google"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        disabled={isLoading}
      />

      <Divider />

      {/* Signup form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          id="name"
          type="text"
          label="Full name"
          placeholder="John Doe"
          autoComplete="name"
          required
          error={errors.name?.message}
          disabled={isLoading || isGoogleLoading}
          {...register("name")}
        />

        <FormInput
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          disabled={isLoading || isGoogleLoading}
          {...register("email")}
        />

        <FormInput
          id="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          disabled={isLoading || isGoogleLoading}
          {...register("password")}
        />

        <FormInput
          id="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          disabled={isLoading || isGoogleLoading}
          {...register("confirmPassword")}
        />

        {/* Role selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                watch("role") === "STUDENT"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950 dark:border-purple-500"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
              }`}
            >
              <input
                type="radio"
                value="STUDENT"
                className="sr-only"
                disabled={isLoading || isGoogleLoading}
                {...register("role")}
              />
              <div className="text-center">
                <div className="text-2xl mb-1">🎓</div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  Student
                </div>
              </div>
            </label>

            <label
              className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                watch("role") === "ORGANIZER"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950 dark:border-purple-500"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
              }`}
            >
              <input
                type="radio"
                value="ORGANIZER"
                className="sr-only"
                disabled={isLoading || isGoogleLoading}
                {...register("role")}
              />
              <div className="text-center">
                <div className="text-2xl mb-1">👔</div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  Organizer
                </div>
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start gap-2">
          <input
            id="acceptTerms"
            type="checkbox"
            disabled={isLoading || isGoogleLoading}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
            {...register("acceptTerms")}
          />
          <label
            htmlFor="acceptTerms"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.acceptTerms.message}
          </p>
        )}

        <FormButton
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isGoogleLoading || !!successMessage}
        >
          Create account
        </FormButton>
      </form>
    </AuthCard>
  );
}
