import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  content: string;
  link?: string;
  className?: string;
}

export function InfoCard({
  icon: Icon,
  title,
  content,
  link,
  className = '',
}: InfoCardProps) {
  const cardContent = (
    <div className="flex items-start space-x-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="mb-1 font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-200">{content}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <Card className={`glass-effect bg-white/10 border-white/20 p-6 transition-all hover:shadow-lg ${className}`}>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {cardContent}
        </a>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect bg-white/10 border-white/20 p-6 ${className}`}>
      {cardContent}
    </Card>
  );
}
