import 'dotenv/config';
import prisma from './lib/prisma';

async function main() {
  try {
    console.log('Testing prisma connection...');
    const settings = await prisma.setting.findMany();
    console.log('Settings:', settings);
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
