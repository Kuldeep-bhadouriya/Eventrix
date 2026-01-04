import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Events",
};

export default async function DashboardEventsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fevents");

  return (
    <EmptyState
      title="My Events"
      description="This page will list your registered events. Use the Event Pass link from an event to view your QR code pass."
      action={
        <Button asChild>
          <Link href="/events">Browse events</Link>
        </Button>
      }
    />
  );
}
