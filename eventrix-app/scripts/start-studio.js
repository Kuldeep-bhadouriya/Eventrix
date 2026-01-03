#!/usr/bin/env node

const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../prisma/.env.local');

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found');
  console.error('Please ensure .env file contains DATABASE_URL variable');
  process.exit(1);
}

console.log('🚀 Starting Prisma Studio...');
const dbName = databaseUrl.split('/').pop()?.split('?')[0];
console.log(`📊 Database: ${dbName}`);

// Spawn Prisma Studio with URL as argument
const prismaStudio = spawn('npx', ['prisma', 'studio', '--url', databaseUrl], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});

prismaStudio.on('exit', (code) => {
  process.exit(code || 0);
});

prismaStudio.on('error', (err) => {
  console.error('❌ Failed to start Prisma Studio:', err);
  process.exit(1);
});
