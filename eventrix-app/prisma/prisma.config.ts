import { defineConfig } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from both .env and .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
