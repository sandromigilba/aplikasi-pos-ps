import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const prismaClientSingleton = () => {
  let adapter;
  
  if (process.env.DATABASE_URL) {
    // Parse connection string
    const url = new URL(process.env.DATABASE_URL);
    adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: process.env.DATABASE_URL.includes('sslaccept=strict') ? { rejectUnauthorized: false } : undefined
    });
  } else {
    // Fallback if somehow missing
    adapter = new PrismaMariaDb({ host: 'localhost' });
  }

  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
