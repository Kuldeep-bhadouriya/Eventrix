import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  label: string;
}

interface TOCProps {
  items: TocItem[];
  title?: string;
  className?: string;
}

export function TOC({ items, title = 'On this page', className }: TOCProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label={title}
      className={cn(
        'glass-effect rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md',
        className,
      )}
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">{title}</h2>
      <ol className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}