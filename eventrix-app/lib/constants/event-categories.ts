/**
 * Event Categories
 * Predefined event categories with display information
 */

import { EventCategory } from '@/types/events';

export const EVENT_CATEGORIES = [
  {
    value: EventCategory.TECHNOLOGY,
    label: 'Technology',
    icon: '💻',
    description: 'Tech talks, hackathons, workshops',
  },
  {
    value: EventCategory.SPORTS,
    label: 'Sports',
    icon: '⚽',
    description: 'Sports events, tournaments, fitness',
  },
  {
    value: EventCategory.ARTS,
    label: 'Arts & Culture',
    icon: '🎨',
    description: 'Art exhibitions, performances, cultural events',
  },
  {
    value: EventCategory.BUSINESS,
    label: 'Business',
    icon: '💼',
    description: 'Conferences, networking, seminars',
  },
  {
    value: EventCategory.EDUCATION,
    label: 'Education',
    icon: '📚',
    description: 'Workshops, training, courses',
  },
  {
    value: EventCategory.HEALTH,
    label: 'Health & Wellness',
    icon: '🏥',
    description: 'Health camps, yoga, wellness programs',
  },
  {
    value: EventCategory.MUSIC,
    label: 'Music',
    icon: '🎵',
    description: 'Concerts, festivals, music events',
  },
  {
    value: EventCategory.FOOD,
    label: 'Food & Drink',
    icon: '🍔',
    description: 'Food festivals, cooking classes',
  },
  {
    value: EventCategory.OTHER,
    label: 'Other',
    icon: '🎯',
    description: 'Other events',
  },
] as const;

export const getCategoryInfo = (category: EventCategory) => {
  return EVENT_CATEGORIES.find((cat) => cat.value === category);
};

export const getCategoryLabel = (category: EventCategory) => {
  return getCategoryInfo(category)?.label || category;
};

export const getCategoryIcon = (category: EventCategory) => {
  return getCategoryInfo(category)?.icon || '🎯';
};
