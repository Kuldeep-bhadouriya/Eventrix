import { defineConfig } from 'prisma'

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || 'postgresql://neondb_owner:npg_lRjemG7TIMJ0@ep-dawn-flower-aduf0tly.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'

export default defineConfig({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})
