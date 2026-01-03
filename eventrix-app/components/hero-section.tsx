'use client';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative border border-[#27272a] !p-3 !pb-3 w-full mx-auto max-w-6xl z-10">
      <main className="relative border border-[#27272a] overflow-hidden px-8 md:px-12 lg:px-16 py-16 md:py-20 !pb-16 md:!pb-16 flex flex-col items-center gap-12 md:gap-14">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center gap-6 md:gap-8">
          {/* Hero Headline */}
          <h1 className="text-white text-5xl font-extrabold tracking-tighter leading-tight md:text-6xl lg:text-7xl">
            Manage Events. End to End. Effortlessly.
          </h1>
          
          {/* Subheadline */}
          <p className="text-white/70 text-base md:text-lg lg:text-xl max-w-3xl">
            Create events, handle registrations, issue QR passes, and deliver certificates — all from one powerful platform.
          </p>
          
          {/* Status Line */}
          <div className="flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p className="text-sm text-green-500 font-medium">Live for Colleges, Clubs, and Communities</p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center justify-center"> 
            <LiquidButton 
              className="text-white border rounded-full !px-20 text-lg font-semibold" 
              size={'xl'}
              onClick={() => router.push('/auth/login')}
            >
              Join Eventrix
            </LiquidButton>
          </div>
        </div>
      </main>
    </div>
  );
}
