import Link from "next/link";
import { PlusCircle, CalendarDays, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActionsPanel() {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick actions</div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button asChild className="justify-start gap-2">
          <Link href="/organizer/events/create">
            <PlusCircle className="h-4 w-4" />
            Create New Event
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/organizer/events">
            <CalendarDays className="h-4 w-4" />
            View All Events
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/organizer/participants">
            <Users className="h-4 w-4" />
            Manage Participants
          </Link>
        </Button>
      </div>
    </Card>
  );
}
