import { z } from 'zod';
import { EventCategory, EventStatus } from '@/types/events';

const eventDataSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(5000),
  date: z.string().datetime().or(z.string().date()),
  time: z.string().min(1),
  endTime: z.string().optional(),
  venue: z.string().trim().min(2).max(200),
  capacity: z.number().int().positive().max(100000),
  category: z.nativeEnum(EventCategory),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  bannerUrl: z.string().url().optional(),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
});

const registrationSchema = z.object({
  eventId: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
});

export type EventDataInput = z.infer<typeof eventDataSchema>;
export type EventRegistrationInput = z.infer<typeof registrationSchema>;

export function validateEventData(data: unknown) {
  return eventDataSchema.safeParse(data);
}

export function validateRegistration(data: unknown) {
  return registrationSchema.safeParse(data);
}
