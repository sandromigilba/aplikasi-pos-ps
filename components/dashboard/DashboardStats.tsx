import { useMemo } from 'react';
import { TrendingUp, CreditCard, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store/useStore';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({ title, value, sub, icon, colorClass }: StatCardProps) {
  return (
    <div className="glass-card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs font-medium text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const { transactions } = useStore();

  const stats = useMemo(() => {
    const today = todayStr();
    const todayTxs = transactions.filter(t => t.date.startsWith(today));

    const totalRev = todayTxs.reduce((s, t) => s + t.totalAmount, 0);
    const txCount = todayTxs.length;
    
    // Calculate items sold
    const itemsSold = todayTxs.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return { totalRev, txCount, itemsSold };
  }, [transactions]);

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        title="Total Pendapatan (Hari Ini)"
        value={fmt(stats.totalRev)}
        sub="Pemasukan kotor hari ini"
        icon={<TrendingUp size={24} />}
        colorClass="bg-indigo-100 text-indigo-600"
      />
      <StatCard
        title="Total Transaksi"
        value={stats.txCount.toString()}
        sub="Jumlah pesanan selesai"
        icon={<CreditCard size={24} />}
        colorClass="bg-sky-100 text-sky-600"
      />
      <StatCard
        title="Barang Terjual"
        value={stats.itemsSold.toString()}
        sub="Total unit yang terjual"
        icon={<ShoppingCart size={24} />}
        colorClass="bg-emerald-100 text-emerald-600"
      />
    </div>
  );
}
