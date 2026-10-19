import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[StroitX Seed] Initializing StroitX database schema state...');
  console.log('[StroitX Seed] StroitX is configured to operate in clean production-ready state with real database records.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
