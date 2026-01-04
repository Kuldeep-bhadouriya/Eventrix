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

// Helper function to get user initials
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function NavbarDock() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Profile/Login button component
  const ProfileButton = () => {
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
      return (
        <>
          <button 
            ref={buttonRef}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className='focus:outline-none'
          >
            <DockItem className='aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 w-12 h-12'>
              <DockLabel>Profile</DockLabel>
              <DockIcon>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className='h-full w-full object-cover rounded-full scale-150'
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg scale-150">${getInitials(user.name)}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className='h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg scale-150'>
                    {getInitials(user.name)}
                  </div>
                )}
              </DockIcon>
            </DockItem>
          </button>

          {/* Dropdown Menu - Rendered via Portal */}
          {mounted && dropdownOpen && createPortal(
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
                onClick={handleLogout}
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

    // Not authenticated - show login button
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
  };

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
          <ProfileButton />
        </Dock>
      </div>
    </>
  );
}
