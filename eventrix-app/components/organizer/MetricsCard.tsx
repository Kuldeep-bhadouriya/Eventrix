import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricsCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{hint}</div>
      ) : null}
    </Card>
  );
}
