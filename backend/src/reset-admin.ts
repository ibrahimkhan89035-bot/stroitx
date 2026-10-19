import { prisma } from './config/database';
import { hashPassword } from './utils/password';

async function resetAdminPassword() {
  const email = 'admin@stroitx.com';
  const newPassword = 'Admin@123';

  console.log(`[StroitX Admin Reset] Resetting admin credentials for ${email}...`);

  const passwordHash = await hashPassword(newPassword);

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Success! Updated existing user (${email}) with new password and ADMIN role.`);
    console.log(`User ID: ${updated.id}`);
  } else {
    const created = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: 'System Admin',
        phone: '8767962622',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Success! Created new ADMIN user (${email}).`);
    console.log(`User ID: ${created.id}`);
  }

  console.log('\n--- ADMIN LOGIN CREDENTIALS ---');
  console.log(`URL:      /admin/login`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${newPassword}`);
  console.log('-------------------------------\n');
}

resetAdminPassword()
  .catch((err) => {
    console.error('❌ Error resetting admin user:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });