import Link from "next/link";
import { Compass, Award, CalendarDays } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <DashboardCard
      title="Quick Actions"
      description="Common things you might want to do"
      className="border-gray-200 bg-white/70 dark:border-gray-800 dark:bg-gray-950/40"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="secondary" className="justify-start">
          <Link href="/events">
            <Compass className="h-4 w-4" />
            Browse Events
          </Link>
        </Button>

        <Button asChild variant="secondary" className="justify-start">
          <Link href="/dashboard/certificates">
            <Award className="h-4 w-4" />
            Download Certificate
          </Link>
        </Button>

        <Button asChild variant="secondary" className="justify-start">
          <Link href="/dashboard/my-events">
            <CalendarDays className="h-4 w-4" />
            View All Events
          </Link>
        </Button>
      </div>
    </DashboardCard>
  );
}
