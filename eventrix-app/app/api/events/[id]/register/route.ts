import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { successResponse, errorResponse } from '@/lib/api';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '@/lib/api/api-error';
import { authOptions } from '@/lib/auth';
import { findEventById, registerForEvent } from '@/lib/events/mock-events';
import { isRegistrationOpen, isEventFull } from '@/lib/events/event-utils';

export async function POST(
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
      return errorResponse(new AuthenticationError('Please log in to register'));
    }

    if (!isRegistrationOpen(event)) {
      return errorResponse(new ConflictError('Registration is not open for this event'));
    }

    if (isEventFull(event)) {
      return errorResponse(new ConflictError('Event is full'));
    }

    const result = registerForEvent(id, session.user.id);

    if (result.status === 'not_found') {
      return errorResponse(new NotFoundError('Event', id));
    }

    if (result.status === 'already_registered') {
      return successResponse({
        registered: true,
        alreadyRegistered: true,
        registeredCount: result.event?.registeredCount,
        capacity: result.event?.capacity,
      });
    }

    if (result.status === 'full') {
      return errorResponse(new ConflictError('Event is full'));
    }

    return successResponse({
      registered: true,
      registeredCount: result.event?.registeredCount,
      capacity: result.event?.capacity,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
