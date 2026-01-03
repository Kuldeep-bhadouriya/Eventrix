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
  const CardContent = () => (
    <>
      <div className="flex items-start space-x-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{content}</p>
        </div>
      </div>
    </>
  );

  if (link) {
    return (
      <Card className={`p-6 transition-all hover:shadow-lg ${className}`}>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <CardContent />
        </a>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <CardContent />
    </Card>
  );
}
