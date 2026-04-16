'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Briefcase,
  Home,
  Calendar,
  Settings,
  Shield,
} from 'lucide-react';
import {
  InteractiveMenu,
  type InteractiveMenuItem,
} from '@/components/ui/modern-mobile-menu';
import { useAuth } from '@/hooks/use-auth';

type NavItem = InteractiveMenuItem & {
  href: string;
  match: RegExp;
};

const publicItems: NavItem[] = [
  { label: 'home', icon: Home, href: '/', match: /^\/$/ },
  {
    label: 'strategy',
    icon: Briefcase,
    href: '/auth/login',
    match: /^\/dashboard(?:\/.*)?$/,
  },
  {
    label: 'period',
    icon: Calendar,
    href: '/events',
    match: /^\/events(?:\/.*)?$/,
  },
  {
    label: 'security',
    icon: Shield,
    href: '/auth/login',
    match: /^\/dashboard\/notifications(?:\/.*)?$/,
  },
  {
    label: 'settings',
    icon: Settings,
    href: '/auth/login',
    match: /^\/dashboard\/profile(?:\/.*)?$/,
  },
];

const studentItems: NavItem[] = [
  { label: 'home', icon: Home, href: '/', match: /^\/$/ },
  {
    label: 'strategy',
    icon: Briefcase,
    href: '/dashboard',
    match: /^\/dashboard(?:\/.*)?$/,
  },
  {
    label: 'period',
    icon: Calendar,
    href: '/events',
    match: /^\/events(?:\/.*)?$/,
  },
  {
    label: 'security',
    icon: Shield,
    href: '/dashboard/notifications',
    match: /^\/dashboard\/notifications(?:\/.*)?$/,
  },
  {
    label: 'settings',
    icon: Settings,
    href: '/dashboard/profile',
    match: /^\/dashboard\/profile(?:\/.*)?$/,
  },
];

const organizerItems: NavItem[] = [
  { label: 'home', icon: Home, href: '/', match: /^\/$/ },
  {
    label: 'strategy',
    icon: Briefcase,
    href: '/organizer/dashboard',
    match: /^\/organizer(?:\/.*)?$/,
  },
  {
    label: 'period',
    icon: Calendar,
    href: '/events',
    match: /^\/events(?:\/.*)?$/,
  },
  {
    label: 'security',
    icon: Shield,
    href: '/dashboard/notifications',
    match: /^\/dashboard\/notifications(?:\/.*)?$/,
  },
  {
    label: 'settings',
    icon: Settings,
    href: '/dashboard/profile',
    match: /^\/dashboard\/profile(?:\/.*)?$/,
  },
];

function getActiveIndex(pathname: string, items: NavItem[]): number {
  const active = items.findIndex((item) => item.match.test(pathname));
  return active >= 0 ? active : 0;
}

export function MobileBottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const role = user?.role;

  const items = useMemo(() => {
    if (!isAuthenticated) {
      return publicItems;
    }

    if (role === 'ORGANIZER' || role === 'ADMIN') {
      return organizerItems;
    }

    return studentItems;
  }, [isAuthenticated, role]);

  const activeIndex = useMemo(() => {
    return getActiveIndex(pathname, items);
  }, [pathname, items]);

  const shouldHide =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin');

  if (shouldHide) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-3 z-[70] flex justify-center px-3 md:hidden'>
      <InteractiveMenu
        items={items}
        activeIndex={activeIndex}
        accentColor='#ffffff'
        className='w-full max-w-md'
        onItemClick={(item) => {
          if (!item.href || item.href === pathname) {
            return;
          }
          router.push(item.href);
        }}
      />
    </div>
  );
}
