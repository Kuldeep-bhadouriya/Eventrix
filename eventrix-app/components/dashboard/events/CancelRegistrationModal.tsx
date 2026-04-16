"use client";

import { useEffect, useState } from "react";

import type { ApiEnvelope } from "@/components/dashboard/events/types";
import { Button } from "@/components/ui/button";

type Eligibility = {
  canCancel: boolean;
  reason?: string;
  policy?: {
    requiresConfirmation?: boolean;
    message?: string;
  };
};

export function CancelRegistrationModal({
  open,
  eventId,
  eventTitle,
  onClose,
  onConfirmed,
}: {
  open: boolean;
  eventId?: string;
  eventTitle?: string;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmPolicy, setConfirmPolicy] = useState(false);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !eventId) return;

    const controller = new AbortController();

    async function check() {
      setLoading(true);
      setError(null);
      setConfirmPolicy(false);

      try {
        const res = await fetch(`/api/events/${eventId}/can-cancel`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        const json = (await res.json()) as ApiEnvelope<Eligibility>;

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error?.message ?? "Could not verify cancellation policy.");
        }

        setEligibility(json.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Could not verify cancellation policy.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void check();
    return () => controller.abort();
  }, [eventId, open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  if (!open || !eventId) return null;

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/registration`, {
        method: "DELETE",
      });
      const json = (await res.json()) as ApiEnvelope<{ cancelled: boolean }>;

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Could not cancel registration.");
      }

      onConfirmed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel registration.");
    } finally {
      setSubmitting(false);
    }
  }

  const policyMessage = eligibility?.policy?.message;
  const canCancel = Boolean(eligibility?.canCancel);
  const requiresPolicyConfirmation = Boolean(eligibility?.policy?.requiresConfirmation);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-registration-title"
        aria-describedby="cancel-registration-description"
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-950"
      >
        <h2 id="cancel-registration-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Cancel registration
        </h2>

        <p id="cancel-registration-description" className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          You are about to cancel your registration for {eventTitle ?? "this event"}.
        </p>

        <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Checking cancellation policy...</p>
          ) : (
            <>
              {policyMessage ? (
                <p className="text-sm text-gray-700 dark:text-gray-200">{policyMessage}</p>
              ) : null}

              {!canCancel && eligibility?.reason ? (
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{eligibility.reason}</p>
              ) : null}

              {canCancel && requiresPolicyConfirmation ? (
                <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                    checked={confirmPolicy}
                    onChange={(event) => setConfirmPolicy(event.target.checked)}
                  />
                  <span>I understand the cancellation policy and want to continue.</span>
                </label>
              ) : null}
            </>
          )}
        </div>

        {error ? (
          <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={loading || submitting || !canCancel || (requiresPolicyConfirmation && !confirmPolicy)}
          >
            {submitting ? "Cancelling..." : "Confirm cancellation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
