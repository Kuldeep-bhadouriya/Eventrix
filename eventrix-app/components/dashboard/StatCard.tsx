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
    <Card
      className={cn(
        "gap-0 border-slate-200/90 bg-white/90 py-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/70",
        className,
      )}
    >
      <CardContent className="px-6 py-5">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
      </CardContent>
    </Card>
  );
}
