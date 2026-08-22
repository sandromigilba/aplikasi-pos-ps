export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prismaClient from '../../../../lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Wait, Next.js 15 requires params to be awaited!
  // I should check Next.js version. In package.json it was 16.3.2. So params is Promise.
  // Actually, I'll await it.
  const { id } = await params;
  try {
    const body = await request.json();
    const product = await prismaClient.product.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prismaClient.product.delete({
      where: { id },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
