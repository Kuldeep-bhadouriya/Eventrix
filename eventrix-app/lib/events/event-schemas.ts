import { z } from 'zod';
import { EventCategory, EventStatus } from '@/types/events';

export const agendaItemSchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  speaker: z.string().optional(),
});

export const locationSchema = z.object({
  address: z.string().min(1),
  mapUrl: z.string().url().optional(),
});

export const organizerSchema = z.object({
  id: z.string().min(1),
  organizationName: z.string().min(1),
  logo: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
});

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  endTime: z.string().optional(),
  venue: z.string().min(1),
  capacity: z.number().int().nonnegative(),
  registeredCount: z.number().int().nonnegative(),
  organizerId: z.string().min(1),
  organizer: organizerSchema.optional(),
  category: z.nativeEnum(EventCategory),
  tags: z.array(z.string()),
  bannerUrl: z.string().url().optional(),
  status: z.nativeEnum(EventStatus),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const eventDetailsSchema = eventSchema.extend({
  agenda: z.array(agendaItemSchema).optional(),
  highlights: z.array(z.string()).optional(),
  location: locationSchema.optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;
export type EventDetailsSchema = z.infer<typeof eventDetailsSchema>;
