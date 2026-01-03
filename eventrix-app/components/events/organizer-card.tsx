import { EventDetails } from '@/types/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Globe2 } from 'lucide-react';

interface OrganizerCardProps {
  event: EventDetails;
}

export function OrganizerCard({ event }: OrganizerCardProps) {
  const organizer = event.organizer;

  if (!organizer) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Organizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {organizer.organizationName}
          </p>
          {organizer.description && <p className="mt-1 text-sm">{organizer.description}</p>}
        </div>

        <div className="flex flex-col gap-2">
          {organizer.contactEmail && (
            <a
              href={`mailto:${organizer.contactEmail}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              {organizer.contactEmail}
            </a>
          )}
          {organizer.contactPhone && (
            <a href={`tel:${organizer.contactPhone}`} className="flex items-center gap-2 text-primary hover:underline">
              <Phone className="h-4 w-4" />
              {organizer.contactPhone}
            </a>
          )}
          {organizer.website && (
            <a
              href={organizer.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Globe2 className="h-4 w-4" />
              {organizer.website}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
