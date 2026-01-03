#!/usr/bin/env node

/**
 * Quick Database Info Script
 * Shows connection status and table counts
 */

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function showDatabaseInfo() {
  try {
    console.log('\n📊 Neon Database Status\n');
    console.log('═'.repeat(50));
    
    // Check connection
    await prisma.$connect();
    console.log('✅ Connected to Neon database\n');
    
    // Get database name
    const dbName = databaseUrl.split('/').pop()?.split('?')[0];
    console.log(`📁 Database: ${dbName}`);
    console.log(`🌐 Host: ep-dawn-flower-aduf0tly-pooler.c-2.us-east-1.aws.neon.tech\n`);
    
    // Count records in each table
    console.log('📈 Table Statistics:\n');
    
    const userCount = await prisma.user.count();
    console.log(`   👥 Users: ${userCount}`);
    
    if (userCount > 0) {
      const students = await prisma.user.count({ where: { role: 'STUDENT' } });
      const organizers = await prisma.user.count({ where: { role: 'ORGANIZER' } });
      console.log(`      - Students: ${students}`);
      console.log(`      - Organizers: ${organizers}`);
    }
    
    const eventCount = await prisma.event.count();
    console.log(`   🎪 Events: ${eventCount}`);
    
    const registrationCount = await prisma.registration.count();
    console.log(`   📝 Registrations: ${registrationCount}`);
    
    const certificateCount = await prisma.certificate.count();
    console.log(`   🏆 Certificates: ${certificateCount}`);
    
    const notificationCount = await prisma.notification.count();
    console.log(`   🔔 Notifications: ${notificationCount}`);
    
    console.log('\n' + '═'.repeat(50));
    console.log('💡 To view/edit data: npm run db:studio');
    console.log('📚 Documentation: See DATABASE_SETUP_COMPLETE.md\n');
    
    await prisma.$disconnect();
    await pool.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

showDatabaseInfo();
