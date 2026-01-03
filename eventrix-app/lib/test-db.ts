import { prisma } from '@/lib/db';

/**
 * Quick test to verify Prisma Client connection to PostgreSQL
 * Run with: npx ts-node lib/test-db.ts (requires ts-node)
 * Or add to a route handler for testing
 */

export async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing Prisma Client connection...\n');

    // Test user creation
    console.log('📝 Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'STUDENT',
      },
    });
    console.log('✅ User created:', testUser.id, '\n');

    // Test user query
    console.log('🔍 Querying users...');
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} user(s)\n`);

    // Test other models
    console.log('📊 Checking all tables...');
    const stats = {
      users: await prisma.user.count(),
      organizers: await prisma.organizer.count(),
      events: await prisma.event.count(),
      registrations: await prisma.registration.count(),
      certificates: await prisma.certificate.count(),
      notifications: await prisma.notification.count(),
    };
    console.log('📈 Database Statistics:');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} record(s)`);
    });

    console.log('\n✅ All tests passed! Database is working correctly.');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this is the main module
if (require.main === module) {
  testDatabaseConnection();
}
