#!/bin/bash

# Eventrix Database Setup Script
# This script helps you set up the PostgreSQL database and run migrations

set -e

echo "🚀 Eventrix Database Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL status..."
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo ""
    echo "Please start PostgreSQL first:"
    echo "  • On Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  • On macOS with Homebrew: brew services start postgresql"
    echo "  • On Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}📝 Please update DATABASE_URL in .env with your credentials${NC}"
    echo ""
fi

# Read DATABASE_URL from .env
source .env

# Ask user if they want to create the database
echo "🗄️  Database Configuration:"
echo "   DATABASE_URL: $DATABASE_URL"
echo ""

read -p "Do you want to create the 'eventrix' database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Extract database name from DATABASE_URL
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    echo "Creating database: $DB_NAME"
    
    # Try to create database
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null && echo -e "${GREEN}✅ Database created${NC}" || echo -e "${YELLOW}⚠️  Database may already exist${NC}"
    echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
read -p "Do you want to run migrations now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init --url "$DATABASE_URL"
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped migrations. Run 'npx prisma migrate dev' later${NC}"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  • Update DATABASE_URL in .env if needed"
echo "  • Run 'npm run dev' to start the development server"
echo "  • Run 'npx prisma studio' to open the database GUI"
echo ""
