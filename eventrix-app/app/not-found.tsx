/**
 * Not Found (404) Page
 * 
 * Displayed when a user tries to access a page that doesn't exist
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { getDashboardUrl } from "@/lib/utils-shared";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const dashboardUrl = user?.role ? getDashboardUrl(user.role) : "/";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(dashboardUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg border-4 border-primary/20 dark:border-primary/30">
              <FileQuestion className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
            Page Not Found
          </p>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            It might have been moved, deleted, or you may have mistyped the URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Link href={user ? dashboardUrl : "/"}>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              {user ? "Go to Dashboard" : "Go Home"}
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-sm">
                Browse Events
              </Button>
            </Link>
            {user ? (
              <>
                <Link href={dashboardUrl}>
                  <Button variant="ghost" size="sm" className="text-sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/events">
                  <Button variant="ghost" size="sm" className="text-sm">
                    My Events
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="text-sm">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Section (Optional) */}
        <div className="pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Let us know
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
