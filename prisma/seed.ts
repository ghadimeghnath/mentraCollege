import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma/client';

async function main() {
  console.log('Seeding database with dummy data...');

  const roles = [
    Role.ADMIN,
    Role.TEACHER,
    Role.MENTOR,
    Role.STUDENT,
    Role.PARENT,
  ];

  for (const role of roles) {
    const email = `${role.toLowerCase()}@mentra.edu`;
    const password = `${role.toLowerCase()}123`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          profile: {
            create: {
              name: `Dummy ${role}`,
              passwordChanged: false,
            },
          },
        },
      });
      console.log(`Created user: ${email}`);
    } else {
      console.log(`User already exists: ${email}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
