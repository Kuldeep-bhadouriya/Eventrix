import Link from "next/link";
import { Compass, Award, CalendarDays } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <DashboardCard
      title="Quick Actions"
      description="Common things you might want to do"
      className="border-slate-200/90 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline" className="justify-start">
          <Link href="/events">
            <Compass className="h-4 w-4" />
            Browse Events
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/dashboard/certificates">
            <Award className="h-4 w-4" />
            Download Certificate
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/dashboard/events">
            <CalendarDays className="h-4 w-4" />
            View All Events
          </Link>
        </Button>
      </div>
    </DashboardCard>
  );
}
