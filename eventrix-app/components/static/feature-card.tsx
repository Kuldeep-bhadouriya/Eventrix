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
    <Card className={`p-6 transition-all hover:shadow-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/15 hover:border-white/30 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          {title}
        </h3>
        <p className="text-gray-200">{description}</p>
      </div>
    </Card>
  );
}
