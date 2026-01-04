"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

export function ImageUploader({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 w-full items-center justify-center text-sm text-gray-600 dark:text-gray-300">
            No banner selected
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/organizer/events/upload-image", {
              method: "POST",
              body: form,
            });
            const json = await res.json();
            const url = json?.data?.url as string | null;
            if (!res.ok || !url) {
              throw new Error("Upload failed");
            }
            onChange(url);
            toast({ title: "Image uploaded", variant: "success" });
          } catch {
            toast({ title: "Upload failed", description: "Please try again.", variant: "error" });
          } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload banner"}
        </Button>
      </div>
    </div>
  );
}
