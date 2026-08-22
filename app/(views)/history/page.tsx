'use client';
import TransactionHistory from '@/components/dashboard/TransactionHistory';

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Riwayat lengkap semua transaksi. Klik baris untuk melihat rincian. Ekspor ke CSV atau Excel untuk laporan.
      </p>
      <TransactionHistory showActions={true} />
    </div>
  );
}
