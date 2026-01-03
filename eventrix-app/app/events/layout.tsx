import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events - Eventrix',
  description:
    'Discover and join amazing events. Browse through tech talks, workshops, conferences, sports events, and more.',
  keywords: [
    'events',
    'eventrix',
    'browse events',
    'upcoming events',
    'workshops',
    'conferences',
    'networking',
  ],
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
