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
    <Card className={cn("py-0", className)}>
      {(title || description) && (
        <CardHeader className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="px-6 py-4">{children}</CardContent>
    </Card>
  );
}
