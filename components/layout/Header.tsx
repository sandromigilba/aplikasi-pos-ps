'use client';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/views/cashier':    'Point of Sale',
  '/views/dashboard':  'Dashboard Analytics',
  '/views/products':   'Manajemen Produk',
  '/views/history':    'Riwayat Transaksi',
  '/views/settings':   'Pengaturan Toko',
};

interface HeaderProps {
  shopName: string;
}

export default function Header({ shopName }: HeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || PAGE_TITLES['/views/cashier'];
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header
      className="flex items-center justify-between px-8 py-4"
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
        {/* Offline badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
          style={{ background: 'var(--bg-surface)', color: 'var(--success)', border: '1px solid var(--border)' }}
        >
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--success)' }} />
          Sistem Lokal Aktif
        </div>

        {/* Shop name */}
        <div className="text-sm font-bold bg-gray-50 px-4 py-2 rounded-lg border border-gray-100" style={{ color: 'var(--text-primary)' }}>
          {shopName}
        </div>
      </div>
    </header>
  );
}
