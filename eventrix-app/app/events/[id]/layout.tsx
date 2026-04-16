import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Details - Eventrix',
  description:
    'View complete event details including schedule, venue, organizer information, and registration status on Eventrix.',
  keywords: ['event details', 'register event', 'event schedule', 'eventrix'],
};

export default function EventDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
