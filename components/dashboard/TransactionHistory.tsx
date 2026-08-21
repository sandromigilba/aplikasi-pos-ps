import { useState, useMemo } from 'react';
import { FileDown, FileText, ChevronDown, ChevronUp, Search, ShoppingBag, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface TransactionHistoryProps {
  showActions?: boolean;
  limit?: number;
}

export default function TransactionHistory({ showActions = true, limit }: TransactionHistoryProps) {
  const { transactions, cancelTransaction } = useStore();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let res = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(t => 
        t.id.toLowerCase().includes(q) ||
        t.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }

    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      res = res.filter(t => new Date(t.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      res = res.filter(t => new Date(t.date) <= end);
    }
    
    if (limit) res = res.slice(0, limit);
    return res;
  }, [transactions, search, limit, startDate, endDate]);

  const exportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Riwayat Transaksi');

    worksheet.columns = [
      { header: 'ID Transaksi', key: 'id', width: 20 },
      { header: 'Tanggal', key: 'date', width: 20 },
      { header: 'Metode Bayar', key: 'method', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Alasan Batal', key: 'cancelReason', width: 20 },
      { header: 'Total Item', key: 'totalItems', width: 15 },
      { header: 'Detail Item', key: 'details', width: 40 },
      { header: 'Total Tagihan', key: 'total', width: 20 }
    ];

    filtered.forEach(t => {
      worksheet.addRow({
        id: t.id,
        date: new Date(t.date).toLocaleString('id-ID'),
        method: t.paymentMethod.toUpperCase(),
        status: t.status === 'canceled' ? 'DIBATALKAN' : (t.status === 'pending_sync' ? 'TERTUNDA' : 'SUKSES'),
        cancelReason: t.cancelReason || '',
        totalItems: t.items.reduce((sum, i) => sum + i.quantity, 0),
        details: t.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
        total: t.totalAmount
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Riwayat_Transaksi_POS_${new Date().toISOString().slice(0,10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card flex flex-col overflow-hidden h-full">
      {/* Header & Controls */}
      <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
        <div className="flex gap-4 items-center w-full xl:w-auto flex-wrap">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Cari ID transaksi atau nama item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Dari:</span>
            <input 
              type="date" 
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-all text-sm"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="font-medium">Hingga:</span>
            <input 
              type="date" 
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-all text-sm"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {showActions && (
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-semibold transition-colors"
          >
            <FileDown size={16} /> Export Excel
          </button>
        )}
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText size={48} className="text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(tx => (
              <div key={tx.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'canceled' ? 'bg-gray-100 text-gray-400' : (tx.status === 'pending_sync' ? 'bg-yellow-50 text-yellow-600' : 'bg-indigo-50 text-indigo-600')}`}>
                      {tx.status === 'canceled' ? <XCircle size={18} /> : (tx.status === 'pending_sync' ? <span title="Menunggu Koneksi" className="animate-pulse">☁️</span> : <ShoppingBag size={18} />)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm ${tx.status === 'canceled' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{tx.id.toUpperCase()}</p>
                          {tx.status === 'canceled' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-100 rounded-md border border-red-200">DIBATALKAN</span>
                          )}
                          {tx.status === 'pending_sync' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-600 bg-yellow-100 rounded-md border border-yellow-200 animate-pulse">SYNC...</span>
                          )}
                        </div>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {new Date(tx.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-bold ${tx.status === 'canceled' ? 'text-gray-400' : 'text-gray-900'}`}>Rp {tx.totalAmount.toLocaleString('id-ID')}</p>
                      <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {expanded === tx.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {expanded === tx.id && (
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-sm">
                    <h4 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider">Rincian Pembelian</h4>
                    <ul className="space-y-2">
                      {tx.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                          <span className="font-medium text-gray-800">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-gray-600 font-semibold">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {tx.paymentMethod === 'cash' && tx.amountPaid && (
                      <div className="mt-4 flex justify-between items-center text-xs font-medium text-gray-500 pt-3 border-t border-gray-200">
                        <span>Tunai: Rp {tx.amountPaid.toLocaleString('id-ID')}
                    {showActions && tx.status !== 'canceled' && (
                      <div className="mt-4 flex justify-end pt-3 border-t border-gray-200">
                        <button
                          onClick={() => setCancelId(tx.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                        >
                          <XCircle size={14} /> Batalkan Transaksi
                        </button>
                      </div>
                    )}</span>
                        <span>Kembali: Rp {(tx.change || 0).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Batalkan Transaksi</h3>
            </div>
            <div className="p-5">
              <label className="block text-xs font-bold text-gray-600 mb-2">Alasan Pembatalan</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Contoh: Salah input pesanan..."
                rows={3}
                autoFocus
              />
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => { setCancelId(null); setCancelReason(''); }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={async () => {
                  if (!cancelReason.trim()) return;
                  await cancelTransaction(cancelId, cancelReason);
                  setCancelId(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
