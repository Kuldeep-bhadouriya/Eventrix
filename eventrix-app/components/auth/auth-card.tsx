"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  description?: string;
  footer?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
  className?: string;
}

export function AuthCard({
  children,
  title,
  description,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div
        className={cn(
          "w-full max-w-md space-y-8",
          "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8",
          "border border-gray-100 dark:border-gray-700",
          className
        )}
      >
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Eventrix
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">{children}</div>

        {/* Footer */}
        {footer && (
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {footer.text}{" "}
            <Link
              href={footer.linkHref}
              className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
