import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EventSearch({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative w-full md:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, description, or venue"
        aria-label="Search registered events"
        className="pl-9 pr-10"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
