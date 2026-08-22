'use client';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/':           'Point of Sale',
  '/dashboard':  'Dashboard Analytics',
  '/products':   'Manajemen Produk',
  '/history':    'Riwayat Transaksi',
  '/settings':   'Pengaturan Toko',
};

interface HeaderProps {
  shopName: string;
}

export default function Header({ shopName }: HeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || PAGE_TITLES['/'];
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header
      className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 gap-4 md:gap-0"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{dateStr}</p>
      </div>

      <div className="flex items-center gap-6">

        {/* Shop name */}
        <div className="text-sm font-bold bg-gray-50 px-4 py-2 rounded-lg border border-gray-100" style={{ color: 'var(--text-primary)' }}>
          {shopName}
        </div>
      </div>
    </header>
  );
}
