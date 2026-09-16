import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@vvm.edu.in';
  const rawPassword = 'admin123';

  // Hash password with 10 salt rounds
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Create or update admin account and associated Profile
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          name: 'System Admin',
          passwordChanged: false,
        },
      },
    },
  });

  console.log(`Successfully seeded admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });