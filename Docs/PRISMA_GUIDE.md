# Prisma Quick Reference

## 🚀 Quick Start

1. **Install dependencies** (already done)
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and update DATABASE_URL
   ```

3. **Run setup script**
   ```bash
   npm run db:setup
   ```

   OR manually:
   ```bash
   # Create database
   createdb eventrix
   
   # Generate Prisma Client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

## 📦 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Run the automated setup script |
| `npm run db:migrate` | Create and apply a new migration |
| `npm run db:migrate:deploy` | Apply migrations in production |
| `npm run db:migrate:reset` | Reset database (⚠️ deletes all data) |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:seed` | Seed database with sample data |

## 📝 Common Workflows

### Creating a New Migration

```bash
# After modifying prisma/schema.prisma
npm run db:migrate -- --name your_migration_name
```

### Viewing Database

```bash
npm run db:studio
# Opens http://localhost:5555
```

### Reset Database

```bash
npm run db:migrate:reset
# Deletes all data and re-runs migrations
```

### Production Deployment

```bash
npm run db:migrate:deploy
```

## 🔧 Using Prisma Client

### Import in Your Code

```typescript
import { prisma } from '@/lib/db';

// or
import prisma from '@/lib/db';
```

### Example Queries

```typescript
// Create a user
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'STUDENT',
  },
});

// Find users
const users = await prisma.user.findMany({
  where: {
    role: 'STUDENT',
  },
  include: {
    registrations: true,
  },
});

// Update user
const updated = await prisma.user.update({
  where: { id: userId },
  data: { emailVerified: new Date() },
});

// Delete user
await prisma.user.delete({
  where: { id: userId },
});

// Complex query with relations
const events = await prisma.event.findMany({
  where: {
    status: 'PUBLISHED',
    date: {
      gte: new Date(),
    },
  },
  include: {
    organizer: {
      include: {
        user: true,
      },
    },
    registrations: {
      where: {
        status: 'REGISTERED',
      },
    },
  },
  orderBy: {
    date: 'asc',
  },
  take: 10,
});
```

## 🗂️ Schema Models Overview

### User
- Authentication and profile data
- Relations: Organizer (1:1), Registrations (1:n), Certificates (1:n), Notifications (1:n)

### Organizer
- Organization profile for event creators
- Relations: User (1:1), Events (1:n)

### Event
- Event details and metadata
- Relations: Organizer (n:1), Registrations (1:n), Certificates (1:n)

### Registration
- User event registrations
- Relations: User (n:1), Event (n:1)

### Certificate
- Event completion certificates
- Relations: User (n:1), Event (n:1)

### Notification
- User notifications
- Relations: User (n:1)

## 🔍 Useful Prisma CLI Commands

```bash
# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# Check migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only

# Apply specific migration
npx prisma migrate resolve --applied <migration_name>

# Pull schema from database
npx prisma db pull

# Introspect database
npx prisma db pull --force
```

## ⚡ Performance Tips

1. **Use appropriate indexes** - Already included in schema
2. **Select only needed fields**
   ```typescript
   const user = await prisma.user.findUnique({
     where: { id },
     select: { id: true, name: true, email: true },
   });
   ```

3. **Use pagination**
   ```typescript
   const events = await prisma.event.findMany({
     skip: (page - 1) * pageSize,
     take: pageSize,
   });
   ```

4. **Batch operations**
   ```typescript
   await prisma.user.createMany({
     data: users,
     skipDuplicates: true,
   });
   ```

## 🐛 Troubleshooting

### "Can't reach database server"
- Check if PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check port and credentials

### "Type errors after schema change"
- Run `npm run db:generate`
- Restart TypeScript server in VSCode

### "Migration failed"
- Check migration status: `npx prisma migrate status`
- Resolve manually or reset: `npm run db:migrate:reset`

### "Prisma Client not found"
- Run `npm run db:generate`
- Check node_modules/.prisma folder exists

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
