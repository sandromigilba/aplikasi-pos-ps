'use client';
import DashboardStats from '@/components/dashboard/DashboardStats';
import TransactionHistory from '@/components/dashboard/TransactionHistory';

export default function DashboardPage() {

  return (
    <div className="space-y-5">
      <DashboardStats />

      {/* Recent Transactions */}
      <div>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Riwayat Transaksi
        </h2>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <TransactionHistory showActions={false} />
        </div>
      </div>
    </div>
  );
}
