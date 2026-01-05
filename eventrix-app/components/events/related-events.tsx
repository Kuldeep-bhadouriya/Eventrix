import { Event } from '@/types/events';
import { EventCard } from '@/components/events/event-card';

interface RelatedEventsProps {
  events: Event[];
}

export function RelatedEvents({ events }: RelatedEventsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Related Events</h3>
      </div>
      {events.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="glass-effect rounded-xl border border-white/10 bg-white/10 p-6 text-sm text-white/80">
          No related events available yet.
        </div>
      )}
    </section>
  );
}
