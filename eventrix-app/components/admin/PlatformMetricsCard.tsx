import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function PlatformMetricsCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <DashboardCard className="h-full">
      <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      {helper ? (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helper}</div>
      ) : null}
    </DashboardCard>
  );
}
