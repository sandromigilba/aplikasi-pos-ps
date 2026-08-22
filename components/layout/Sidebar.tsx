'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, History, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const menu = [
    { href: '/', icon: ShoppingCart, label: 'Kasir Utama' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/products', icon: Package, label: 'Produk & Stok' },
    { href: '/history', icon: History, label: 'Riwayat Transaksi' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <div
      className="fixed z-40 flex md:flex-col bg-white border-gray-100 md:left-0 md:top-0 md:w-64 md:h-full md:border-r md:border-t-0 border-t bottom-0 left-0 w-full h-[72px]"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="hidden md:block p-6 pb-2">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
          RUMAH <span style={{ color: 'var(--text-primary)' }}>NAINI</span>
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Point of Sale System
        </p>
      </div>

      <nav className="flex-1 px-2 md:px-4 py-2 md:py-6 flex flex-row md:flex-col justify-around md:justify-start gap-1 md:space-y-1.5 overflow-y-auto">
        {menu.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex md:w-full items-center justify-center md:justify-start flex-col md:flex-row gap-1 md:gap-3 px-3 py-2 md:py-3 rounded-xl text-[10px] md:text-sm font-medium transition-all"
              style={{
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="md:w-[18px] md:h-[18px]" />
              <span className="text-center truncate">{item.label === 'Kasir Utama' ? 'Kasir' : item.label === 'Produk & Stok' ? 'Produk' : item.label === 'Riwayat Transaksi' ? 'Riwayat' : item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer minimal info (desktop only) */}
      <div className="hidden md:flex p-4 border-t border-gray-100 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            A
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Admin</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kasir Aktif</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
