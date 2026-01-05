'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  EventCard,
  EventCardSkeleton,
  SearchBar,
  FilterSidebar,
  SortDropdown,
} from '@/components/events';
import { Button } from '@/components/ui/button';
import { FooterSection } from '@/components/static';
import { EventCategory, EventStatus, EventListResponse } from '@/types/events';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { WebGLShader } from '@/components/ui/web-gl-shader';

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [data, setData] = useState<EventListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL
  const search = searchParams.get('search') || '';
  const category = (searchParams.get('category') as EventCategory) || '';
  const status = (searchParams.get('status') as EventStatus) || '';
  const dateRange = (searchParams.get('dateRange') as 'all' | 'today' | 'week' | 'month' | 'custom') || 'all';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const sort = (searchParams.get('sort') as 'date' | 'popularity' | 'capacity' | 'createdAt') || 'date';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Update URL with new filters
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if (!updates.page) {
        params.set('page', '1');
      }

      router.push(`/events?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Calculate date range
  const getDateRange = useCallback(() => {
    const today = new Date();
    let from = '';
    let to = '';

    switch (dateRange) {
      case 'today':
        from = format(today, 'yyyy-MM-dd');
        to = format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        from = format(startOfWeek(today), 'yyyy-MM-dd');
        to = format(endOfWeek(today), 'yyyy-MM-dd');
        break;
      case 'month':
        from = format(startOfMonth(today), 'yyyy-MM-dd');
        to = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'custom':
        from = dateFrom;
        to = dateTo;
        break;
    }

    return { from, to };
  }, [dateRange, dateFrom, dateTo]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);

      const { from, to } = getDateRange();
      if (from) params.set('dateFrom', from);
      if (to) params.set('dateTo', to);

      params.set('sort', sort);
      params.set('order', order);
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await fetch(`/api/events?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result = await response.json();

      if (result.success) {
        setData({
          events: result.data,
          pagination: result.meta.pagination,
        });
      } else {
        throw new Error(result.error?.message || 'Failed to fetch events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, status, sort, order, page, getDateRange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/events');
  };

  return (
    <main className="relative min-h-screen">
      <WebGLShader />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
              Discover Events
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
              className="mt-6 text-lg text-gray-200"
            >
              Find and join amazing events happening around you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="mt-10"
            >
              <div className="glass-effect mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl bg-white/10 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <SearchBar
                  value={search}
                  onChange={(value) => updateFilters({ search: value })}
                  onClear={() => updateFilters({ search: '' })}
                  placeholder="Search events by title, description, or venue..."
                  className="w-full sm:max-w-md"
                  inputClassName="glass-effect h-11 border-white/30 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                  iconClassName="text-white/60"
                />

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                  <SortDropdown
                    sortBy={sort}
                    order={order}
                    onSortChange={(newSort, newOrder) =>
                      updateFilters({ sort: newSort, order: newOrder })
                    }
                    labelClassName="text-white/80"
                    selectClassName="glass-effect h-11 border-white/20 bg-gray-950/80 text-white focus-visible:ring-white/30"
                    buttonClassName="glass-effect h-11 border-white/20 bg-gray-950/80 text-white hover:bg-gray-900/80"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative bg-background/50 backdrop-blur-sm pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_1fr]">
            {/* Filters Sidebar */}
            <div>
              <FilterSidebar
                category={category}
                status={status}
                dateRange={dateRange}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onCategoryChange={(value) => updateFilters({ category: value })}
                onStatusChange={(value) => updateFilters({ status: value })}
                onDateRangeChange={(value) => updateFilters({ dateRange: value })}
                onDateFromChange={(value) => updateFilters({ dateFrom: value })}
                onDateToChange={(value) => updateFilters({ dateTo: value })}
                onClearAll={clearAllFilters}
                className="w-full"
                cardClassName="glass-effect border-white/20 bg-white/10 text-white"
                titleClassName="text-white"
                controlLabelClassName="text-white/80"
                optionTextClassName="text-white/80"
                selectClassName="glass-effect h-11 border-white/20 bg-white/10 text-white focus-visible:ring-white/30"
                dateInputClassName="glass-effect border-white/20 bg-white/10 text-white focus-visible:ring-white/30"
                clearButtonClassName="text-white/80 hover:text-white"
              />
            </div>

            {/* Events */}
            <div className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                {data && !isLoading ? (
                  <p className="text-sm text-white/80">
                    Found {data.pagination.total} event{data.pagination.total !== 1 ? 's' : ''}
                  </p>
                ) : (
                  <span />
                )}
              </div>

              <AnimatePresence mode="wait">
                {/* Loading State */}
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <EventCardSkeleton key={i} />
                    ))}
                  </motion.div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="glass-effect rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-white"
                  >
                    <p className="text-white/90">{error}</p>
                    <Button onClick={fetchEvents} variant="outline" className="mt-4">
                      Try Again
                    </Button>
                  </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && !error && data && data.events.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="glass-effect rounded-2xl border border-white/10 bg-white/10 p-12 text-center text-white"
                  >
                    <Calendar className="mx-auto h-16 w-16 text-white/60" />
                    <h3 className="mt-4 text-lg font-semibold text-white">No events found</h3>
                    <p className="mt-2 text-white/80">Try adjusting your filters or search query.</p>
                    <Button onClick={clearAllFilters} variant="outline" className="mt-4">
                      Clear Filters
                    </Button>
                  </motion.div>
                )}

                {/* Events Grid */}
                {!isLoading && !error && data && data.events.length > 0 && (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {data.events.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(index * 0.03, 0.18) }}
                          className="hover-lift"
                        >
                          <EventCard event={event} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => updateFilters({ page: (page - 1).toString() })}
                          disabled={!data.pagination.hasPrev}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, data.pagination.totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (data.pagination.totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= data.pagination.totalPages - 2) {
                                pageNum = data.pagination.totalPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }

                              return (
                                <Button
                                  key={pageNum}
                                  variant={page === pageNum ? 'default' : 'outline'}
                                  onClick={() => updateFilters({ page: pageNum.toString() })}
                                  className="h-10 w-10 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            },
                          )}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => updateFilters({ page: (page + 1).toString() })}
                          disabled={!data.pagination.hasNext}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <div className="relative bg-background">
        <FooterSection />
      </div>
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen">
          <WebGLShader />
          <section className="relative overflow-hidden py-16 sm:py-20">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Discover Events
                </h1>
                <p className="mt-6 text-lg text-gray-200">
                  Find and join amazing events happening around you.
                </p>
              </div>
            </div>
          </section>
          <section className="relative bg-background/50 backdrop-blur-sm pb-16 sm:pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </section>
          <div className="relative bg-background">
            <FooterSection />
          </div>
        </main>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
