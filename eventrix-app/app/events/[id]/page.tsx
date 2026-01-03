'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  EventHeader,
  EventInfo,
  OrganizerCard,
  Agenda,
  RelatedEvents,
  ShareButtons,
  RegisterButton,
} from '@/components/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Event, EventDetails } from '@/types/events';
import { useAuth } from '@/hooks/use-auth';
import { isEventFull, isRegistrationOpen } from '@/lib/events/event-utils';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [related, setRelated] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
  const [capacityFull, setCapacityFull] = useState<boolean | null>(null);

  const eventId = useMemo(() => (typeof params.id === 'string' ? params.id : ''), [params.id]);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent(eventId);
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !event || authLoading) return;
    checkRegistration(eventId);
  }, [eventId, event, authLoading]);

  const fetchEvent = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${id}`);

      if (response.status === 404) {
        setError('not-found');
        setEvent(null);
        setRelated([]);
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load event');
      }

      setEvent(result.data as EventDetails);
      fetchRelated(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelated = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}/related`);
      const result = await response.json();
      if (response.ok && result.success) {
        setRelated(result.data as Event[]);
      }
    } catch (error) {
      console.error('Unable to load related events', error);
    }
  };

  const checkRegistration = async (id: string) => {
    try {
      setCheckingRegistration(true);
      const response = await fetch(`/api/events/${id}/check-registration`);
      const result = await response.json();
      if (response.ok && result.success) {
        setIsRegistered(Boolean(result.data.registered));
        if (typeof result.data.registeredCount === 'number') {
          setEvent((prev) =>
            prev
              ? {
                  ...prev,
                  registeredCount: result.data.registeredCount ?? prev.registeredCount,
                }
              : prev
          );
        }
        setCapacityFull(
          typeof result.data.capacityFull === 'boolean' ? result.data.capacityFull : null
        );
        setRegistrationOpen(
          typeof result.data.canRegister === 'boolean' ? result.data.canRegister : null
        );
      }
    } catch (error) {
      console.error('Registration status check failed', error);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleRegistered = (payload?: { registeredCount?: number }) => {
    setIsRegistered(true);
    if (payload?.registeredCount !== undefined) {
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              registeredCount: payload.registeredCount ?? prev.registeredCount,
            }
          : prev
      );
    }
  };

  const showFull = capacityFull ?? (event ? isEventFull(event) : false);
  const canRegister = registrationOpen ?? (event ? isRegistrationOpen(event) : false);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading event details...
        </div>
      </main>
    );
  }

  if (error === 'not-found') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl rounded-3xl border bg-white p-10 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <p className="text-3xl">🔍</p>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Event not found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              The event you are looking for may have been removed or is unavailable.
            </p>
            <Button onClick={() => router.push('/events')} className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl rounded-3xl border bg-white p-10 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <p className="text-3xl">⚠️</p>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.push('/events')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => fetchEvent(eventId)}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!event) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/events')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Button>
          <ShareButtons title={event.title} />
        </div>

        <EventHeader
          event={event}
          actions={
            <RegisterButton
              eventId={event.id}
              isAuthenticated={isAuthenticated}
              isRegistered={isRegistered}
              isFull={showFull}
              isOpen={canRegister}
              onRegistered={handleRegistered}
            />
          }
        />

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <EventInfo event={event} />
            <Agenda items={event.agenda} />
            {event.highlights?.length ? (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">What to expect</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {event.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
                      >
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RegisterButton
                  eventId={event.id}
                  isAuthenticated={isAuthenticated}
                  isRegistered={isRegistered}
                  isFull={showFull}
                  isOpen={canRegister}
                  onRegistered={handleRegistered}
                />
                {!isAuthenticated && !checkingRegistration && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Login to save your spot and manage your registration.
                  </p>
                )}
                {checkingRegistration && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Checking your registration status...</p>
                )}
                {showFull && <p className="text-sm text-red-600 dark:text-red-400">Event is full.</p>}
                {!canRegister && !showFull && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Registration is not open for this event.</p>
                )}
              </CardContent>
            </Card>

            <OrganizerCard event={event} />
          </div>
        </section>

        <div className="mt-10">
          <RelatedEvents events={related} />
        </div>
      </div>
    </main>
  );
}
