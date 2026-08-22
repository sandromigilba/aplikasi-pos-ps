import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Using alias, but wait, do we have @ configured? Let's use relative path.

// Wait, let's use relative for safety.
import prismaClient from '../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get('skip') || '0');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const products = await prismaClient.product.findMany({
      skip,
      take: limit,
    });
    return NextResponse.json(products);
  } catch (error: any) {
    const hasDbUrl = !!process.env.DATABASE_URL;
    console.error(`Products error (DB URL Set: ${hasDbUrl}):`, error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products', hasDbUrl }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prismaClient.product.create({
      data: body,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
