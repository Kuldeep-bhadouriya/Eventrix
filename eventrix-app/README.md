# Eventrix - Event Management Platform

A modern, full-featured event management platform built with Next.js, Prisma, and PostgreSQL.

## 🚀 Features

- **Multi-Role System**: Students, Organizers, and Admins
- **Event Management**: Create, manage, and track events
- **QR Code Integration**: Digital event passes and check-ins
- **Certificate Generation**: Automated certificate issuance
- **Real-time Notifications**: Keep users informed
- **Analytics Dashboard**: Track event performance
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS v4, Radix UI, Framer Motion
- **Language**: TypeScript
- **Styling**: Modern CSS with Tailwind
- **3D Graphics**: Three.js

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **PostgreSQL** 14+ installed and running
- **npm** or **yarn** package manager

## 🎯 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# Run automated setup (recommended)
npm run db:setup

# OR manually:
createdb eventrix
npm run db:generate
npm run db:migrate
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 4. Open Database GUI (Optional)

```bash
npm run db:studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555)

## 📚 Documentation

- **[Database Setup Guide](./prisma/README.md)** - Detailed Prisma setup instructions
- **[Prisma Quick Reference](../PRISMA_GUIDE.md)** - Common commands and patterns
- **[Migration Guide](../MIGRATION_GUIDE.md)** - Database migration workflows
- **[Database Schema](../DATABASE_SCHEMA.md)** - ERD and relationships
- **[Implementation Plan](../Implementation.md)** - Full project roadmap

## 🗃️ Database Schema

### Models
- **User** - Authentication and user profiles
- **Organizer** - Event organizer profiles
- **Event** - Event details and metadata
- **Registration** - Event registrations
- **Certificate** - Completion certificates
- **Notification** - User notifications

See [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) for complete ERD.

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

### Database
```bash
npm run db:setup          # Automated database setup
npm run db:migrate        # Create and apply migration
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:migrate:reset  # Reset database (⚠️ deletes data)
npm run db:generate       # Generate Prisma Client
npm run db:studio         # Open Prisma Studio GUI
npm run db:push           # Push schema without migration
npm run db:seed           # Seed database
```

## 🏗️ Project Structure

```
eventrix-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── features-grid.tsx
│   ├── hero-section.tsx
│   ├── navbar-dock.tsx
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and helpers
│   ├── db.ts            # Prisma client singleton
│   ├── env.ts           # Environment validation
│   └── utils.ts         # Utility functions
├── prisma/              # Database schema and config
│   ├── schema.prisma    # Database models
│   ├── prisma.config.ts # Prisma 7 configuration
│   └── migrations/      # Migration files
├── public/              # Static assets
├── scripts/             # Automation scripts
│   └── setup-db.sh     # Database setup script
└── types/              # TypeScript type definitions
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eventrix"

# Application
NEXT_PUBLIC_APP_NAME=Eventrix
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for all available variables.

## 🔐 Authentication (Coming Soon)

Phase 1.2 will include:
- NextAuth.js integration
- Email/password authentication
- Google OAuth
- Role-based access control
- Email verification

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start

# Run production migrations
npm run db:migrate:deploy
```

## 🧪 Development Roadmap

- [x] **Phase 1.1**: Prisma ORM & Database Setup
- [ ] **Phase 1.2**: NextAuth.js Authentication
- [ ] **Phase 1.3**: Role-Based Access Control
- [ ] **Phase 2**: Public Pages & Event Listing
- [ ] **Phase 3**: Student Dashboard
- [ ] **Phase 4**: Organizer Dashboard
- [ ] **Phase 5**: Admin Panel & Deployment

See [Implementation.md](../Implementation.md) for detailed roadmap.

## 📝 Database Commands

### Quick Reference

```bash
# View database
npm run db:studio

# Create migration after schema changes
npm run db:migrate -- --name description

# Reset and re-seed database
npm run db:migrate:reset

# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Verify database exists
psql -U postgres -l

# Create database if missing
createdb eventrix
```

### Prisma Client Errors

```bash
# Regenerate Prisma Client
npm run db:generate

# Restart TypeScript server in VSCode
```

See [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) for more solutions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [PostgreSQL](https://www.postgresql.org/docs)

## 📧 Support

For issues and questions, please refer to the documentation files or create an issue in the repository.

---

**Status**: Phase 1.1 Complete ✅ | Database Setup Ready

Built with ❤️ using Next.js and Prisma

