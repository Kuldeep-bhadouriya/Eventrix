import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = '',
}: FeatureCardProps) {
  return (
    <Card
      className={`border-white/20 bg-slate-900/80 p-4 shadow-sm transition-colors sm:bg-white/10 sm:p-6 sm:transition-all sm:backdrop-blur-md md:hover:shadow-xl md:hover:bg-white/15 md:hover:border-white/30 ${className}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-blue-500/10 sm:mb-4 sm:h-12 sm:w-12 sm:bg-gradient-to-br sm:from-blue-500/20 sm:to-purple-500/20 sm:backdrop-blur-sm">
          <Icon className="h-5 w-5 text-blue-300 sm:h-6 sm:w-6 sm:text-blue-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white sm:text-xl">{title}</h3>
        <p className="text-sm text-gray-200 sm:text-base">{description}</p>
      </div>
    </Card>
  );
}
