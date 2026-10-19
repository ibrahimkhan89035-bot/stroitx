import { prisma } from './config/database';

async function run() {
  // This changes your admin account back to the ADMIN role
  const admin = await prisma.user.update({
    where: { email: 'admin@stroitx.com' },
    data: { role: 'ADMIN' }
  });

  console.log(`Success! Changed ${admin.email} back to the ${admin.role} role.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());