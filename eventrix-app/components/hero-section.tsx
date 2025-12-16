import { LiquidButton } from '@/components/ui/liquid-glass-button';

export function HeroSection() {
  return (
    <div className="relative border border-[#27272a] p-3 w-full mx-auto max-w-6xl z-10">
      <main className="relative border border-[#27272a] overflow-hidden px-8 md:px-12 lg:px-16 py-32 md:py-40 flex flex-col items-center gap-16 md:gap-18 lg:gap-20">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"> 
            <LiquidButton className="text-white border rounded-full" size={'xl'}>
              Get Started
            </LiquidButton>
            <button className="px-8 py-3 text-white/80 border border-white/20 rounded-full hover:bg-white/5 hover:text-white transition-all duration-300 text-base font-medium">
              Explore Events
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
