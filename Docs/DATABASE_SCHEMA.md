# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────┐
│         USER            │
├─────────────────────────┤
│ • id: String (PK)       │
│ • name: String          │
│ • email: String (unique)│
│ • password: String?     │
│ • role: UserRole        │
│ • avatar: String?       │
│ • emailVerified: Date?  │
│ • createdAt: DateTime   │
│ • updatedAt: DateTime   │
└─────────────────────────┘
        │
        │ 1:1
        ▼
┌─────────────────────────┐
│      ORGANIZER          │
├─────────────────────────┤
│ • id: String (PK)       │
│ • userId: String (FK)   │
│ • organizationName      │
│ • logo: String?         │
│ • bio: String?          │
│ • socialLinks: JSON?    │
│ • verified: Boolean     │
│ • createdAt: DateTime   │
│ • updatedAt: DateTime   │
└─────────────────────────┘
        │
        │ 1:n
        ▼
┌─────────────────────────┐
│        EVENT            │
├─────────────────────────┤
│ • id: String (PK)       │
│ • title: String         │
│ • description: Text     │
│ • date: DateTime        │
│ • time: String          │
│ • endTime: String?      │
│ • venue: String         │
│ • capacity: Int         │
│ • registeredCount: Int  │
│ • organizerId: String   │
│ • category: String      │
│ • tags: String[]        │
│ • bannerUrl: String?    │
│ • status: EventStatus   │
│ • createdAt: DateTime   │
│ • updatedAt: DateTime   │
└─────────────────────────┘
        │
        ├─────────┐
        │         │
        │ 1:n     │ 1:n
        ▼         ▼
┌──────────────┐  ┌──────────────┐
│ REGISTRATION │  │ CERTIFICATE  │
├──────────────┤  ├──────────────┤
│ • id (PK)    │  │ • id (PK)    │
│ • userId (FK)│  │ • userId (FK)│
│ • eventId(FK)│  │ • eventId(FK)│
│ • registered │  │ • templateUrl│
│ • status     │  │ • downloadUrl│
│ • checkInTime│  │ • issuedAt   │
└──────────────┘  │ • createdAt  │
        ▲         └──────────────┘
        │                 ▲
        │                 │
        │ n:1         n:1 │
        │                 │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌─────────────────────────┐
│         USER            │
│  (back reference)       │
└─────────────────────────┘
        │
        │ 1:n
        ▼
┌─────────────────────────┐
│     NOTIFICATION        │
├─────────────────────────┤
│ • id: String (PK)       │
│ • userId: String (FK)   │
│ • title: String         │
│ • message: Text         │
│ • type: String          │
│ • read: Boolean         │
│ • createdAt: DateTime   │
└─────────────────────────┘
```

## Enums

### UserRole
```
┌──────────┐
│ STUDENT  │
│ ORGANIZER│
│ ADMIN    │
└──────────┘
```

### EventStatus
```
┌───────────┐
│ DRAFT     │
│ PUBLISHED │
│ CLOSED    │
│ COMPLETED │
└───────────┘
```

### RegistrationStatus
```
┌────────────┐
│ REGISTERED │
│ ATTENDED   │
│ CANCELLED  │
└────────────┘
```

## Relationships Summary

### One-to-One (1:1)
- **User ←→ Organizer**
  - One user can be one organizer
  - One organizer belongs to one user

### One-to-Many (1:n)
- **User → Registration**
  - One user can have many registrations
  
- **User → Certificate**
  - One user can have many certificates
  
- **User → Notification**
  - One user can have many notifications
  
- **Organizer → Event**
  - One organizer can create many events
  
- **Event → Registration**
  - One event can have many registrations
  
- **Event → Certificate**
  - One event can generate many certificates

### Many-to-One (n:1)
- **Registration → User**
  - Many registrations belong to one user
  
- **Registration → Event**
  - Many registrations belong to one event
  
- **Certificate → User**
  - Many certificates belong to one user
  
- **Certificate → Event**
  - Many certificates belong to one event
  
- **Notification → User**
  - Many notifications belong to one user
  
- **Event → Organizer**
  - Many events belong to one organizer

## Indexes for Performance

### User Table
- `email` (unique) - Fast user lookup by email
- `role` - Quick filtering by user role

### Organizer Table
- `userId` (unique) - Fast user-organizer lookup
- `verified` - Filter verified organizers

### Event Table
- `organizerId` - Fast event lookup by organizer
- `status` - Filter events by status
- `date` - Sort and filter by date
- `category` - Filter by category

### Registration Table
- `[userId, eventId]` (unique) - Prevent duplicate registrations
- `userId` - Fast user registration lookup
- `eventId` - Fast event registration lookup
- `status` - Filter by registration status

### Certificate Table
- `[userId, eventId]` (unique) - One certificate per user per event
- `userId` - Fast user certificate lookup
- `eventId` - Fast event certificate lookup

### Notification Table
- `userId` - Fast user notification lookup
- `read` - Filter unread notifications
- `createdAt` - Sort by date

## Cascade Delete Behavior

```
DELETE User
  ├─> DELETE Organizer (cascade)
  │     └─> DELETE Event (cascade)
  │           ├─> DELETE Registration (cascade)
  │           └─> DELETE Certificate (cascade)
  ├─> DELETE Registration (cascade)
  ├─> DELETE Certificate (cascade)
  └─> DELETE Notification (cascade)

