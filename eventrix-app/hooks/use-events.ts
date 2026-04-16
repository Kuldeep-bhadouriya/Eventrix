"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApiResponse, PaginationMeta } from '@/lib/api';
import type {
  Event,
  EventDetails,
  EventFilters,
  EventRegistrationStatus,
} from '@/types/events';

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

function buildEventsQuery(filters: EventFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);

  return params.toString();
}

function getApiErrorMessage(response: Response, payload?: ApiResponse) {
  if (payload?.error?.message) {
    return payload.error.message;
  }

  if (response.status === 404) {
    return 'Requested resource was not found.';
  }

  if (response.status === 401) {
    return 'Please log in to continue.';
  }

  return 'Unable to process request right now.';
}

export function useEvents(filters: EventFilters = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () =>
      buildEventsQuery({
        search: filters.search,
        category: filters.category,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        order: filters.order,
      }),
    [
      filters.search,
      filters.category,
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      filters.page,
      filters.limit,
      filters.sort,
      filters.order,
    ],
  );

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/events${query ? `?${query}` : ''}`);
      const payload = (await response.json()) as ApiResponse<Event[]>;

      if (!response.ok || !payload.success) {
        throw new Error(getApiErrorMessage(response, payload));
      }

      setEvents(payload.data ?? []);
      setPagination(payload.meta?.pagination ?? DEFAULT_PAGINATION);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load events.');
      setEvents([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    pagination,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}

export function useEvent(eventId?: string) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setError('Event id is required.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}`);
      const payload = (await response.json()) as ApiResponse<EventDetails>;

      if (!response.ok || !payload.success) {
        throw new Error(getApiErrorMessage(response, payload));
      }

      setEvent(payload.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load event details.');
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    isLoading,
    error,
    refetch: fetchEvent,
  };
}

export function useEventRegistration(eventId?: string) {
  const [status, setStatus] = useState<EventRegistrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!eventId) {
      setStatus(null);
      setError('Event id is required.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}/check-registration`);
      const payload = (await response.json()) as ApiResponse<EventRegistrationStatus>;

      if (!response.ok || !payload.success) {
        throw new Error(getApiErrorMessage(response, payload));
      }

      setStatus(payload.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to check registration status.');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}

interface RegisterEventResult {
  success: boolean;
  error?: string;
  data?: {
    registered?: boolean;
    alreadyRegistered?: boolean;
    registeredCount?: number;
    capacity?: number;
  };
}

export function useRegisterEvent() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (eventId: string): Promise<RegisterEventResult> => {
    try {
      setIsRegistering(true);
      setError(null);

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });

      const payload = (await response.json()) as ApiResponse<RegisterEventResult['data']>;

      if (!response.ok || !payload.success) {
        const message = getApiErrorMessage(response, payload);
        setError(message);
        return { success: false, error: message };
      }

      return { success: true, data: payload.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to register for event.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    register,
    isRegistering,
    error,
    clearError: () => setError(null),
  };
}
