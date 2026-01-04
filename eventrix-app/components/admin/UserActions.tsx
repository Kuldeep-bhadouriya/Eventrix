"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function UserActions({ userId }: { userId: string }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/users/${userId}`}>View</Link>
      </Button>
    </div>
  );
}
