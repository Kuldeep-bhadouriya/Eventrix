"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";
import { organizerCreateEventSchema } from "@/lib/organizer/event-schemas";
import { StepIndicator } from "@/components/organizer/events/StepIndicator";
import { DraftSaveIndicator } from "@/components/organizer/events/DraftSaveIndicator";
import { ImageUploader } from "@/components/organizer/events/ImageUploader";

type FormValues = z.infer<typeof organizerCreateEventSchema>;
type Details = NonNullable<FormValues["details"]>;

const STEPS = [
  "Basic Info",
  "Date & Venue",
  "Capacity & Registration",
  "Media & Details",
  "Review & Publish",
];

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

export function CreateEventForm({
  initial,
  mode,
}: {
  initial?: Partial<FormValues> & { id?: string };
  mode: "create" | "edit";
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(initial?.id ?? null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const form = useForm<FormValues>({
    resolver: zodResolver(organizerCreateEventSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "OTHER",
      date: initial?.date ?? "",
      time: initial?.time ?? "",
      endTime: initial?.endTime ?? "",
      venue: initial?.venue ?? "",
      capacity: initial?.capacity ?? 50,
      tags: initial?.tags ?? [],
      bannerUrl: initial?.bannerUrl ?? "",
      details: ((initial?.details ?? {}) as Details) satisfies Details,
      status: initial?.status ?? "DRAFT",
    },
    mode: "onBlur",
  });

  const watched = form.watch();
  const canGoPrev = step > 0;
  const isLast = step === STEPS.length - 1;

  const stepFields = useMemo(() => {
    const base: Array<Array<FieldPath<FormValues>>> = [
      ["title", "description", "category"],
      ["date", "time", "endTime", "venue"],
      ["capacity"],
      ["bannerUrl", "tags", "details"],
      [],
    ];
    return base;
  }, []);

  const saveDraft = useMemo(
    () =>
      debounce(async (values: FormValues) => {
        setDraftStatus("saving");
        try {
          const res = await fetch("/api/organizer/events/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ draftId, data: values }),
          });
          const json = await res.json();
          const nextId = json?.data?.draftId as string | undefined;
          if (!res.ok || !nextId) throw new Error("Draft save failed");
          setDraftId(nextId);
          setDraftStatus("saved");
        } catch {
          setDraftStatus("error");
        }
      }, 900),
    [draftId],
  );

  useEffect(() => {
    if (!watched) return;
    if (step === STEPS.length - 1) return;
    saveDraft(watched as FormValues);
  }, [watched, step, saveDraft]);

  async function next() {
    const fields = stepFields[step] ?? [];
    const ok = fields.length ? await form.trigger(fields, { shouldFocus: true }) : true;
    if (!ok) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function publish() {
    const ok = await form.trigger();
    if (!ok) return;

    try {
      const payload = form.getValues();
      const method = mode === "edit" ? "PUT" : "POST";
      const url = mode === "edit" && draftId ? `/api/organizer/events/${draftId}` : "/api/organizer/events";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: "PUBLISHED" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Publish failed");
      toast({ title: mode === "edit" ? "Event updated" : "Event created", variant: "success" });
      window.location.href = "/organizer/events";
    } catch {
      toast({ title: "Could not publish", description: "Please fix errors and try again.", variant: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {mode === "edit" ? "Edit event" : "Create event"}
          </div>
          <DraftSaveIndicator status={draftStatus} />
        </div>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <Card className="p-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {step === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title ? (
                  <div className="text-xs text-red-600">{form.formState.errors.title.message}</div>
                ) : null}
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-28 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-950 dark:focus:ring-gray-100/10"
                  {...form.register("description")}
                />
                {form.formState.errors.description ? (
                  <div className="text-xs text-red-600">{form.formState.errors.description.message}</div>
                ) : null}
              </div>

              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. TECHNOLOGY" {...form.register("category")} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...form.register("date")} />
                {form.formState.errors.date ? (
                  <div className="text-xs text-red-600">{form.formState.errors.date.message}</div>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" {...form.register("time")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endTime">End time</Label>
                <Input id="endTime" type="time" {...form.register("endTime")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" {...form.register("venue")} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" min={1} {...form.register("capacity")} />
                {form.formState.errors.capacity ? (
                  <div className="text-xs text-red-600">{form.formState.errors.capacity.message}</div>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={(form.getValues("tags") ?? []).join(", ")}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    form.setValue("tags", tags, { shouldDirty: true });
                  }}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Banner</div>
                <div className="mt-2">
                  <ImageUploader
                    value={form.getValues("bannerUrl") || undefined}
                    onChange={(url) => form.setValue("bannerUrl", url, { shouldDirty: true })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="subCategory">Sub-category</Label>
                  <Input
                    id="subCategory"
                    value={(form.getValues("details") as Details | undefined)?.subCategory ?? ""}
                    onChange={(e) => {
                      const details = ((form.getValues("details") ?? {}) as Details) satisfies Details;
                      form.setValue("details", { ...details, subCategory: e.target.value }, { shouldDirty: true });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={(form.getValues("details") as Details | undefined)?.address ?? ""}
                    onChange={(e) => {
                      const details = ((form.getValues("details") ?? {}) as Details) satisfies Details;
                      form.setValue("details", { ...details, address: e.target.value }, { shouldDirty: true });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="terms">Terms</Label>
                  <textarea
                    id="terms"
                    className="min-h-24 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-950 dark:focus:ring-gray-100/10"
                    value={(form.getValues("details") as Details | undefined)?.terms ?? ""}
                    onChange={(e) => {
                      const details = ((form.getValues("details") ?? {}) as Details) satisfies Details;
                      form.setValue("details", { ...details, terms: e.target.value }, { shouldDirty: true });
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Review</div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div><span className="font-medium">Title:</span> {form.getValues("title") || "—"}</div>
                  <div><span className="font-medium">Category:</span> {form.getValues("category") || "—"}</div>
                  <div><span className="font-medium">Date:</span> {form.getValues("date") || "—"}</div>
                  <div><span className="font-medium">Time:</span> {form.getValues("time") || "—"}</div>
                  <div className="sm:col-span-2"><span className="font-medium">Venue:</span> {form.getValues("venue") || "—"}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="button" variant="outline" onClick={prev} disabled={!canGoPrev}>
              Back
            </Button>

            {!isLast ? (
              <Button type="button" onClick={next}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={publish}>
                Publish
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
