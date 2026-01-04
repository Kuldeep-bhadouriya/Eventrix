"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, ShieldX, AlertTriangle } from 'lucide-react';

interface RegisterButtonProps {
  eventId: string;
  isAuthenticated: boolean;
  isRegistered: boolean;
  isFull: boolean;
  isOpen: boolean;
  onRegistered?: (payload?: { registeredCount?: number }) => void;
}

export function RegisterButton({
  eventId,
  isAuthenticated,
  isRegistered,
  isFull,
  isOpen,
  onRegistered,
}: RegisterButtonProps) {
  const router = useRouter();
  const [actionStatus, setActionStatus] = useState<'idle' | 'registering' | 'error'>('idle');
  const [localRegistered, setLocalRegistered] = useState(false);
  const [message, setMessage] = useState('');

  const baseStatus = useMemo(() => {
    if (localRegistered || isRegistered) return 'registered' as const;
    if (isFull) return 'full' as const;
    if (!isOpen) return 'closed' as const;
    return 'idle' as const;
  }, [localRegistered, isRegistered, isFull, isOpen]);

  const status = actionStatus === 'idle' ? baseStatus : actionStatus;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?callbackUrl=/events/${eventId}`);
      return;
    }

    if (!isOpen || isFull || status === 'registered') return;

    try {
      setActionStatus('registering');
      setMessage('');

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 409) {
          setActionStatus('idle');
          setMessage('Event is already full.');
          return;
        }
        setActionStatus('error');
        setMessage(result.error?.message || 'Registration failed');
        return;
      }

      setLocalRegistered(true);
      setActionStatus('idle');
      setMessage('You are registered for this event.');
      onRegistered?.({ registeredCount: result.data?.registeredCount });
    } catch (error) {
      console.error('Registration error', error);
      setActionStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const getLabel = () => {
    if (status === 'registering') return 'Registering...';
    if (status === 'registered') return 'Registered';
    if (status === 'full') return 'Event Full';
    if (status === 'closed') return 'Registration Closed';
    if (!isAuthenticated) return 'Login to Register';
    return 'Register Now';
  };

  const isDisabled =
    status === 'registering' || status === 'registered' || status === 'full' || status === 'closed';

  return (
    <div className="space-y-2">
      <Button onClick={handleRegister} disabled={isDisabled} className="min-w-[160px]">
        {status === 'registering' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'registered' && <CheckCircle2 className="h-4 w-4" />}
        {status === 'full' && <ShieldX className="h-4 w-4" />}
        {status === 'closed' && <AlertTriangle className="h-4 w-4" />}
        {getLabel()}
      </Button>
      {message && <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>}
      {!isAuthenticated && status === 'idle' && (
        <p className="text-sm text-gray-600 dark:text-gray-300">Login is required to register.</p>
      )}
    </div>
  );
}
