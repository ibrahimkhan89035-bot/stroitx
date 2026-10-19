import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('[StroitX Database] PostgreSQL connected via Prisma ORM successfully.');
  } catch (error) {
    console.error('[StroitX Database] Failed to connect to PostgreSQL database:', error);
  }
};
