import { NextResponse } from 'next/server';
import prismaClient from '../../../../../lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { reason } = await request.json();

    const result = await prismaClient.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!transaction) throw new Error('Transaction not found');
      if (transaction.status === 'canceled') throw new Error('Already canceled');

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          status: 'canceled',
          cancel_reason: reason,
        },
        include: { items: true },
      });

      // Restore stock
      for (const item of transaction.items) {
        const product = await tx.product.findUnique({ where: { id: item.product_id } });
        if (product && product.stock !== null) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { stock: product.stock + item.quantity },
          });
        }
      }

      return updatedTx;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to cancel transaction' }, { status: 500 });
  }
}
