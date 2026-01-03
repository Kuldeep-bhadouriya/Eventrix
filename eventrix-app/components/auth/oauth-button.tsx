"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OAuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  provider: string;
  isLoading?: boolean;
}

export function OAuthButton({
  icon,
  provider,
  isLoading,
  className,
  children,
  ...props
}: OAuthButtonProps) {
  return (
    <button
      type="button"
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center w-full h-11 px-4 py-2",
        "border-2 border-gray-300 dark:border-gray-600 rounded-lg",
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "font-medium",
        className
      )}
      {...props}
    >
      {!isLoading && <span className="mr-2">{icon}</span>}
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
      ) : (
        children || `Continue with ${provider}`
      )}
    </button>
  );
}
