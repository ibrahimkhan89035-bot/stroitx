import { prisma } from '../config/database';
import { hashPassword } from '../utils/password';
import { Role } from '@prisma/client';

async function createAdminUser() {
  const email = process.argv[2] || 'admin@stroitx.com';
  const rawPassword = process.argv[3] || 'AdminStroitX@2026';
  const role = Role.ADMIN;

  console.log(`[StroitX CLI] Bootstrapping secure ${role} user: ${email}...`);

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    console.log(`[StroitX CLI] User ${email} already exists. Updating role to ${role}...`);
    await prisma.user.update({
      where: { id: existing.id },
      data: { role, isActive: true, phone: '8767962622' },
    });
    console.log(`[StroitX CLI] Role & Phone successfully updated.`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(rawPassword);

  const adminUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      phone: '8767962622',
      passwordHash,
      name: 'System Admin',
      role,
      isActive: true,
    },
  });

  console.log(`[StroitX CLI] ✅ Success! Admin user created with ID: ${adminUser.id}`);
  console.log(`[StroitX CLI] Role: ${adminUser.role}`);
  console.log(`[StroitX CLI] Login Email: ${adminUser.email}`);
  process.exit(0);
}

createAdminUser().catch((err) => {
  console.error('[StroitX CLI Error]:', err);
  process.exit(1);
});
