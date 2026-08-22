'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, History, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { href: '/cashier', icon: ShoppingCart, label: 'Kasir Utama' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/products', icon: Package, label: 'Produk & Stok' },
    { href: '/history', icon: History, label: 'Riwayat Transaksi' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <div
      className="w-64 h-full flex flex-col fixed left-0 top-0 z-10"
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="p-6 pb-2">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
          RUMAH <span style={{ color: 'var(--text-primary)' }}>NAINI</span>
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Point of Sale System
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menu.map(item => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/cashier');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer minimal info */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            A
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Admin</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kasir Aktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}
