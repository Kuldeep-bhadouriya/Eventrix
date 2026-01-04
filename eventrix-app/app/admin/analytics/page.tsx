import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardSection title="Analytics" description="Platform analytics and advanced reports">
        <DashboardCard title="Analytics" description="Time period selector, exports, scheduled reports">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Analytics can be built from users/events/registrations data. If you want revenue analytics, we’ll need a payments model.
          </div>
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
