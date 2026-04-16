import { Loader2 } from 'lucide-react';
import { WebGLShader } from '@/components/ui/web-gl-shader';

export default function EventDetailsLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <WebGLShader />
      <div className="glass-effect mx-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-white">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading event details...
      </div>
    </main>
  );
}
