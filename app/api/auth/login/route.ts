export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-pos-app-2026'
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan Password wajib diisi' }, { status: 400 });
    }

    // Get settings from DB
    const adminUserSetting = await prisma.setting.findUnique({ where: { key: 'admin_username' } });
    const adminPassSetting = await prisma.setting.findUnique({ where: { key: 'admin_password' } });

    // Fallback default
    const expectedUsername = adminUserSetting?.value || 'admin-ps';
    let isValid = false;

    if (username !== expectedUsername) {
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 });
    }

    if (adminPassSetting?.value) {
      // Compare hash
      isValid = await bcrypt.compare(password, adminPassSetting.value);
    } else {
      // Compare plain default if no hash in DB yet
      isValid = password === 'pass123-ps';
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 });
    }

    // Create JWT
    const token = await new SignJWT({ username: expectedUsername })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // If it's a Prisma connection error or table missing, we can fallback to default login
    // just so the user isn't completely locked out, but we should inform them.
    const errorMsg = error?.message || 'Unknown error';
    
    if (errorMsg.includes('PrismaClient') || errorMsg.includes('settings')) {
      // Fallback to default if DB is completely unreachable
      if (request.headers.get('content-type')?.includes('json')) {
        return NextResponse.json({ 
          error: `Database Error: ${errorMsg.slice(0, 100)}... Pastikan URL Database benar dan sudah 'prisma db push'` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: `Terjadi kesalahan internal: ${errorMsg.slice(0, 50)}` }, { status: 500 });
  }
}
