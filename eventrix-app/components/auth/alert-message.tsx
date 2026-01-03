"use client";

import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertMessageProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

export function AlertMessage({
  type = "info",
  message,
  className,
}: AlertMessageProps) {
  const styles = {
    success: {
      container: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      text: "text-green-800 dark:text-green-200",
      Icon: CheckCircle,
    },
    error: {
      container: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      text: "text-red-800 dark:text-red-200",
      Icon: XCircle,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400",
      text: "text-yellow-800 dark:text-yellow-200",
      Icon: AlertCircle,
    },
    info: {
      container: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-800 dark:text-blue-200",
      Icon: Info,
    },
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        style.container,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", style.icon)} />
      <p className={cn("text-sm font-medium", style.text)}>{message}</p>
    </div>
  );
}
