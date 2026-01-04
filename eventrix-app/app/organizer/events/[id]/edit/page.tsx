import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CreateEventForm } from "@/components/organizer/events/CreateEventForm";
import { organizerCreateEventSchema } from "@/lib/organizer/event-schemas";
import { z } from "zod";

export const metadata: Metadata = {
  title: "Edit Event",
};

type FormValues = z.infer<typeof organizerCreateEventSchema>;

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function OrganizerEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth(UserRole.ORGANIZER);
  const { id } = await params;

  if (!isDatabaseAvailable()) {
    notFound();
  }

  const organizer = await prisma.organizer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!organizer) notFound();

  const event = await prisma.event.findFirst({
    where: { id, organizerId: organizer.id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      date: true,
      time: true,
      endTime: true,
      venue: true,
      capacity: true,
      tags: true,
      bannerUrl: true,
      status: true,
    },
  });
  if (!event) notFound();

  return (
    <CreateEventForm
      mode="edit"
      initial={{
        id: event.id,
        title: event.title,
        description: event.description,
        details: {} as unknown as FormValues["details"],
        category: event.category,
        date: event.date.toISOString().slice(0, 10),
        time: event.time,
        endTime: event.endTime ?? "",
        venue: event.venue,
        capacity: event.capacity,
        tags: event.tags ?? [],
        bannerUrl: event.bannerUrl ?? "",
        status: event.status as FormValues["status"],
      }}
    />
  );
}
