import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <DashboardSection title="Reports" description="Reported events/users and moderation queue">
        <DashboardCard title="Reports" description="Report list, details, and status actions">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Reports require a reporting model (reported entity, reason, status, notes). Confirm the fields you want and I’ll implement the full flow.
          </div>
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
