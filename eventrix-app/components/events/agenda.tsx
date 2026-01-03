import { EventAgendaItem } from '@/types/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock3 } from 'lucide-react';

interface AgendaProps {
  items?: EventAgendaItem[];
}

export function Agenda({ items }: AgendaProps) {
  if (!items?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Agenda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.time}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center text-primary">
              <Clock3 className="h-4 w-4" />
              {index < items.length - 1 && <span className="mt-2 h-full w-px bg-primary/30" />}
            </div>
            <div className="space-y-1 rounded-lg border border-gray-100 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.time}</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</p>
              {item.speaker && <p className="text-sm text-gray-600 dark:text-gray-300">{item.speaker}</p>}
              {item.description && <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
