const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classCount = await prisma.class.count();
  const programCount = await prisma.program.count();
  const divisionCount = await prisma.division.count();
  
  console.log(`Classes: ${classCount}`);
  console.log(`Programs: ${programCount}`);
  console.log(`Divisions: ${divisionCount}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
