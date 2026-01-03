# Eventrix Database Setup Guide

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- Environment variables configured

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If needed, run:
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `eventrix-app` directory based on `.env.example`:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/eventrix?schema=public"
```

### 3. Create Database

Create a PostgreSQL database named `eventrix`:

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE eventrix;"

# Or using createdb
createdb eventrix
```

### 4. Generate Prisma Client

Generate the Prisma Client based on the schema:

```bash
npx prisma generate
```

### 5. Run Initial Migration

Create and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Generate Prisma Client

## Common Prisma Commands

### Development Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply pending migrations
npx prisma migrate dev

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Production Commands

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Utility Commands

```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema changes without migrations (development only)
npx prisma db push
```

## Database Schema Overview

### Models

1. **User** - Stores user accounts (students, organizers, admins)
2. **Organizer** - Extended profile for event organizers
3. **Event** - Event details and metadata
4. **Registration** - Event registrations by users
5. **Certificate** - Event completion certificates
6. **Notification** - User notifications

### Key Relations

- User → Organizer (One-to-One)
- User → Registration (One-to-Many)
- User → Certificate (One-to-Many)
- User → Notification (One-to-Many)
- Organizer → Event (One-to-Many)
- Event → Registration (One-to-Many)
- Event → Certificate (One-to-Many)

### Indexes

The schema includes indexes on frequently queried fields:
- User: email, role
- Organizer: userId, verified
- Event: organizerId, status, date, category
- Registration: userId, eventId, status
- Certificate: userId, eventId
- Notification: userId, read, createdAt

## Seeding Data (Optional)

To seed the database with sample data, create a `prisma/seed.ts` file:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add your seed data here
  console.log('Seeding database...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then run:
```bash
npx prisma db seed
```

## Troubleshooting

### Connection Issues

If you encounter connection errors:
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL format and credentials
3. Ensure database exists
4. Check firewall/network settings

### Migration Issues

If migrations fail:
1. Check migration history: `npx prisma migrate status`
2. Resolve conflicts manually if needed
3. Use `npx prisma migrate resolve` for failed migrations
4. As last resort: `npx prisma migrate reset` (deletes all data)

### Type Issues

If TypeScript can't find Prisma types:
1. Run `npx prisma generate`
2. Restart TypeScript server in VSCode
3. Clear `node_modules/.prisma` and regenerate

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)
