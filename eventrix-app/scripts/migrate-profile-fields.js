// Migration script to update profile fields
// Run with: node scripts/migrate-profile-fields.js

/* eslint-disable @typescript-eslint/no-require-imports */

const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Running migration to update profile fields...');

    // Check if columns exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('college', 'yearOfStudy', 'collegeRollNumber', 'semester');
    `);

    console.log('Current columns:', checkColumns.rows.map(r => r.column_name));

    // Rename college to collegeRollNumber if it exists
    if (checkColumns.rows.some(r => r.column_name === 'college')) {
      await pool.query('ALTER TABLE "users" RENAME COLUMN "college" TO "collegeRollNumber";');
      console.log('✓ Renamed college → collegeRollNumber');
    }

    // Rename yearOfStudy to semester if it exists
    if (checkColumns.rows.some(r => r.column_name === 'yearOfStudy')) {
      await pool.query('ALTER TABLE "users" RENAME COLUMN "yearOfStudy" TO "semester";');
      console.log('✓ Renamed yearOfStudy → semester');
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
