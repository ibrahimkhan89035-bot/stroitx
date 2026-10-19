import { prisma } from './config/database';
import { hashPassword } from './utils/password';

async function main() {
  const adminEmail = 'admin@stroitx.com';
  const adminPassword = 'AdminPassword123!'; 

  console.log('Checking for existing admin...');
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin already exists! You can log in with admin@stroitx.com');
    return;
  }

  console.log('Hashing password and creating Admin...');
  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'StroitX Super Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
      isActive: true,
    }
  });

  console.log('====================================');
  console.log('✅ Admin User Created Successfully!');
  console.log(`✉️  Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log('====================================');
}

main()
  .catch((e) => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
