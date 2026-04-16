'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebGLShader } from '@/components/ui/web-gl-shader';

type EventDetailsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function EventDetailsError({ error, reset }: EventDetailsErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Event details route error:', error);
  }, [error]);

  return (
    <main className="relative min-h-screen">
      <WebGLShader />
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white backdrop-blur">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-300" />
            <h1 className="mt-4 text-2xl font-bold">Unable to load this event</h1>
            <p className="mt-2 text-white/80">Please try again or go back to the events list.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => router.push('/events')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
              </Button>
              <Button onClick={reset}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
