"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { loginSchema, type LoginFormData } from "@/lib/validation-schemas";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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
      CredentialsSignin: "Invalid email or password",
      SessionRequired: "Please sign in to access this page",
      default: "An error occurred during authentication",
    };

    return errorMessages[error] || errorMessages.default;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        // Fetch session to check profile completion
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        
        if (session?.user) {
          // Redirect based on profile completion status
          if (!session.user.profileCompleted) {
            router.push("/auth/complete-profile");
          } else {
            router.push("/events");
          }
          router.refresh();
        }
      }
    } catch (_error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await signIn("google", { 
        redirect: false,
      });
      
      if (result?.ok) {
        // Fetch session to check profile completion
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        
        if (session?.user) {
          // Redirect based on profile completion status
          if (!session.user.profileCompleted) {
            router.push("/auth/complete-profile");
          } else {
            router.push("/events");
          }
          router.refresh();
        }
      }
    } catch (_error) {
      setErrorMessage("Failed to connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const displayError = errorMessage || getErrorMessage(urlError);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <WebGLShader />

      <Card
        className="max-w-md hover-lift shadow-2xl relative z-10 opacity-100 w-full mx-auto border-transparent"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(40px) saturate(250%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow:
            "0 32px 80px rgba(0, 0, 0, 0.3), 0 16px 64px rgba(255, 255, 255, 0.1), inset 0 3px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.2)",
        }}
      >
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold font-sans text-white">Welcome To Eventrix</CardTitle>
          <CardDescription className="text-white/80 font-sans">
            Sign in to your Eventrix account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error message */}
          {displayError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-sm">
              {displayError}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white font-sans">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="glass-effect h-11 border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                disabled={isLoading || isGoogleLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white font-sans">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="glass-effect h-11 border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                disabled={isLoading || isGoogleLoading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <LiquidButton
              type="submit"
              className="w-full text-white border rounded-full font-sans font-bold text-base"
              size="lg"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </LiquidButton>
          </form>

          <div className="relative">
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-white/70 font-sans">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full glass-effect border-white/30 hover-lift ripple-effect text-white hover:bg-white/20 font-sans transition-all duration-300"
              disabled={isLoading || isGoogleLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
          </div>

          <div className="text-center space-y-3">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-white hover:text-white/90 font-sans transition-colors block"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-white font-sans">
              New user? Sign in with Google to get started!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
