"use client";

import { useState } from 'react';
import { StoreProvider, useStore } from './store/useStore';
import Sidebar, { type Page } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './views/DashboardPage';
import CashierPage from './views/CashierPage';
import ProductsPage from './views/ProductsPage';
import HistoryPage from './views/HistoryPage';
import SettingsPage from './views/SettingsPage';

function AppContent() {
  const [page, setPage] = useState<Page>('cashier'); // Default to cashier
  const { settings, isLoading } = useStore();

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

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <DashboardPage />;
      case 'cashier':    return <CashierPage />;
      case 'products':   return <ProductsPage />;
      case 'history':    return <HistoryPage />;
      case 'settings':   return <SettingsPage />;
      default:           return <CashierPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar - fixed 256px (w-64) */}
      <Sidebar activePage={page} onNavigate={setPage} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: '256px' }}>
        <Header page={page} shopName={settings.shopName} />
        <main
          className="flex-1 overflow-y-auto p-6"
          key={page}
          style={{ animation: 'fadeIn 0.25s ease' }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
