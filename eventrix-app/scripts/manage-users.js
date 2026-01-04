#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * User Management Script
 * Run with: node scripts/manage-users.js [command]
 * 
 * Commands:
 *   list            - List all users
 *   incomplete      - List users with incomplete profiles
 *   delete <email>  - Delete user by email
 *   deleteAll       - Delete all users (be careful!)
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileCompleted: true,
      phone: true,
      collegeRollNumber: true,
      semester: true,
      department: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n📋 All Users:\n');
  console.table(users);
  console.log(`\nTotal users: ${users.length}`);
}

async function listIncompleteProfiles() {
  const users = await prisma.user.findMany({
    where: { profileCompleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  console.log('\n⚠️  Users with incomplete profiles:\n');
  console.table(users);
  console.log(`\nTotal: ${users.length}`);
}

async function deleteUser(email) {
  if (!email) {
    console.error('❌ Please provide an email address');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log(`\n🗑️  Deleting user: ${user.name} (${user.email})`);
  
  await prisma.user.delete({ where: { email } });
  
  console.log('✅ User deleted successfully');
}

async function deleteAllUsers() {
  console.log('\n⚠️  WARNING: This will delete ALL users!');
  console.log('Press Ctrl+C to cancel or wait 5 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const result = await prisma.user.deleteMany();
  
  console.log(`✅ Deleted ${result.count} users`);
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'list':
        await listUsers();
        break;
      case 'incomplete':
        await listIncompleteProfiles();
        break;
      case 'delete':
        await deleteUser(arg);
        break;
      case 'deleteAll':
        await deleteAllUsers();
        break;
      default:
        console.log(`
📊 User Management Script

Usage: node scripts/manage-users.js [command]

Commands:
  list            - List all users
  incomplete      - List users with incomplete profiles
  delete <email>  - Delete user by email
  deleteAll       - Delete all users (WARNING: destructive!)

Examples:
  node scripts/manage-users.js list
  node scripts/manage-users.js delete user@example.com
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
