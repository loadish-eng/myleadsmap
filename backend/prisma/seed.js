import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.log('ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD not set, skipping admin bootstrap.');
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    console.log(`Bootstrap admin ${normalizedEmail} already exists, skipping.`);
    return;
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'admin',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
    },
  });
  console.log(`Bootstrap admin created: ${normalizedEmail}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
