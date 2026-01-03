-- AlterTable: Rename and modify profile completion columns
-- This migration updates the user profile fields from college/yearOfStudy to collegeRollNumber/semester

-- Rename 'college' column to 'collegeRollNumber'
ALTER TABLE "users" RENAME COLUMN "college" TO "collegeRollNumber";

-- Rename 'yearOfStudy' column to 'semester'
ALTER TABLE "users" RENAME COLUMN "yearOfStudy" TO "semester";

-- The 'phone' and 'department' columns remain unchanged
