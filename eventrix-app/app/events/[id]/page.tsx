'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { FooterSection } from '@/components/static';

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

  const fetchRelated = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}/related`);
      const result = await response.json();
      if (response.ok && result.success) {
        setRelated(result.data as Event[]);
      }
    } catch (error) {
      console.error('Unable to load related events', error);
    }
  }, []);

  const fetchEvent = useCallback(
    async (id: string) => {
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
    },
    [fetchRelated],
  );

  const checkRegistration = useCallback(async (id: string) => {
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
                  registeredCount:
                    result.data.registeredCount ?? prev.registeredCount,
                }
              : prev,
          );
        }
        setCapacityFull(
          typeof result.data.capacityFull === 'boolean'
            ? result.data.capacityFull
            : null,
        );
        setRegistrationOpen(
          typeof result.data.canRegister === 'boolean'
            ? result.data.canRegister
            : null,
        );
      }
    } catch (error) {
      console.error('Registration status check failed', error);
    } finally {
      setCheckingRegistration(false);
    }
  }, []);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent(eventId);
  }, [eventId, fetchEvent]);

  useEffect(() => {
    if (!eventId || !event || authLoading) return;
    checkRegistration(eventId);
  }, [eventId, event, authLoading, checkRegistration]);

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
      <main className="relative flex min-h-screen items-center justify-center">
        <WebGLShader />
        <div className="glass-effect mx-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-white">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading event details...
        </div>
      </main>
    );
  }

  if (error === 'not-found') {
    return (
      <main className="relative min-h-screen">
        <WebGLShader />
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="glass-effect rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white">
                <p className="text-3xl">🔍</p>
                <h1 className="mt-4 text-2xl font-bold">Event not found</h1>
                <p className="mt-2 text-white/80">
                  The event you are looking for may have been removed or is unavailable.
                </p>
                <Button onClick={() => router.push('/events')} className="mt-6">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                </Button>
              </div>
            </div>
          </div>
        </section>
        <div className="relative bg-background">
          <FooterSection />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen">
        <WebGLShader />
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="glass-effect rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white">
                <p className="text-3xl">⚠️</p>
                <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
                <p className="mt-2 text-white/80">{error}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={() => router.push('/events')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => fetchEvent(eventId)}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="relative bg-background">
          <FooterSection />
        </div>
      </main>
    );
  }

  if (!event) return null;

  return (
    <main className="relative min-h-screen">
      <WebGLShader />

      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-14">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
              <Button
                variant="ghost"
                onClick={() => router.push('/events')}
                className="glass-effect gap-2 border border-white/10 bg-white/10 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" /> Back to events
              </Button>
              <div className="glass-effect rounded-xl border border-white/10 bg-white/10 px-2 py-1">
                <ShareButtons title={event.title} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative bg-background/50 backdrop-blur-sm pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.section
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-8 grid gap-6 lg:grid-cols-3"
              >
                <div className="space-y-6 lg:col-span-2">
                  <div className="hover-lift">
                    <EventInfo event={event} />
                  </div>
                  <div className="hover-lift">
                    <Agenda items={event.agenda} />
                  </div>
                  {event.highlights?.length ? (
                    <Card className="hover-lift">
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
                              <span
                                className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"
                                aria-hidden
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>

                <div className="space-y-6">
                  <Card className="hover-lift">
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
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Checking your registration status...
                        </p>
                      )}
                      {showFull && (
                        <p className="text-sm text-red-600 dark:text-red-400">Event is full.</p>
                      )}
                      {!canRegister && !showFull && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Registration is not open for this event.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="hover-lift">
                    <OrganizerCard event={event} />
                  </div>
                </div>
              </motion.section>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
              className="mt-10"
            >
              <RelatedEvents events={related} />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative bg-background">
        <FooterSection />
      </div>
    </main>
  );
}
