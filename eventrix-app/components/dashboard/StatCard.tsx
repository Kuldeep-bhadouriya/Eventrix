import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <Card className={cn("border-gray-200 bg-white/70 dark:border-gray-800 dark:bg-gray-950/40", className)}>
      <CardContent className="px-6 py-5">
        <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      </CardContent>
    </Card>
  );
}
