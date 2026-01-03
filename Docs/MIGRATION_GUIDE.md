# Database Migration Guide

## 🎯 When You're Ready to Run Migrations

Once you have PostgreSQL running, follow these steps:

### Step 1: Start PostgreSQL

Choose one of these methods:

**Linux (systemd):**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**macOS (Homebrew):**
```bash
brew services start postgresql@16
brew services list
```

**Docker:**
```bash
docker run --name eventrix-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=eventrix \
  -p 5432:5432 \
  -d postgres:16-alpine

# Check if running
docker ps
```

**Verify PostgreSQL is running:**
```bash
pg_isready
# Should output: /var/run/postgresql:5432 - accepting connections
```

### Step 2: Create Database

**Option A: Using psql**
```bash
psql -U postgres -c "CREATE DATABASE eventrix;"
```

**Option B: Using createdb**
```bash
createdb eventrix -U postgres
```

**Option C: Let the setup script do it**
```bash
npm run db:setup
```

### Step 3: Run Migrations

**Option A: Using the migration command with URL**
```bash
npm run db:migrate -- --name init --url "postgresql://postgres:postgres@localhost:5432/eventrix"
```

**Option B: If DATABASE_URL is set in .env**
```bash
npm run db:migrate -- --name init
```

### Step 4: Verify Setup

```bash
# Check Prisma Client is generated
ls -la node_modules/.prisma/client

# Check migration was created
ls -la prisma/migrations

# Open Prisma Studio to view database
npm run db:studio
```

## 🔍 Verify Connection Before Migrating

Test your database connection:

```bash
# Try to connect with psql
psql -h localhost -U postgres -d eventrix -c "SELECT version();"

# Or test with Prisma
npx prisma db execute --stdin < /dev/null --url "postgresql://postgres:postgres@localhost:5432/eventrix"
```

## 📝 Common Connection Strings

Update these in your `.env` file:

### Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventrix?schema=public"
```

### Docker PostgreSQL
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventrix?schema=public"
```

### Neon (Serverless Postgres)
```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb"
```

### Supabase
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Railway
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

### Vercel Postgres
```env
DATABASE_URL="postgres://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb"
```

## 🚨 Common Issues and Solutions

### Issue: "Can't reach database server"
**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Check if port 5432 is in use
sudo lsof -i :5432

# Try restarting PostgreSQL
sudo systemctl restart postgresql
```

### Issue: "Database does not exist"
**Solution:**
```bash
# List databases
psql -U postgres -l

# Create if missing
createdb eventrix -U postgres
```

### Issue: "Authentication failed"
**Solution:**
- Check username/password in DATABASE_URL
- Try with default postgres user
- Reset PostgreSQL password if needed:
  ```bash
  sudo -u postgres psql
  ALTER USER postgres PASSWORD 'newpassword';
  ```

### Issue: "Port 5432 already in use"
**Solution:**
```bash
# Find what's using the port
sudo lsof -i :5432

# Change port in both PostgreSQL and DATABASE_URL
# Or stop conflicting service
```

### Issue: "Permission denied"
**Solution:**
```bash
# Grant permissions to postgres user
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE eventrix TO postgres;
```

## 🔄 Migration Workflow

### Creating New Migrations

After you modify `prisma/schema.prisma`:

```bash
# Create migration
npm run db:migrate -- --name description_of_change

# Example: Add new field
npm run db:migrate -- --name add_user_phone_field
```

### Applying Migrations in Different Environments

**Development:**
```bash
npm run db:migrate
```

**Production:**
```bash
npm run db:migrate:deploy
```

**Staging:**
```bash
npm run db:migrate:deploy
```

### Checking Migration Status

```bash
npx prisma migrate status
```

### Rolling Back (Manual Process)

Prisma doesn't have automatic rollback. To revert:

1. Restore database from backup
2. Or manually write SQL to undo changes
3. Or reset and re-migrate:
   ```bash
   npm run db:migrate:reset
   ```

## 📊 After Successful Migration

You should see:
- ✅ Migration file in `prisma/migrations/`
- ✅ Tables created in database
- ✅ Prisma Client updated with new types
- ✅ No errors in migration output

Verify with:
```bash
# Open Prisma Studio
npm run db:studio

# Or check with psql
psql -U postgres -d eventrix -c "\dt"
```

## 🎉 You're All Set!

Once migrations are complete, you can:
1. Start the development server: `npm run dev`
2. Open Prisma Studio: `npm run db:studio`
3. Begin implementing authentication (Phase 1.2)

## 💡 Quick Tips

- Run `npm run db:studio` to visually explore your database
- Use `npm run db:generate` after pulling new schema changes
- Always backup production data before migrations
- Test migrations on staging environment first
- Keep migration files in version control

## 📚 Further Reading

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Eventrix Prisma Guide](./PRISMA_GUIDE.md)
- [Setup README](./eventrix-app/prisma/README.md)
