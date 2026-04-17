'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Home,
  Info,
  LayoutDashboard,
  Mail,
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
  { label: 'Home', icon: Home, href: '/', match: /^\/$/ },
  {
    label: 'Event',
    icon: Calendar,
    href: '/events',
    match: /^\/events(?:\/.*)?$/,
  },
  {
    label: 'About',
    icon: Info,
    href: '/about',
    match: /^\/about(?:\/.*)?$/,
  },
  {
    label: 'Contact',
    icon: Mail,
    href: '/contact',
    match: /^\/contact(?:\/.*)?$/,
  },
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    match: /^\/dashboard(?:\/.*)?$/,
  },
];

const studentItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/', match: /^\/$/ },
  {
    label: 'Event',
    icon: Calendar,
    href: '/events',
    match: /^\/events(?:\/.*)?$/,
  },
  {
    label: 'About',
    icon: Info,
    href: '/about',
    match: /^\/about(?:\/.*)?$/,
  },
  {
    label: 'Contact',
    icon: Mail,
    href: '/contact',
    match: /^\/contact(?:\/.*)?$/,
  },
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    match: /^\/dashboard(?:\/.*)?$/,
  },
];

const organizerItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/', match: /^\/$/ },
  {
    label: 'Event',
    icon: Calendar,
    href: '/events',
    match: /^\/events(?:\/.*)?$/,
  },
  {
    label: 'About',
    icon: Info,
    href: '/about',
    match: /^\/about(?:\/.*)?$/,
  },
  {
    label: 'Contact',
    icon: Mail,
    href: '/contact',
    match: /^\/contact(?:\/.*)?$/,
  },
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/organizer/dashboard',
    match: /^\/organizer(?:\/.*)?$/,
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
