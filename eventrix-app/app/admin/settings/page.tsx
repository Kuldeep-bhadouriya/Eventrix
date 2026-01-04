import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardSection title="Settings" description="System settings, templates, and notifications">
        <DashboardCard title="Settings" description="General, event, user, email, notification, security, API">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Settings + email templates + notification scheduling require persistent storage models. If you want these stored in DB, I’ll add Prisma models and implement the tabs and autosave.
          </div>
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
