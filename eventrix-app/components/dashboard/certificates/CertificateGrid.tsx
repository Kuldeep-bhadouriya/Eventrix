"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { CertificateListItem } from "@/types/certificates";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CertificateCard } from "@/components/dashboard/certificates/CertificateCard";
import { CertificateFilter } from "@/components/dashboard/certificates/CertificateFilter";
import { CertificatePreview } from "@/components/dashboard/certificates/CertificatePreview";
import { Button } from "@/components/ui/button";

export function CertificateGrid({ certificates }: { certificates: CertificateListItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc">("date_desc");
  const [selected, setSelected] = useState<CertificateListItem | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach((c) => {
      if (c.event.category) set.add(c.event.category);
    });
    return Array.from(set).sort();
  }, [certificates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = certificates;

    if (q) {
      items = items.filter((c) => c.event.title.toLowerCase().includes(q));
    }

    if (category) {
      items = items.filter((c) => c.event.category === category);
    }

    items = [...items].sort((a, b) => {
      const da = new Date(a.issuedAt).getTime();
      const db = new Date(b.issuedAt).getTime();
      return sort === "date_desc" ? db - da : da - db;
    });

    return items;
  }, [certificates, search, category, sort]);

  if (certificates.length === 0) {
    return (
      <EmptyState
        title="No certificates yet"
        description="Earn certificates by attending events you've registered for."
        action={
          <Button asChild>
            <Link href="/events">Browse events</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CertificateFilter
          search={search}
          onSearchChange={setSearch}
          category={category}
          categories={categories}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CertificateCard
              key={c.id}
              certificate={c}
              onView={() => setSelected(c)}
              onDownload={() => {
                // Minimal: open preview URL if present.
                if (c.previewUrl) window.open(c.previewUrl, "_blank", "noopener,noreferrer");
              }}
              onShare={() => setSelected(c)}
            />
          ))}
        </div>
      )}

      {selected ? (
        <CertificatePreview certificate={selected} open={true} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
