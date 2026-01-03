'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  EventCard,
  EventCardSkeleton,
  SearchBar,
  FilterSidebar,
  SortDropdown,
} from '@/components/events';
import { Button } from '@/components/ui/button';
import { EventCategory, EventStatus, EventListResponse } from '@/types/events';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

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
  }, [search, category, status, dateRange, dateFrom, dateTo, sort, order, page, getDateRange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/events');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <section className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Discover Events
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Find and join amazing events happening around you
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              value={search}
              onChange={(value) => updateFilters({ search: value })}
              onClear={() => updateFilters({ search: '' })}
              placeholder="Search events by title, description, or venue..."
              className="sm:w-96"
            />

            <SortDropdown
              sortBy={sort}
              order={order}
              onSortChange={(newSort, newOrder) =>
                updateFilters({ sort: newSort, order: newOrder })
              }
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
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
              className="w-64"
            />

            {/* Events Grid */}
            <div className="flex-1">
              {/* Results Count */}
              {data && !isLoading && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  Found {data.pagination.total} event{data.pagination.total !== 1 ? 's' : ''}
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
                  <p className="text-red-800 dark:text-red-400">{error}</p>
                  <Button onClick={fetchEvents} variant="outline" className="mt-4">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && data && data.events.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    No events found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearAllFilters} variant="outline" className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Events Grid */}
              {!isLoading && !error && data && data.events.length > 0 && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {data.pagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => updateFilters({ page: (page - 1).toString() })}
                        disabled={!data.pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
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
                        })}
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <section className="border-b bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                  Discover Events
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  Find and join amazing events happening around you
                </p>
              </div>
            </div>
          </section>
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </section>
        </main>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
