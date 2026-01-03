/**
 * Unauthorized (403) Page
 * 
 * Displayed when a user tries to access a resource they don't have permission for
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { getDashboardUrl } from "@/lib/utils-shared";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard");

  useEffect(() => {
    if (user?.role) {
      setDashboardUrl(getDashboardUrl(user.role));
    }
  }, [user]);

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg border-4 border-red-100 dark:border-red-900">
              <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-8xl font-bold text-red-600 dark:text-red-400">
            403
          </h1>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
            Access Denied
          </p>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            You don&apos;t have permission to access this resource.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {user ? (
              <>
                You are signed in as <span className="font-semibold">{user.role}</span>.
                If you believe this is an error, please contact support.
              </>
            ) : (
              "Please sign in with an authorized account to access this resource."
            )}
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

          {user ? (
            <Link href={dashboardUrl}>
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
