# Events Listing Page Implementation

This document provides an overview of the Events Listing Page implementation for the Eventrix application.

## Overview

A fully functional events listing page with advanced filtering, searching, sorting, and pagination capabilities.

## Pages Created

### Main Events Page ([/app/events/page.tsx](../app/events/page.tsx))

A comprehensive events browser featuring:

- **Search Bar**: Real-time search across event titles, descriptions, and venues
- **Filter Sidebar**: 
  - Category filter (9 categories: Technology, Sports, Arts, Business, Education, Health, Music, Food, Other)
  - Date range filter (All, Today, This Week, This Month, Custom)
  - Status filter (Open, Closed, Completed)
  - Mobile-responsive drawer on small screens
- **Sort Options**: Sort by Date, Popularity, Capacity, or Recently Added (ascending/descending)
- **Events Grid**: Responsive grid (1-3 columns based on screen size)
- **Pagination**: Page-based pagination with navigation
- **Loading States**: Skeleton loaders during data fetch
- **Empty States**: Helpful messages when no events found
- **Error States**: Error handling with retry option
- **URL Sync**: All filters and pagination synced with URL params

**Route**: `/events`  
**SEO**: Includes metadata for title, description, and keywords

## Components Created

All components are located in [/components/events/](../components/events/):

### 1. EventCard ([event-card.tsx](../components/events/event-card.tsx))

Displays individual event information in a card format.

**Features**:
- Banner image with gradient fallback
- Category badge with icon
- Status badge (color-coded: green/red/yellow/blue/gray)
- Event title and description (2-line clamp)
- Event details with icons:
  - Date and time (with duration if available)
  - Venue
  - Capacity (registered/total)
- Color-coded capacity progress bar
- Remaining seats warning (when ≤10 seats)
- "View Details" button
- Hover and focus animations
- Fully responsive

**Props**:
- `event: Event` - Event object
- `className?: string` - Additional CSS classes

### 2. EventCardSkeleton ([event-card-skeleton.tsx](../components/events/event-card-skeleton.tsx))

Loading skeleton for EventCard during data fetch.

### 3. SearchBar ([search-bar.tsx](../components/events/search-bar.tsx))

Search input with clear functionality.

**Props**:
- `value: string` - Current search value
- `onChange: (value: string) => void` - Change handler
- `onClear: () => void` - Clear handler
- `placeholder?: string` - Placeholder text
- `className?: string` - Additional CSS classes

### 4. FilterSidebar ([filter-sidebar.tsx](../components/events/filter-sidebar.tsx))

Comprehensive filter sidebar with all filter options.

**Features**:
- Desktop: Sticky sidebar
- Mobile: Drawer that slides up from bottom
- Active filter count badge
- Clear all filters button
- Integrates all filter components

**Props**:
- `category`, `status`, `dateRange`, `dateFrom`, `dateTo` - Current filter values
- `onCategoryChange`, `onStatusChange`, `onDateRangeChange`, etc. - Change handlers
- `onClearAll` - Clear all filters handler
- `className?: string` - Additional CSS classes

### 5. CategoryFilter ([category-filter.tsx](../components/events/category-filter.tsx))

Dropdown to filter by event category.

**Props**:
- `value: EventCategory | ''` - Selected category
- `onChange: (value: EventCategory | '') => void` - Change handler

### 6. DateRangeFilter ([date-range-filter.tsx](../components/events/date-range-filter.tsx))

Radio buttons for date range selection with custom date inputs.

**Options**:
- All Upcoming
- Today
- This Week
- This Month
- Custom Range (with from/to date pickers)

**Props**:
- `value: DateFilter` - Selected date range
- `onChange: (value: DateFilter) => void` - Change handler
- `dateFrom?`, `dateTo?` - Custom date values
- `onDateFromChange?`, `onDateToChange?` - Custom date handlers

### 7. StatusFilter ([status-filter.tsx](../components/events/status-filter.tsx))

Dropdown to filter by event status.

