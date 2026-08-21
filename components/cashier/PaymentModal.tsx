import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { CartItem, PaymentMethod } from '../../types';
import qrCodeImg from '../../assets/qr-code.jpg';

interface PaymentModalProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ items, total, onClose, onSuccess }: PaymentModalProps) {
  const { checkout } = useStore();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const change = method === 'cash' && amountPaid ? parseFloat(amountPaid) - total : 0;
  const canPay = method === 'qris' || (amountPaid && parseFloat(amountPaid) >= total);

  const handlePay = async () => {
    setLoading(true);
    try {
      await checkout(
        items,
        method,
        method === 'cash' ? parseFloat(amountPaid) : undefined,
      );
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canPay && !loading && !done) {
        handlePay();
      } else if (e.key === 'Escape' && !loading && !done) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canPay, loading, done, items, method, amountPaid, onClose, onSuccess, checkout]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div
        className="w-96 rounded-xl animate-fade-in overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {done ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle size={56} className="animate-fade-in" style={{ color: 'var(--success-light)' }} />
            <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Pembayaran Berhasil!</p>
            {change > 0 && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Kembalian: Rp {change.toLocaleString('id-ID')}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Pembayaran</h3>
              <button onClick={onClose}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Items */}
              <div className="space-y-1.5">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>{item.productName} x{item.quantity}</span>
                    <span style={{ color: 'var(--text-primary)' }}>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div
                  className="flex justify-between font-bold pt-2 text-sm"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--accent-light)' }}
                >
                  <span>TOTAL</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Method */}
              <div className="flex gap-2">
                {(['cash', 'qris'] as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: method === m ? 'var(--accent)' : 'var(--bg-surface)',
                      color: method === m ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${method === m ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {m === 'cash' ? '💵 Tunai' : '📱 QRIS / E-Wallet'}
                  </button>
                ))}
              </div>

              {method === 'cash' && (
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Uang Diterima
                  </label>
                  <input
                    type="number"
                    placeholder={`Min. Rp ${total.toLocaleString('id-ID')}`}
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    autoFocus
                  />
                  {change > 0 && (
                    <div className="mt-2 flex justify-between text-sm px-1">
                      <span style={{ color: 'var(--text-muted)' }}>Kembalian</span>
                      <span className="font-bold" style={{ color: 'var(--success-light)' }}>
                        Rp {change.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              )}

                {method === 'qris' && (
                  <div
                    className="rounded-lg p-4 text-center text-sm flex flex-col items-center"
                    style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
                  >
                    <span className="font-semibold text-gray-700 mb-2">Rental PS & Warkop Rumah Naini</span>
                    <img src={qrCodeImg.src} alt="QRIS Code" loading="lazy" className="w-48 h-48 object-cover rounded-md shadow-sm border border-gray-200" />
                    <span className="text-xs mt-3">Konfirmasi setelah pembayaran diterima</span>
                  </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Batal
              </button>
              <button
                onClick={handlePay}
                disabled={!canPay || loading}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: canPay ? 'var(--success)' : 'var(--bg-surface)',
                  color: canPay ? 'white' : 'var(--text-muted)',
                  border: canPay ? 'none' : '1px solid var(--border)',
                }}
              >
                {loading ? 'Memproses...' : 'Konfirmasi Bayar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