DELETE Organizer
  └─> DELETE Event (cascade)
        ├─> DELETE Registration (cascade)
        └─> DELETE Certificate (cascade)

DELETE Event
  ├─> DELETE Registration (cascade)
  └─> DELETE Certificate (cascade)
```

## Data Flow Example

### Student Registration Flow
```
1. User (Student) → Browse Events
2. User → Register for Event
3. Create Registration record
4. Update Event.registeredCount
5. Create Notification for User
6. Event ends → Create Certificate
7. User views Certificate
```

### Organizer Flow
```
1. User (Organizer role) → Create Organizer profile
2. Organizer → Create Event
3. Students register (Registration records)
4. Organizer checks in attendees
5. Organizer generates Certificates
6. System sends Notifications
```

## Query Patterns

### Common Queries

**Get user with all relations:**
```typescript
prisma.user.findUnique({
  where: { id },
  include: {
    organizer: {
      include: { events: true }
    },
    registrations: {
      include: { event: true }
    },
    certificates: true,
    notifications: { where: { read: false } }
  }
})
```

**Get event with registrations:**
```typescript
prisma.event.findUnique({
  where: { id },
  include: {
    organizer: { include: { user: true } },
    registrations: {
      where: { status: 'REGISTERED' },
      include: { user: true }
    },
    certificates: true
  }
})
```

**Get upcoming events:**
```typescript
prisma.event.findMany({
  where: {
    status: 'PUBLISHED',
    date: { gte: new Date() }
  },
  orderBy: { date: 'asc' },
  include: { organizer: true }
})
```

## Storage Estimates

Assuming 10,000 users, 1,000 events, 50,000 registrations:

| Table | Rows | Est. Size |
|-------|------|-----------|
| User | 10,000 | ~2 MB |
| Organizer | 1,000 | ~500 KB |
| Event | 1,000 | ~2 MB |
| Registration | 50,000 | ~5 MB |
| Certificate | 20,000 | ~2 MB |
| Notification | 100,000 | ~10 MB |
| **Total** | **181,000** | **~22 MB** |

*Note: Excludes images/files stored separately*

## Future Enhancements

Potential schema additions:
- [ ] Event comments/reviews
- [ ] Event categories table (normalized)
- [ ] Payment/transaction records
- [ ] Event sponsors
- [ ] QR code verification logs
- [ ] Email templates
- [ ] Audit logs
- [ ] Event analytics snapshots
