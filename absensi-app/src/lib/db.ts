import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Warm up connection untuk mengurangi cold start
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
  // Pre-connect untuk mengurangi delay pertama kali
  db.$connect().catch(() => {})
}