**Props**:
- `value: EventStatus | ''` - Selected status
- `onChange: (value: EventStatus | '') => void` - Change handler

### 8. SortDropdown ([sort-dropdown.tsx](../components/events/sort-dropdown.tsx))

Sort options dropdown with order toggle.

**Props**:
- `sortBy: SortOption` - Current sort field
- `order: SortOrder` - Sort order (asc/desc)
- `onSortChange: (sortBy, order) => void` - Change handler

## API Route

### GET /api/events ([/app/api/events/route.ts](../app/api/events/route.ts))

**Endpoint**: `GET /api/events`

**Query Parameters**:
- `search?: string` - Search term (searches title, description, venue)
- `category?: EventCategory` - Filter by category
- `status?: EventStatus` - Filter by status (default: PUBLISHED)
- `dateFrom?: string` - Start date (YYYY-MM-DD)
- `dateTo?: string` - End date (YYYY-MM-DD)
- `sort?: string` - Sort field (date, popularity, capacity, createdAt)
- `order?: string` - Sort order (asc, desc)
- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 10, max: 100)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "title": "Amazing Event",
      "description": "Description...",
      "date": "2026-02-15T00:00:00.000Z",
      "time": "10:00 AM",
      "endTime": "05:00 PM",
      "venue": "Venue Name, City",
      "capacity": 200,
      "registeredCount": 150,
      "organizerId": "org-1",
      "organizer": {
        "id": "org-1",
        "organizationName": "Organization Name",
        "logo": null
      },
      "category": "TECHNOLOGY",
      "tags": ["networking", "workshop"],
      "bannerUrl": null,
      "status": "PUBLISHED",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-03T00:00:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2026-01-03T...",
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Current Implementation**:
- Uses mock data (50 sample events)
- Includes comprehensive TODO comments for Prisma integration
- All filtering, sorting, and pagination logic implemented

**TODO for Production**:
1. Replace mock data with Prisma queries
2. Add proper database indexes for performance
3. Implement caching strategy (Redis recommended)

## Types & Utilities

### Types ([types/events.ts](../types/events.ts))

- `Event` - Main event interface
- `EventStatus` - Enum for event statuses
- `EventCategory` - Enum for event categories
- `EventFilters` - Filter parameters interface
- `EventListResponse` - API response interface
- `EventRegistration` - Registration interface

### Constants

#### Event Categories ([lib/constants/event-categories.ts](../lib/constants/event-categories.ts))

Predefined categories with:
- Value (enum)
- Label (display name)
- Icon (emoji)
- Description

**Helper Functions**:
- `getCategoryInfo(category)` - Get full category info
- `getCategoryLabel(category)` - Get category label
- `getCategoryIcon(category)` - Get category icon

#### Event Statuses ([lib/constants/event-statuses.ts](../lib/constants/event-statuses.ts))

Predefined statuses with:
- Value (enum)
- Label (display name)
- Color (for badges)
- Description

**Helper Functions**:
- `getStatusInfo(status)` - Get full status info
- `getStatusLabel(status)` - Get status label
- `getStatusColor(status)` - Get status color

### Utilities ([lib/events/event-utils.ts](../lib/events/event-utils.ts))

**Date Functions**:
- `formatEventDate(date, format)` - Format date for display
- `formatEventDateTime(date, time)` - Format date and time
- `getTimeUntilEvent(date)` - Get relative time (e.g., "in 5 days")
- `calculateDaysUntil(date)` - Calculate days until event
- `isEventUpcoming(date)` - Check if event is in future
- `isEventPast(date)` - Check if event is in past
- `isEventSoon(date)` - Check if within 7 days
- `validateEventDate(date)` - Validate event date

**Capacity Functions**:
- `isEventFull(event)` - Check if at capacity
- `getCapacityPercentage(event)` - Get capacity percentage
- `getRemainingSeats(event)` - Get available seats
- `getCapacityStatus(event)` - Get status with label and color

**Status Functions**:
- `isRegistrationOpen(event)` - Check if can register
- `getEventStatus(event)` - Get comprehensive status info

