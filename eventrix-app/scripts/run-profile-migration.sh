#!/bin/bash

# Migration script to update profile fields in the database
# Run this script to apply the database changes

echo "Running migration to update profile fields..."

# Get DATABASE_URL from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run the SQL migration
psql "$DATABASE_URL" <<SQL
-- AlterTable: Rename and modify profile completion columns
ALTER TABLE "users" RENAME COLUMN "college" TO "collegeRollNumber";
ALTER TABLE "users" RENAME COLUMN "yearOfStudy" TO "semester";

-- Verify the changes
\d users
SQL

echo "Migration completed!"
