import { prisma } from "@/lib/db";
import type { NotificationItem } from "@/types/notifications";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  if (!isDatabaseAvailable()) {
    return [
      {
        id: "mock-1",
        title: "Welcome to Eventrix",
        message: "Your dashboard is ready. Browse events and register to get started.",
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      read: true,
      createdAt: true,
    },
  });

  return items.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}
