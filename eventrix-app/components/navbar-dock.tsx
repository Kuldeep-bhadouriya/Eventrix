'use client';

import {
  HomeIcon,
  Calendar,
  Users,
  Ticket,
  BarChart,
  Settings,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import Link from 'next/link';
import Image from 'next/image';

const navData = [
  {
    title: 'Home',
    icon: (
      <HomeIcon className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '/',
  },
  {
    title: 'Events',
    icon: (
      <Calendar className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '/events',
  },
  {
    title: 'Community',
    icon: (
      <Users className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '/community',
  },
  {
    title: 'Tickets',
    icon: (
      <Ticket className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '/tickets',
  },
  {
    title: 'Analytics',
    icon: (
      <BarChart className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '/analytics',
  },
  {
    title: 'Settings',
    icon: (
      <Settings className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '/settings',
  },
];

export function NavbarDock() {
  return (
    <>
      <div className='fixed top-4 md:top-0 left-1/2 -translate-x-1/2 z-50 max-w-full'>
        <Dock className='items-center py-2' panelHeight={52}>
          {navData.map((item, idx) => (
            <Link key={idx} href={item.href}>
              <DockItem className='aspect-square rounded-full bg-gray-200 dark:bg-neutral-800'>
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>{item.icon}</DockIcon>
              </DockItem>
            </Link>
          ))}
        </Dock>
      </div>
    </>
  );
}
