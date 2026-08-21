import { NextResponse } from 'next/server';
import prismaClient from '../../../lib/prisma';

export async function GET() {
  try {
    const transactions = await prismaClient.transaction.findMany({
      include: { items: true },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, type, total_amount, payment_method, amount_paid, change, note } = body;

    // Generate Transaction ID like RNI-YYMMDD-0001
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const prefix = `RNI-${year}${month}${day}-`;

    const lastTx = await prismaClient.transaction.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let newSeq = 1;
    if (lastTx) {
      const parts = lastTx.id.split('-');
      newSeq = parseInt(parts[parts.length - 1]) + 1;
    }
    const newId = `${prefix}${String(newSeq).padStart(4, '0')}`;

    // Transaction to create
    const transactionData = {
      id: newId,
      type,
      date: new Date(),
      total_amount,
      payment_method,
      amount_paid,
      change,
      note,
      status: 'completed',
    };

    // Use Prisma transaction to ensure atomicity
    const result = await prismaClient.$transaction(async (tx) => {
      // 1. Create Transaction
      const createdTx = await tx.transaction.create({
        data: transactionData,
      });

      // 2. Create items & deduct stock
      const createdItems = [];
      for (const item of items) {
        const createdItem = await tx.transactionItem.create({
          data: {
            transaction_id: createdTx.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          },
        });
        createdItems.push(createdItem);

        // Deduct stock
        const product = await tx.product.findUnique({ where: { id: item.product_id } });
        if (product && product.stock !== null) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { stock: Math.max(0, product.stock - item.quantity) },
          });
        }
      }

      return { ...createdTx, items: createdItems };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
