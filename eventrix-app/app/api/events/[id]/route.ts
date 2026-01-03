import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api';
import { NotFoundError } from '@/lib/api/api-error';
import { findEventById } from '@/lib/events/mock-events';
import { eventDetailsSchema } from '@/lib/events/event-schemas';

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

    const parsed = eventDetailsSchema.parse(event);
    return successResponse(parsed);
  } catch (error) {
    return errorResponse(error);
  }
}
