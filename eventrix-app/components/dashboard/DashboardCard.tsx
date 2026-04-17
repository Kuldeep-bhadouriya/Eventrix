import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-slate-200/90 bg-white/90 py-0 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70",
        className,
      )}
    >
      {(title || description) && (
        <CardHeader className="border-b border-slate-200/90 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          {title && <CardTitle className="text-slate-900 dark:text-slate-100">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="px-6 py-5">{children}</CardContent>
    </Card>
  );
}
