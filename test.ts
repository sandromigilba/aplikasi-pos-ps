import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting...');
  try {
    const settings = await prisma.setting.findMany();
    console.log('Settings:', settings);
  } catch (e) {
    console.error('Failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
