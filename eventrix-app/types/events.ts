/**
 * Event Types
 * Type definitions for events throughout the application
 */

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EventCategory {
  TECHNOLOGY = 'TECHNOLOGY',
  SPORTS = 'SPORTS',
  ARTS = 'ARTS',
  BUSINESS = 'BUSINESS',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  MUSIC = 'MUSIC',
  FOOD = 'FOOD',
  OTHER = 'OTHER',
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  time: string;
  endTime?: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  organizerId: string;
  organizer?: {
    id: string;
    organizationName: string;
    logo?: string;
  };
  category: EventCategory;
  tags: string[];
  bannerUrl?: string;
  status: EventStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EventFilters {
  search?: string;
  category?: EventCategory;
  dateFrom?: string;
  dateTo?: string;
  status?: EventStatus;
  location?: string;
  page?: number;
  limit?: number;
  sort?: 'date' | 'popularity' | 'capacity' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface EventListResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: Date | string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED';
  checkInTime?: Date | string;
}
