# Static Pages Implementation

This document provides an overview of the static pages created for the Eventrix application.

## Pages Created

### 1. About Page (`/app/about/page.tsx`)

A comprehensive about page featuring:

- **Hero Section**: Eye-catching header with project tagline and gradient background
- **Mission & Vision**: Clear statement of purpose and goals
- **Features Grid**: 8 feature cards showcasing key platform capabilities:
  - Event Management
  - Ticketing System
  - Team Collaboration
  - Analytics & Insights
  - Secure & Reliable
  - Fast & Efficient
  - Smart Notifications
  - Real-time Updates
- **Team Section**: Displays team members with photos, roles, and social links
- **Call-to-Action**: Prominent buttons for signup and contact

**Route**: `/about`  
**Metadata**: Includes SEO-optimized title, description, and keywords

### 2. Contact Page (`/app/contact/page.tsx`)

A professional contact page with:

- **Header Section**: Welcoming message
- **Contact Form**: Fully validated form with fields for:
  - Name
  - Email
  - Subject
  - Message
- **Contact Information Cards**: 6 info cards displaying:
  - Email
  - Phone
  - Address
  - Business Hours
  - Live Chat availability
  - Support information
- **Map Section**: Placeholder for future map integration
- **FAQ Section**: Common questions with answers

**Route**: `/contact`  
**Metadata**: Includes SEO-optimized title, description, and keywords

## Reusable Components

All components are located in `/components/static/`:

### 1. SectionHeader (`section-header.tsx`)
Consistent section headers with optional subtitle and centered alignment.

**Props**:
- `title: string` - Main heading text
- `subtitle?: string` - Optional subheading
- `centered?: boolean` - Center align the header
- `className?: string` - Additional CSS classes

### 2. FeatureCard (`feature-card.tsx`)
Display features with icon, title, and description in a card layout.

**Props**:
- `icon: LucideIcon` - Icon component from lucide-react
- `title: string` - Feature title
- `description: string` - Feature description
- `className?: string` - Additional CSS classes

### 3. TeamCard (`team-card.tsx`)
Show team member information with photo and social links.

**Props**:
- `member: TeamMember` - Team member object containing:
  - `name: string`
  - `role: string`
  - `image: string`
  - `bio?: string`
  - `social?: { github?, linkedin?, twitter?, email? }`
- `className?: string` - Additional CSS classes

### 4. ContactForm (`contact-form.tsx`)
Complete contact form with validation and submission handling.

**Features**:
- Form validation using `react-hook-form` + `zod`
- Client-side validation with error messages
- Loading states during submission
- Success/error notifications
- Accessible form elements with ARIA attributes

**Props**:
- `onSuccess?: () => void` - Callback on successful submission
- `onError?: (error: string) => void` - Callback on error

### 5. InfoCard (`info-card.tsx`)
Display contact information with icon and optional link.

**Props**:
- `icon: LucideIcon` - Icon component
- `title: string` - Card title
- `content: string` - Main content
- `link?: string` - Optional link URL
- `className?: string` - Additional CSS classes

## API Route

### Contact Form Handler (`/app/api/contact/route.ts`)

**Endpoint**: `POST /api/contact`

**Features**:
- Rate limiting (5 requests per 15 minutes per IP)
- Request validation using Zod schema
- Comprehensive error handling
- Logging with request tracking
- Structured API responses

**Request Body**:
```json
{
  "name": "string (min 2 chars)",
  "email": "valid email",
  "subject": "string (min 5 chars)",
  "message": "string (min 10 chars)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Thank you for contacting us! We will get back to you soon."
  },
  "meta": {
    "timestamp": "ISO date string"
  }
}
```

**Error Response** (400/429/500):
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": []
  },
  "meta": {
    "timestamp": "ISO date string",
    "requestId": "UUID"
  }
}
```

**TODO for Production**:
1. Implement email sending (nodemailer setup commented in code)
2. Save contact messages to database (Prisma schema commented)
3. Add email confirmation to users
4. Integrate with CRM or ticketing system

## Assets

### Placeholder Avatar
Location: `/public/assets/team/placeholder-avatar.svg`

A simple SVG avatar placeholder for team members. Replace with actual team photos.

## Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Grid layouts adapt to screen size
- Touch-friendly buttons and form elements

### Accessibility
- Semantic HTML elements
- ARIA labels and attributes
- Keyboard navigation support
- Screen reader friendly
- Proper heading hierarchy
- Focus indicators

### Dark Mode Support
- All components support dark mode
- Automatic theme detection
- Consistent color scheme
- Proper contrast ratios

## Dependencies

All required dependencies are already installed:
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod resolver for react-hook-form
- `lucide-react` - Icon library
- `framer-motion` - Animations (available if needed)

## Usage Examples

### Adding a New Team Member

Edit `/app/about/page.tsx`:

```typescript
const team = [
  {
    name: 'John Doe',
    role: 'Backend Developer',
    image: '/assets/team/john.jpg',
    bio: 'Experienced backend developer specializing in Node.js and databases.',
    social: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      email: 'john@eventrix.com',
    },
  },
  // ... more team members
];
```

### Customizing Features

Edit the `features` array in `/app/about/page.tsx`:

```typescript
import { YourIcon } from 'lucide-react';

const features = [
  {
    icon: YourIcon,
    title: 'Your Feature',
    description: 'Feature description here',
  },
  // ... more features
];
```

### Using Components in Other Pages

```typescript
import { SectionHeader, FeatureCard } from '@/components/static';
import { Star } from 'lucide-react';

export default function YourPage() {
  return (
    <div>
      <SectionHeader 
        title="Your Section" 
        subtitle="Description"
        centered 
      />
      <FeatureCard
        icon={Star}
        title="Feature Name"
        description="Feature details"
      />
    </div>
  );
}
```

## Next Steps

1. **Add actual team photos** to `/public/assets/team/`
2. **Configure email service** for contact form
3. **Add database schema** for storing contact messages
4. **Integrate map service** (Google Maps, Mapbox, etc.)
5. **Add more FAQs** to the contact page
6. **Customize contact information** with real details
7. **Add analytics tracking** for form submissions
8. **Set up automated email responses**

## Testing

To test the contact form:

1. Navigate to `/contact`
2. Fill out all fields
3. Submit the form
4. Check browser console for processing logs
5. Verify success/error messages display correctly

Rate limiting can be tested by submitting the form 6+ times within 15 minutes.

## SEO Considerations

Both pages include:
- Meta titles and descriptions
- Relevant keywords
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images (via TeamCard component)

## Performance

- Server-side rendering (Next.js App Router)
- Optimized images (use Next.js Image component for photos)
- Minimal client-side JavaScript
- Code splitting by route
- CSS-in-JS with Tailwind for minimal bundle size
