'use client';

import { useStore, StoreProvider } from '@/store/useStore';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useStore();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl animate-spin-icon"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
              borderRadius: '12px',
            }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar - fixed 256px (w-64) */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: '256px' }}>
        <Header shopName={settings.shopName} />
        <main
          className="flex-1 overflow-y-auto p-6"
          key={pathname}
          style={{ animation: 'fadeIn 0.25s ease' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </StoreProvider>
  );
}
