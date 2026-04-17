'use client';

import {
  HomeIcon,
  Calendar,
  InfoIcon,
  Mail,
  LayoutDashboard,
  User,
  Building2,
  ArrowRight,
  Bell,
  LogOut,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@prisma/client';
import { useMemo, useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { createPortal } from 'react-dom';

function getInitialsFromEmail(email?: string | null): string {
  const localPart = email?.split('@')[0]?.trim() ?? '';
  const cleaned = localPart.replace(/[^a-zA-Z0-9]/g, '');
  if (!cleaned) return 'U';
  return cleaned.slice(0, 2).toUpperCase();
}

type DockUser = {
  email?: string | null;
} | null | undefined;

function ProfileButton({
  isLoading,
  isAuthenticated,
  user,
  dropdownOpen,
  setDropdownOpen,
  dropdownPosition,
  buttonRef,
  dropdownRef,
  onLogout,
}: {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: DockUser;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownPosition: { top: number; left: number };
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onLogout: () => void | Promise<void>;
}) {
  if (isLoading) {
    return (
      <DockItem className='aspect-square rounded-full bg-gray-200 dark:bg-neutral-800'>
        <DockLabel>Loading...</DockLabel>
        <DockIcon>
          <div className='h-full w-full animate-pulse bg-gray-300 dark:bg-neutral-700 rounded-full' />
        </DockIcon>
      </DockItem>
    );
  }

  if (isAuthenticated && user) {
    const canUsePortal = typeof document !== 'undefined';

    return (
      <>
        <button 
          ref={buttonRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className='inline-flex items-center justify-center rounded-full border-0 bg-transparent p-0 text-inherit appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950'
          aria-label='Open profile menu'
          aria-expanded={dropdownOpen}
          aria-haspopup='menu'
        >
          <DockItem className='aspect-square rounded-full bg-gray-200 dark:bg-neutral-800'>
            <DockLabel>Profile</DockLabel>
            <DockIcon>
              <div className='aspect-square w-full flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white font-semibold text-sm leading-none'>
                {getInitialsFromEmail(user.email)}
              </div>
            </DockIcon>
          </DockItem>
        </button>

        {canUsePortal && dropdownOpen && createPortal(
          <div 
            ref={dropdownRef}
            className='fixed w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-700 overflow-hidden z-[9999]'
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <Link 
              href='/dashboard/profile'
              onClick={() => setDropdownOpen(false)}
              className='flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors'
            >
              <User className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />
              <span className='text-sm font-medium text-neutral-700 dark:text-neutral-200'>Profile</span>
            </Link>
            
            <Link 
              href='/dashboard/notifications'
              onClick={() => setDropdownOpen(false)}
              className='flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors'
            >
              <Bell className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />
              <span className='text-sm font-medium text-neutral-700 dark:text-neutral-200'>Notifications</span>
            </Link>
            
            <button
              onClick={onLogout}
              className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-left border-t border-gray-200 dark:border-neutral-700'
            >
              <LogOut className='h-4 w-4 text-red-600 dark:text-red-400' />
              <span className='text-sm font-medium text-red-600 dark:text-red-400'>Logout</span>
            </button>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <Link href='/auth/login'>
      <DockItem className='aspect-square rounded-full bg-white dark:bg-neutral-100 border-2 border-gray-300 dark:border-gray-400'>
        <DockLabel>Login</DockLabel>
        <DockIcon>
          <ArrowRight className='h-full w-full text-black p-2' />
        </DockIcon>
      </DockItem>
    </Link>
  );
}

export function NavbarDock() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Update dropdown position when it opens
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 192, // 192px = w-48
      });
    }
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Build navigation items based on authentication and role
  const navItems = useMemo(() => {
    const publicItems = [
      {
        title: 'Home',
        icon: <HomeIcon className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
        href: '/',
        show: true,
      },
      {
        title: 'Events',
        icon: <Calendar className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
        href: '/events',
        show: true,
      },
      {
        title: 'About',
        icon: <InfoIcon className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
        href: '/about',
        show: true,
      },
      {
        title: 'Contact',
        icon: <Mail className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
        href: '/contact',
        show: true,
      },
    ];

    const authenticatedItems = [
      {
        title: 'Dashboard',
        icon: <LayoutDashboard className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
        href: '/dashboard',
        show: isAuthenticated && user?.role === UserRole.STUDENT,
      },
      {
        title: 'Organizer',
        icon: <Building2 className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
        href: '/organizer/dashboard',
        show: isAuthenticated && (user?.role === UserRole.ORGANIZER || user?.role === UserRole.ADMIN),
      },
    ];

    return [...publicItems, ...authenticatedItems].filter(item => item.show);
  }, [isAuthenticated, user?.role]);

  return (
    <>
      <div className='fixed top-4 md:top-0 left-1/2 -translate-x-1/2 z-50 max-w-full pb-12 overflow-visible'>
        <Dock className='items-center py-2 overflow-visible' panelHeight={52}>
          {navItems.map((item, idx) => (
            <Link key={idx} href={item.href}>
              <DockItem className='aspect-square rounded-full bg-gray-200 dark:bg-neutral-800'>
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>{item.icon}</DockIcon>
              </DockItem>
            </Link>
          ))}
          <ProfileButton
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            user={user}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownPosition={dropdownPosition}
            buttonRef={buttonRef}
            dropdownRef={dropdownRef}
            onLogout={handleLogout}
          />
        </Dock>
      </div>
    </>
  );
}
