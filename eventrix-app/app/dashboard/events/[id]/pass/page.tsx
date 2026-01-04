import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { getEventPassForUser } from "@/lib/dashboard/event-pass-queries";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { EventPass } from "@/components/dashboard/events/EventPass";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Event Pass",
};

export default async function EventPassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=%2Fdashboard");
  }

  const { id: eventId } = await params;
  const pass = await getEventPassForUser({ userId: session.user.id, eventId });

  if (!pass) {
    return (
      <EmptyState
        title="Pass not found"
        description="You may not be registered for this event, or the event does not exist."
        action={
          <Button asChild>
            <Link href="/events">Browse events</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Event Pass</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Keep this pass handy for check-in.
        </p>
      </div>

      <EventPass pass={pass} />
    </div>
  );
}
