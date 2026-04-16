"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

import * as Sentry from "@sentry/nextjs";

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const payload: WebVitalsMetric = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    };

    if (process.env.NODE_ENV === "production") {
      Sentry.addBreadcrumb({
        category: "web-vitals",
        level: "info",
        data: payload,
        message: `${metric.name}=${metric.value.toFixed(2)} (${metric.rating})`,
      });
    }

    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && typeof window !== "undefined" && "gtag" in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", metric.name, {
        event_category: "Web Vitals",
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_rating: metric.rating,
      });
    }
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      Sentry.captureException(event.reason);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
