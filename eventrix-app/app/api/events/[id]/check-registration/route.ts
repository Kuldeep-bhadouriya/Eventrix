import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { successResponse, errorResponse } from '@/lib/api';
import { NotFoundError } from '@/lib/api/api-error';
import { authOptions } from '@/lib/auth';
import { findEventById, isUserRegistered } from '@/lib/events/mock-events';
import { isEventFull, isRegistrationOpen } from '@/lib/events/event-utils';

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

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return successResponse({
        registered: false,
        requiresAuth: true,
        registeredCount: event.registeredCount,
        capacity: event.capacity,
        capacityFull: isEventFull(event),
        canRegister: isRegistrationOpen(event),
      });
    }

    const registered = isUserRegistered(id, session.user.id);
    return successResponse({
      registered,
      registeredCount: event.registeredCount,
      capacity: event.capacity,
      capacityFull: isEventFull(event),
      canRegister: isRegistrationOpen(event),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