**Other Functions**:
- `getEventDuration(startTime, endTime)` - Calculate duration

## Design Features

### Responsive Design

- **Mobile** (< 640px): Single column grid, drawer filters
- **Tablet** (640px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid, sidebar filters

### Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Screen reader friendly
- Focus indicators
- Color contrast compliant

### Performance

- Loading skeletons for better perceived performance
- URL-based state (shareable links, browser back/forward)
- Efficient re-renders with React hooks
- Optimized bundle size

### UX Features

- Clear visual feedback for all interactions
- Helpful empty states
- Error recovery options
- Mobile-first design
- Smooth transitions and animations
- Active filter indicators

## Dependencies

All required dependencies are installed:
- `date-fns` - Date manipulation and formatting
- `lucide-react` - Icons
- `next` - Framework and routing
- `react-hook-form` (already installed) - Form handling
- `zod` (already installed) - Validation

## Usage Examples

### Accessing the Events Page

```
/events                          - All events
/events?search=workshop          - Search for "workshop"
/events?category=TECHNOLOGY      - Technology events
/events?dateRange=week           - This week's events
/events?sort=popularity&order=desc - Most popular first
/events?page=2                   - Page 2
```

### Using Components in Other Pages

```typescript
import { EventCard, SearchBar } from '@/components/events';
import { Event } from '@/types/events';

function MyComponent({ event }: { event: Event }) {
  return (
    <div>
      <SearchBar 
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
      />
      <EventCard event={event} />
    </div>
  );
}
```

### Using Event Utilities

```typescript
import {
  formatEventDate,
  isEventFull,
  getCapacityPercentage,
  getEventStatus,
} from '@/lib/events/event-utils';

const formatted = formatEventDate(event.date, 'PPP');
const isFull = isEventFull(event);
const percentage = getCapacityPercentage(event);
const status = getEventStatus(event);
```

## Next Steps

1. **Database Integration**: Replace mock data with Prisma queries
2. **Event Details Page**: Create `/events/[id]/page.tsx`
3. **Registration**: Implement event registration functionality
4. **Authentication**: Protect registration with auth
5. **Favorites**: Add ability to save favorite events
6. **Sharing**: Social media sharing functionality
7. **Analytics**: Track page views and interactions
8. **Images**: Add real event banner images
9. **Caching**: Implement Redis caching for better performance
10. **Testing**: Add unit and integration tests

## Database Schema

When integrating with Prisma, the Event model should match:

```prisma
model Event {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  date            DateTime
  time            String
  endTime         String?
  venue           String
  capacity        Int
  registeredCount Int      @default(0)
  organizerId     String
  organizer       Organizer @relation(fields: [organizerId], references: [id])
  category        EventCategory
  tags            String[]
  bannerUrl       String?
  status          EventStatus @default(DRAFT)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  registrations   Registration[]
  
  @@index([status, date])
  @@index([category])
  @@index([organizerId])
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CLOSED
  COMPLETED
  CANCELLED
}

enum EventCategory {
  TECHNOLOGY
  SPORTS
  ARTS
  BUSINESS
  EDUCATION
  HEALTH
  MUSIC
  FOOD
  OTHER
}
```

## Testing

To test the events listing:

1. Navigate to `/events`
2. Try searching for events
3. Apply different filters
4. Change sort options
5. Navigate between pages
6. Test on mobile devices
7. Check browser back/forward
8. Share URL with filters

All filters should persist in URL and work correctly.

## Performance Considerations

- Use React Query or SWR for data fetching and caching
- Implement virtual scrolling for very long lists
- Add database indexes on frequently queried fields
- Consider server-side rendering for initial page load
- Implement CDN caching for event images
- Use Next.js Image component for automatic optimization

## SEO

The events page includes:
- Meta title and description
- Relevant keywords
- Semantic HTML structure
- Proper heading hierarchy
- Clean URLs with query parameters
- Open Graph tags (can be added)
