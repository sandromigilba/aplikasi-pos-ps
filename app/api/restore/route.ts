import { NextResponse } from 'next/server';
import prismaClient from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    await prismaClient.$transaction(async (tx) => {
      // 1. Delete all existing data
      await tx.transactionItem.deleteMany();
      await tx.transaction.deleteMany();
      await tx.product.deleteMany();

      // 2. Insert products
      if (data.products && data.products.length > 0) {
        await tx.product.createMany({
          data: data.products,
        });
      }

      // 3. Insert transactions and items
      if (data.transactions && data.transactions.length > 0) {
        for (const t of data.transactions) {
          const { items, date, ...txData } = t;
          await tx.transaction.create({
            data: {
              ...txData,
              date: new Date(date),
              items: {
                create: items.map((item: any) => ({
                  product_id: item.product_id,
                  product_name: item.product_name,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  subtotal: item.subtotal,
                })),
              },
            },
          });
        }
      }
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to restore database' }, { status: 500 });
  }
}
