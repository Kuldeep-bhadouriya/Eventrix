import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function WelcomeBanner({
  name,
}: {
  name: string;
}) {
  return (
    <DashboardCard className="border-gray-200 bg-white/70 dark:border-gray-800 dark:bg-gray-950/40">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Here’s a quick overview of your events and activity.
        </p>
      </div>
    </DashboardCard>
  );
}
