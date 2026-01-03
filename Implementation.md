## PHASE 1: Foundation & Authentication

1. Prisma ORM & PostgreSQL Setup
   - Install Prisma and initialize it in the project.
   - Create a comprehensive schema.prisma with these models and relations:
     * User: id, name, email, password, role (enum: STUDENT, ORGANIZER, ADMIN), avatar, emailVerified, createdAt, updatedAt
     * Organizer: id, userId (relation), organizationName, logo, bio, socialLinks (JSON), verified, createdAt, updatedAt
     * Event: id, title, description, date, time, endTime, venue, capacity, registeredCount, organizerId (relation), category, tags, bannerUrl, status (enum: DRAFT, PUBLISHED, CLOSED, COMPLETED), createdAt, updatedAt
     * Registration: id, userId (relation), eventId (relation), registeredAt, status (enum: REGISTERED, ATTENDED, CANCELLED), checkInTime
     * Certificate: id, userId (relation), eventId (relation), templateUrl, downloadUrl, issuedAt, createdAt
     * Notification: id, userId (relation), title, message, type, read, createdAt
   - Add indexes for frequently queried fields (e.g., email, eventId, userId, status).
   - Add required DB environment variables to .env.example (DATABASE_URL, etc.).
   - Create a db.ts utility in /lib for Prisma client connection.
   - Provide migration commands to set up the database.

