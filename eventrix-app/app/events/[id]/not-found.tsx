import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebGLShader } from '@/components/ui/web-gl-shader';

export default function EventNotFound() {
  return (
    <main className="relative min-h-screen">
      <WebGLShader />
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white backdrop-blur">
            <h1 className="text-2xl font-bold">Event not found</h1>
            <p className="mt-2 text-white/80">
              The event you are looking for may have been removed or is not available.
            </p>
            <Button asChild className="mt-6">
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
