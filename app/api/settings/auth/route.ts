export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { newUsername, newPassword } = await request.json();

    if (!newUsername && !newPassword) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 });
    }

    if (newUsername) {
      await prisma.setting.upsert({
        where: { key: 'admin_username' },
        update: { value: newUsername },
        create: { key: 'admin_username', value: newUsername }
      });
    }

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      await prisma.setting.upsert({
        where: { key: 'admin_password' },
        update: { value: hash },
        create: { key: 'admin_password', value: hash }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update auth error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate kredensial' }, { status: 500 });
  }
}