2. NextAuth.js Authentication
   - Install NextAuth.js and required dependencies (next-auth, @next-auth/prisma-adapter, bcrypt, etc.).
   - Configure NextAuth.js in /lib/auth.ts:
     * Credentials provider (email/password)
     * Google OAuth provider (with env variables)
     * JWT strategy for sessions
     * Callbacks to include user role and id in session
     * Custom pages for sign-in, sign-up, error
   - Create /app/api/auth/[...nextauth]/route.ts for NextAuth API handler.
   - Add authentication middleware in middleware.ts to protect:
     * /dashboard/* (student)
     * /organizer/* (organizer)
     * /admin/* (admin)
   - Create utility functions in /lib/auth-utils.ts:
     * hashPassword, verifyPassword (using bcrypt)
     * generateVerificationToken
     * sendVerificationEmail (using nodemailer or Resend)
   - Add required environment variables: NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, EMAIL_SERVER, EMAIL_FROM.

3. Authentication Pages in /app/auth/
   - /login: Email/password form, Google OAuth button, links to signup/forgot-password, validation with react-hook-form + Zod, error handling, loading state.
   - /signup: Name, email, password, confirm password, role selection (Student/Organizer), terms checkbox, validation, redirect to email verification.
   - /forgot-password: Email input, send reset link, success/error messages.
   - /reset-password: New password, confirm password, token validation, error/success messages.
   - /verify-email: Token verification, success/error messages.
   - Use Tailwind CSS v4 for styling, modern and responsive UI.
   - Create shared form components in /components/auth/.

4. Role-Based Access Control (RBAC) ✅ COMPLETED
   - ✅ Created middleware.ts in the root to protect routes based on user roles.
   - ✅ Created RBAC utilities in /lib/rbac.ts:
     * withAuth(Component, requiredRole)
     * checkPermission(userRole, requiredRole)
     * redirectUnauthorized(userRole)
     * requireAuth(requiredRole)
     * getAuth()
     * checkResourcePermission(userRole, action, resource)
   - ✅ Created custom hooks in /hooks/:
     * useAuth() - get current user/session
     * useRequireAuth(role) - protect client components
     * useRole() - get user role
     * useHasRole(role) - check specific role
     * useHasAnyRole(roles) - check multiple roles
     * useHasPermission(role) - check hierarchical permission
     * useAuthorization(roles) - protect components with redirect
     * useIsAdmin(), useIsOrganizer(), useIsStudent() - convenience hooks
     * useProfileCompleted() - check profile status
   - ✅ Added error pages:
     * /app/unauthorized/page.tsx (403) - Beautiful error page with role-based navigation
     * /app/not-found.tsx (404) - User-friendly 404 page
   - ✅ Created API middleware in /lib/api-middleware.ts:
     * requireAuth(), requireRole(), requireAnyRole()
     * withAuthApi(), withRoles() - HOF for API protection
     * Response helpers (successResponse, errorResponse, etc.)
     * Utility functions (parseBody, getPagination, handleApiError)
   - ✅ Documentation:
     * /Docs/RBAC_GUIDE.md - Comprehensive RBAC documentation
     * /Docs/RBAC_QUICK_REFERENCE.md - Quick reference guide

5. API Structure & Error Handling ✅ COMPLETED
   - ✅ Created API utilities in /lib/api/:
     * api-response.ts (standardized API response format)
     * api-error.ts (custom error classes)
     * api-validator.ts (request validation with Zod)
     * rate-limiter.ts (rate limiting)
     * api-logger.ts (request logging)
     * index.ts (central exports)
   - ✅ Added health check endpoint: /api/health
   - ✅ Implemented error handling:
     * 13 custom error classes (ValidationError, AuthError, NotFoundError, etc.)
     * Global error handler with handleApiError wrapper
     * Consistent error response format with status codes
   - ✅ Added request logging middleware for API routes
   - ✅ Documented API response formats and error codes in /app/api/README.md
   - ✅ Created example API route demonstrating all utilities
   - ✅ All utilities tested and verified working
   - ✅ Build successful with no TypeScript errors

DELIVERABLES:
- Complete Prisma schema and migration setup
- NextAuth.js configuration and API handler
- Authentication pages and shared components
- RBAC utilities, hooks, and middleware
- API utilities, error handling, and documentation
- All required environment variables and .env.example

## PHASE 2: Public Pages & Static Content

1. Static Pages in /app/ ✅ COMPLETED
   - ✅ Created /about/page.tsx:
     * Hero section with project tagline and gradient illustration
     * Mission statement and vision
     * Features/benefits grid with 8 feature cards (icons, descriptions)
     * Team section (photos, names, roles, social links)
     * Call-to-action section (buttons to register or contact)
     * Responsive and accessible design
     * SEO metadata included

   - ✅ Created /contact/page.tsx:
     * Contact form (fields: name, email, subject, message)
     * Form validation using react-hook-form + Zod
     * Submits to /api/contact endpoint (created)
     * Success/error notifications
     * Display contact info in InfoCards (email, phone, address, social links)
     * Map placeholder section for future integration
     * FAQ section
     * Responsive layout
     * SEO metadata included

   - ✅ Created /api/contact/route.ts:
     * POST endpoint for contact form submission
     * Rate limiting (5 requests per 15 minutes)
     * Request validation with Zod
     * Error handling and logging
     * Prepared for email integration (commented)
     * Prepared for database storage (commented)

   - ✅ Created reusable components in /components/static/:
     * SectionHeader - Consistent section headers with optional subtitle
     * FeatureCard - Feature display with icon, title, description
     * TeamCard - Team member card with photo and social links
     * ContactForm - Complete form with validation and submission
     * InfoCard - Information display with icon and optional link
     * index.ts - Central export for all static components

   - ✅ Created placeholder avatar SVG for team members

   - Create /privacy/page.tsx and /terms/page.tsx:
     * Structured legal content (use markdown or static JSX)
     * Table of contents with anchor links for sections
     * "Last updated" date at the top
     * Clear headings and readable formatting
     * Responsive and accessible

   - Create reusable components in /components/static/:
     * SectionHeader, FeatureCard, TeamCard, ContactForm, InfoCard, TOC (table of contents), etc.

2. Events Listing Page in /app/events/ ✅ COMPLETED
   - ✅ Created /app/events/page.tsx:
     * Grid layout of EventCard components (responsive: 1-3 columns)
     * Search bar (searches title, description, venue)
     * Filters sidebar with mobile drawer:
       - Category dropdown with all 9 categories
       - Date range picker (All, Today, This Week, This Month, Custom)
       - Status filter (Open, Closed, Completed)
     * Sort options (Date, Popularity, Capacity, Recently Added)
     * Pagination with page numbers
     * Loading skeletons and empty state
     * URL-synced filters and pagination
     * SEO metadata

   - ✅ Created EventCard component in /components/events/:
     * Banner image with gradient fallback
     * Category and status badges
     * Title, description (2-line clamp)
     * Date, time, venue, capacity info with icons
     * Capacity progress bar with color-coding
     * "View Details" button
     * Hover effects and animations
     * Responsive design

   - ✅ Created filter/search components:
     * SearchBar - Search input with clear button
     * FilterSidebar - Desktop sidebar + mobile drawer
     * CategoryFilter - Category dropdown with icons
     * DateRangeFilter - Radio buttons + custom date inputs
     * StatusFilter - Status dropdown
     * SortDropdown - Sort select + order toggle
     * EventCardSkeleton - Loading state

   - ✅ Created API endpoint:
     * GET /api/events with query params: search, category, dateFrom, dateTo, status, page, limit, sort, order
     * Mock data (50 events) - ready for Prisma integration
     * Filtering by search, category, status, date range
     * Sorting by date, popularity, capacity, createdAt
     * Pagination with metadata
     * Comprehensive TODO comments for database integration

   - ✅ Created event types and utilities:
     * types/events.ts - Event, EventStatus, EventCategory, EventFilters, EventListResponse
     * lib/constants/event-categories.ts - Category definitions with icons
     * lib/constants/event-statuses.ts - Status definitions with colors
     * lib/events/event-utils.ts - 15+ utility functions for date formatting, capacity checks, status determination

   - ✅ Installed date-fns for date manipulation

   - ✅ URL search params sync all filters and pagination state

   - Create /app/events/[id]/page.tsx (dynamic route):
   - Create /app/events/[id]/page.tsx (dynamic route):
     * Large banner image at top
     * Event title, full description, agenda/schedule
     * Info cards: date/time, venue (with map), organizer info, capacity, category
     * "Register Now" button (CTA):
       - If not logged in: redirect to /auth/login
       - If logged in: register for event (POST /api/events/[id]/register)
       - If already registered: show "Registered" state
       - If event full: show "Event Full" state
     * Related events section (carousel or grid)
     * Share buttons (WhatsApp, Email, Twitter, Facebook, Copy Link)
     * Back button to events list

   - Create supporting components:
     * EventHeader, EventInfo, OrganizerCard, Agenda, RelatedEvents, ShareButtons, RegisterButton

   - Create API endpoints:
     * GET /api/events/[id] - fetch event details
     * POST /api/events/[id]/register - register for event
     * GET /api/events/[id]/related - fetch related events
     * GET /api/events/[id]/check-registration - check if user is registered

   - Handle loading, error, not found, and registration states

4. Reusable Event Components & Utilities
   - Create in /components/events/:
     * EventCardSkeleton (loading state)
     * EventBadge (status: Open, Full, Completed, Cancelled)
     * EventCapacity (progress bar)
     * EventDate (formatted date)
     * EventVenue (venue with icon)
     * EventCategory (category chip)
     * EventStats (views, registrations, etc.)

   - Create utilities in /lib/events/:
     * event-utils.ts: formatEventDate, isEventFull, getEventStatus, calculateDaysUntil, isRegistrationOpen
     * event-validation.ts: validateEventData (Zod), validateRegistration

   - Create types in /types/events.ts:
     * Event, EventStatus, EventCategory, EventFilters, EventRegistration

   - Create constants in /lib/constants/:
     * event-categories.ts, event-statuses.ts

   - Create custom hooks in /hooks/:
     * useEvents(filters), useEvent(id), useEventRegistration(eventId), useRegisterEvent()

5. Design & Accessibility
   - Use Tailwind CSS v4 for all styling
   - Ensure all pages and components are responsive and accessible (ARIA, keyboard navigation, color contrast)
   - Use Framer Motion for smooth section transitions and animations
   - Add SEO metadata (title, description, Open Graph) for all public pages

DELIVERABLES:
- /about, /contact, /privacy, /terms pages with all sections and components
- /events listing page with search, filters, pagination, and API integration
- /events/[id] event details page with registration, related events, and all states
- All reusable event components, utilities, types, and hooks
- API endpoints for events, registration, and contact form
- Responsive, accessible, and SEO-optimized public pages

## PHASE 3: Student Dashboard

1. Dashboard Layout & Navigation
   - Create /app/dashboard/layout.tsx:
     * Sidebar navigation (Dashboard, My Events, Certificates, Profile, Notifications, Logout)
     * Mobile responsive drawer for sidebar
     * Header with user avatar, name, notifications bell, and dropdown menu
     * Breadcrumbs for navigation context
     * Notification badge for unread count
     * Dark mode support (optional)
   - Components in /components/dashboard/:
     * DashboardSidebar, DashboardHeader, UserMenu, NotificationBell, MobileMenu, Breadcrumbs, DashboardCard, DashboardSection, EmptyState, LoadingState

2. Dashboard Home Page (/app/dashboard/page.tsx)
   - Welcome message with user name
   - Stat cards for:
     * Total registered events
     * Upcoming events
     * Completed events
     * Certificates earned
   - Upcoming events widget (next 3-5 events)
   - Recent activity timeline (registrations, certificates, notifications)
   - Quick actions (Browse Events, Download Certificate, View All Events)
   - Widgets in /components/dashboard/:
     * StatCard, UpcomingEventsWidget, ActivityTimeline, QuickActions, WelcomeBanner
   - API endpoints:
     * GET /api/dashboard/stats
     * GET /api/dashboard/upcoming
     * GET /api/dashboard/activity

3. My Events Page (/app/dashboard/events/page.tsx)
   - List of all registered events
   - Tabs for filtering: All, Upcoming, Completed, Cancelled
   - Search bar and sort options (Date, Name, Status)
   - Event cards with:
     * Banner, title, short description, date, time, venue, status badge
     * Actions: View Pass, View Details, Cancel Registration
   - Cancel registration modal with confirmation and policy check
   - Pagination or infinite scroll
   - Components in /components/dashboard/events/:
     * RegisteredEventCard, EventTabs, EventSearch, CancelRegistrationModal, EventStatusBadge
   - API endpoints:
     * GET /api/user/registrations (with filters)
     * DELETE /api/events/[id]/registration
     * GET /api/events/[id]/can-cancel

4. Event Pass Page with QR Code (/app/dashboard/events/[id]/pass/page.tsx)
   - Event pass card design (ticket style)
   - QR code containing user ID, event ID, registration ID, verification hash
   - Event details: name, date, time, venue, seat/ticket number (if any)
   - User info, pass ID/reference number
   - Actions: Download as PDF, Download as Image, Share via Email/WhatsApp, Add to Calendar, Print
   - Components in /components/dashboard/events/:
     * EventPass, QRCodeDisplay, PassActions, DownloadButton, ShareButton
   - Utilities in /lib/:
     * qr-code.ts (generate/verify QR)
     * pdf-generator.ts (generate PDF)
     * share-utils.ts (email, WhatsApp, image download)
   - API endpoints:
     * GET /api/events/[id]/pass
     * POST /api/events/[id]/pass/download
     * POST /api/events/[id]/pass/share

5. Certificates Page (/app/dashboard/certificates/page.tsx)
   - Grid of earned certificates
   - Certificate cards: preview, event name, issue date, certificate ID, actions (View, Download, Share)
   - Filter by event category, search by event name, sort by date
   - Certificate modal/preview with zoom, download, share, print, verify
   - Components in /components/dashboard/certificates/:
     * CertificateCard, CertificatePreview, CertificateActions, CertificateFilter, CertificateGrid
   - API endpoints:
     * GET /api/user/certificates
     * GET /api/certificates/[id]
     * GET /api/certificates/[id]/download
     * POST /api/certificates/[id]/share

6. Profile & Notifications Pages
   - Profile (/app/dashboard/profile/page.tsx):
     * Personal info: avatar upload, name, email (verified badge), phone, bio
     * Account settings: change password, notification preferences, privacy
     * Danger zone: delete account
     * Components: ProfileForm, AvatarUpload, ChangePasswordModal, NotificationPreferences, DeleteAccountModal
     * API endpoints: GET/PUT /api/user/profile, POST /api/user/avatar, POST /api/user/change-password, DELETE /api/user/account

   - Notifications (/app/dashboard/notifications/page.tsx):
     * List of notifications, filter tabs (All, Unread, Read)
     * Notification items: icon, title, message, timestamp, read/unread
     * Actions: mark as read/unread, delete, mark all as read, clear all
     * Real-time updates (polling or websocket)
     * Components: NotificationItem, NotificationList, NotificationFilter, NotificationActions
     * API endpoints: GET /api/notifications, PUT /api/notifications/[id]/read, DELETE /api/notifications/[id], POST /api/notifications/read-all, DELETE /api/notifications/clear

7. General Features
   - All pages/components must be responsive and accessible (ARIA, keyboard navigation, color contrast)
   - Use Tailwind CSS v4 for styling and Framer Motion for animations
   - Add SEO metadata for dashboard pages
   - Show loading skeletons and empty states where appropriate
   - Use toast notifications for success/error feedback

DELIVERABLES:
- Complete dashboard layout and navigation
- Home, My Events, Event Pass, Certificates, Profile, and Notifications pages
- All supporting components, utilities, and hooks
- API endpoints for dashboard data, events, passes, certificates, profile, and notifications
- Responsive, accessible, and user-friendly student dashboard

## PHASE 4: Organizer Dashboard

1. Organizer Dashboard Layout & Navigation
   - Create /app/organizer/layout.tsx:
     * Sidebar navigation: Dashboard, Events, Create Event, Participants, Certificates, Analytics, Profile, Logout
     * Mobile responsive drawer for sidebar
     * Header with organizer avatar, name, notifications, and dropdown menu
     * Role indicator ("Organizer") and switch to student view (if dual role)
     * Breadcrumbs for navigation context
   - Components in /components/organizer/:
     * OrganizerSidebar, OrganizerHeader, OrganizerMenu, NotificationBell, MobileMenu, Breadcrumbs, MetricsCard, QuickActionsPanel

2. Organizer Home Page (/app/organizer/dashboard/page.tsx)
   - Welcome banner with organization name/logo
   - Key metrics cards:
     * Total events created
     * Total registrations
     * Active events
     * Certificates issued
     * Revenue (if applicable)
   - Quick actions: Create New Event, View All Events, Manage Participants
   - Charts section:
     * Registrations over time (line chart)
     * Events by category (pie/doughnut chart)
     * Registration status (bar chart)
   - Recent events and registrations tables
   - Components: MetricsCard, RegistrationsChart, EventsChart, RecentEventsTable, RecentRegistrationsTable
   - API endpoints: GET /api/organizer/dashboard/stats, /charts, /recent-events, /recent-registrations

3. Create Event Page (Multi-Step Form) (/app/organizer/events/create/page.tsx)
   - Multi-step form wizard:
     * Step 1: Basic Info (title, description, category, sub-category)
     * Step 2: Date & Venue (date, time, timezone, venue, address, virtual toggle)
     * Step 3: Capacity & Registration (capacity, registration window, approval, price, terms)
     * Step 4: Media & Details (banner upload, gallery, tags, agenda, speakers, prerequisites, FAQs)
     * Step 5: Review & Publish (preview, edit, publish/schedule/draft)
   - Progress indicator, navigation buttons, auto-save draft, validation with react-hook-form + Zod
   - Components: CreateEventForm, step components, StepIndicator, ImageUploader, DraftSaveIndicator
   - API endpoints: POST /api/organizer/events, /draft, /upload-image, GET /categories

4. Manage Events Page (/app/organizer/events/page.tsx)
   - Table/grid of events with:
     * Thumbnail, name, date, status, registrations, actions (Edit, View, Analytics, Delete)
     * View toggle (table/grid), filters (status, date, category, search), sort options, bulk actions (publish, cancel, delete), pagination
   - Edit event page: /app/organizer/events/[id]/edit/page.tsx (reuse create form, pre-filled)
   - Quick view side panel for event details
   - Components: EventsTable, EventsGrid, EventStatusBadge, EventActions, EventFilters, BulkActions, DeleteEventModal, CancelEventModal, EventQuickView
   - API endpoints: GET/PUT/DELETE /api/organizer/events, /bulk, /publish, /cancel

5. Event Analytics & Participants Pages
   - Analytics page: /app/organizer/events/[id]/analytics/page.tsx
     * Overview, metrics (registrations, attendance, certificates, revenue), charts (timeline, sources, demographics), conversion funnel, export reports, date range selector
     * Components: EventAnalytics, AnalyticsCard, RegistrationsChart, DemographicsChart, ConversionFunnel, ExportButton, DateRangeSelector
     * API endpoints: GET /api/organizer/events/[id]/analytics, /analytics/export

   - Participants page: /app/organizer/events/[id]/participants/page.tsx
     * Table: name, email, registration date, status, certificate status, actions (View, Check-in, Remove)
     * Filters (status, search, date, certificate), bulk actions (check-in, email, issue certificates, export), export options, QR scanner for check-in, participant detail modal
     * Components: ParticipantsTable, ParticipantRow, ParticipantDetailModal, CheckInModal, BulkEmailModal, QRScanner, ExportDropdown
     * API endpoints: GET /api/organizer/events/[id]/participants, /participants/[userId], POST /participants/check-in, /bulk-check-in, /send-email, /export

6. Certificate Management & Organizer Profile
   - Certificate management page: /app/organizer/certificates/page.tsx
     * Template management (upload, preview, library, variables guide), events list (certificates issued, actions), bulk generation, issued certificates (search, filter, download, re-issue)
     * Components: CertificateTemplateUpload, CertificatePreview, CertificateGenerator, TemplateLibrary, VariablesGuide, BulkCertificateModal
     * API endpoints: POST /api/organizer/certificates/upload-template, GET /certificates/templates, POST /events/[id]/certificates/generate, /generate-bulk, GET /events/[id]/certificates, GET /certificates/[id]/download

   - Organizer profile page: /app/organizer/profile/page.tsx
     * Organization info (name, logo, description, website, industry), contact info, social links, verification status, account settings, billing (if applicable)
     * Components: OrganizationForm, LogoUpload, VerificationBadge, SocialLinksForm
     * API endpoints: GET/PUT /api/organizer/profile, POST /profile/logo, POST /profile/verify

7. General Features
   - All pages/components must be responsive and accessible (ARIA, keyboard navigation, color contrast)
   - Use Tailwind CSS v4 for styling and Framer Motion for animations
   - Show loading skeletons and empty states where appropriate
   - Use toast notifications for success/error feedback
   - Add SEO metadata for organizer dashboard pages

DELIVERABLES:
- Complete organizer dashboard layout and navigation
- Home, Create Event, Manage Events, Analytics, Participants, Certificates, and Profile pages
- All supporting components, utilities, and hooks
- API endpoints for organizer dashboard, events, analytics, participants, certificates, and profile
- Responsive, accessible, and user-friendly organizer dashboard

## PHASE 5: Admin Panel, Polish & Deployment

1. Admin Dashboard & User Management
   - Create /app/admin/layout.tsx:
     * Sidebar navigation: Dashboard, Users, Events, Analytics, Reports, Settings, Logout
     * Admin badge and system health indicator
     * Responsive sidebar and header
   - Admin dashboard (/app/admin/page.tsx):
     * Metrics cards: total users, events, registrations, revenue, active users
     * Growth charts: user growth, events growth, registrations trend
     * Recent activity feed: new users, new events, system alerts
     * Platform health: API response time, DB health, storage, error rate
     * Quick actions panel
   - User management (/app/admin/users/page.tsx):
     * Users table: avatar, name, email, role, status, verified, joined, last active, actions
     * Filters: role, status, verification, date, search
     * Bulk actions: suspend, activate, email, export
     * User detail page: profile, activity, events, registrations, login history, admin actions, notes
   - Components: AdminSidebar, AdminHeader, PlatformMetricsCard, GrowthChart, ActivityFeed, SystemHealthIndicator, UsersTable, UserStatusBadge, UserActions, SuspendUserModal, BanUserModal, UserDetailPanel
   - API endpoints: dashboard stats, growth, activity, health, users CRUD, user status, impersonation, bulk actions

2. Event Moderation & Analytics
   - Event moderation (/app/admin/events/page.tsx):
     * Events table: name, organizer, date, status, registrations, reports, actions
     * Filters: moderation status, event status, date, organizer, search
     * Bulk actions: approve, reject, delete
     * Flagged events section
   - Event review page: full event info, organizer, stats, reports, moderation actions, admin notes
   - Reports management: list of reported events/users, report details, status, actions
   - Analytics (/app/admin/analytics/page.tsx):
     * Time period selector
     * User, event, registration, revenue, and performance analytics
     * Advanced reports: custom builder, export, schedule
   - Components: EventsTable, EventReviewCard, ModerationActions, RejectEventModal, ReportsTable, ReportDetail, AnalyticsChart, MetricCard, DateRangePicker, ReportBuilder, ExportOptions
   - API endpoints: event moderation, reports, analytics, export

3. System Settings & Notifications
   - Settings (/app/admin/settings/page.tsx):
     * Tabs: General, Event, User, Email, Notification, Payment, Security, API
     * Forms for each tab with validation and auto-save
     * Email template editor: list, edit, preview, test send, variables
     * Notification management: send system notifications, history, targeting, scheduling
   - Components: SettingsTabs, SettingsForms, EmailTemplateEditor, TemplatePreview, VariablesPanel, SendNotificationModal, NotificationHistory
   - API endpoints: settings CRUD, email templates, notifications send/history/schedule

4. Security, Monitoring, Optimization, and Deployment
   - Input validation and sanitization (server and client)
   - CSRF and XSS protection (middleware, CSP headers, sanitization)
   - API rate limiting and throttling (per IP/user/route)
   - Error tracking with Sentry (client, server, API)
   - User analytics (GA4, Mixpanel), performance monitoring (Vercel Analytics, web-vitals)
   - Image optimization (Next.js Image, sharp, CDN, responsive, lazy loading)
   - Database query optimization (indexes, caching with Redis, connection pooling)
   - Code splitting, bundle analysis, dynamic imports, font optimization, prefetching
   - Unit, integration, and E2E testing (Vitest, Playwright, k6 for load)
   - Lighthouse/SEO audits, accessibility, cross-browser/device QA
   - CI/CD with GitHub Actions: lint, type check, test, build, deploy, rollback
   - Production environment setup: .env.production, Vercel config, DB/Redis/S3, monitoring, security, backups
   - Documentation: README, API, DB, deployment, user/admin/organizer guides, onboarding, changelog, launch checklist

5. General Features
   - All admin pages/components must be responsive and accessible (ARIA, keyboard navigation, color contrast)
   - Use Tailwind CSS v4 and Framer Motion for styling and animations
   - Show loading skeletons, empty states, and toast notifications for feedback
   - Add SEO metadata for admin and system pages

DELIVERABLES:
- Complete admin dashboard, user management, event moderation, analytics, settings, and notification pages
- All supporting components, utilities, and hooks
- API endpoints for admin, moderation, analytics, settings, notifications
- Security, monitoring, optimization, and deployment scripts/configs
- Documentation and production-ready, robust, and maintainable platform