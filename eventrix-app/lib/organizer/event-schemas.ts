import { z } from "zod";

export const organizerEventDetailsSchema = z
  .object({
    subCategory: z.string().max(100).optional(),
    timezone: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    isVirtual: z.boolean().optional(),
    registrationWindowStart: z.string().optional(),
    registrationWindowEnd: z.string().optional(),
    approvalRequired: z.boolean().optional(),
    price: z.coerce.number().min(0).optional(),
    terms: z.string().max(5000).optional(),
    gallery: z.array(z.string().url()).optional(),
    tags: z.array(z.string().max(50)).optional(),
    agenda: z
      .array(
        z.object({
          time: z.string().min(1),
          title: z.string().min(1),
          speaker: z.string().optional(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    speakers: z
      .array(
        z.object({
          name: z.string().min(1),
          title: z.string().optional(),
          bio: z.string().optional(),
        }),
      )
      .optional(),
    prerequisites: z.array(z.string().max(200)).optional(),
    faqs: z
      .array(
        z.object({
          q: z.string().min(1),
          a: z.string().min(1),
        }),
      )
      .optional(),
    publishMode: z.enum(["publish", "schedule", "draft"]).optional(),
    scheduleAt: z.string().optional(),
  })
  .passthrough();

export const organizerCreateEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(20000),
  category: z.string().min(1).max(100),
  date: z.string().min(1),
  time: z.string().min(1).max(20),
  endTime: z.string().max(20).optional(),
  venue: z.string().min(2).max(200),
  capacity: z.coerce.number().int().min(1).max(1_000_000),
  tags: z.array(z.string().max(50)).default([]),
  bannerUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\/[A-Za-z0-9._~\-/%]+$/),
    ])
    .optional()
    .or(z.literal("")),
  details: organizerEventDetailsSchema.optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "COMPLETED"]).optional(),
});

export const organizerListEventsQuerySchema = z.object({
  q: z.string().max(200).optional(),
  status: z.string().max(30).optional(),
  category: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["createdAt", "date", "title", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const organizerBulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const organizerCheckInSchema = z.object({
  registrationId: z.string().min(1),
});
