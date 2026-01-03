import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api';
import { NotFoundError } from '@/lib/api/api-error';
import { findEventById, getRelatedEvents } from '@/lib/events/mock-events';
import { eventSchema } from '@/lib/events/event-schemas';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = findEventById(id);

    if (!event) {
      return errorResponse(new NotFoundError('Event', id));
    }

    const related = getRelatedEvents(id, 8).map((item) => eventSchema.parse(item));
    return successResponse(related);
  } catch (error) {
    return errorResponse(error);
  }
}
