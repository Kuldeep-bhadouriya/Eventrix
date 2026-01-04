import { Card } from "@/components/ui/card";

export function WelcomeBanner({
  organizationName,
  logoUrl,
}: {
  organizationName: string;
  logoUrl?: string | null;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
              Logo
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm text-gray-600 dark:text-gray-300">Welcome back</div>
          <div className="truncate text-xl font-semibold text-gray-900 dark:text-gray-100">
            {organizationName}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Here’s what’s happening across your events.
          </div>
        </div>
      </div>
    </Card>
  );
}
