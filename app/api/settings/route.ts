export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prismaClient from '../../../lib/prisma';

export async function GET() {
  try {
    const settings = await prismaClient.setting.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    const setting = await prismaClient.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
