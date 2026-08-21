import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../../types';

interface CartProps {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  total: number;
}

export default function Cart({ items, onUpdateQty, onRemove, onCheckout, total }: CartProps) {
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden shadow-lg border-0 border-l border-gray-100">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="text-indigo-600" size={20} />
          Current Order
        </h2>
        <p className="text-xs text-gray-400 font-medium mt-1">
          {items.reduce((s, i) => s + i.quantity, 0)} Items
        </p>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <ShoppingBag size={48} className="mb-3 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-gray-500">Keranjang Kosong</p>
            <p className="text-xs text-gray-400 mt-1">Pilih menu untuk menambahkan</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.productId} className="p-3 bg-white border border-gray-100 rounded-xl flex gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm leading-tight">{item.productName}</p>
                <p className="text-indigo-600 font-bold text-sm mt-1">
                  Rp {item.unitPrice.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Summary */}
      <div className="p-5 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <span className="text-gray-500 font-semibold text-sm">Total Tagihan</span>
          <span className="text-xl font-black text-gray-900">
            Rp {total.toLocaleString('id-ID')}
          </span>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="btn-primary w-full py-4 text-base tracking-wide uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
}
