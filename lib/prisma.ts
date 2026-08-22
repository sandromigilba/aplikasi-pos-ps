import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const prismaClientSingleton = () => {
  let adapter;
  
  if (process.env.DATABASE_URL) {
    // Parse connection string
    const url = new URL(process.env.DATABASE_URL);
    const pool = require('mariadb').createPool({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: process.env.DATABASE_URL.includes('sslaccept=strict') ? { rejectUnauthorized: false } : undefined,
      connectionLimit: 10
    });
    adapter = new PrismaMariaDb(pool);
  } else {
    // Fallback if somehow missing
    console.error("CRITICAL ERROR: DATABASE_URL is not set!");
    // We shouldn't fallback to localhost on Vercel, it just confusingly fails later
    throw new Error("DATABASE_URL environment variable is missing. Please add it to Vercel Environment Variables.");
  }

  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
