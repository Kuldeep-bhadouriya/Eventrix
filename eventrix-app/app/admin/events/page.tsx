import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <DashboardSection title="Events" description="Moderate and review events">
        <DashboardCard title="Event Moderation" description="Approvals, rejections, flagged events">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Event moderation UI depends on moderation status and reporting models. I can add the table + filters next once we confirm the DB fields for reports/flags.
          </div>
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
