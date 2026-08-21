import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Product, ProductCategory } from '../../types';
import ProductForm from './ProductForm';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  food:   'Makanan',
  drink:  'Minuman',
  rental: 'Rental PS',
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  food:   '#f59e0b',
  drink:  '#0891b2',
  rental: '#8b5cf6',
};

export default function ProductList() {
  const { products, removeProduct } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<ProductCategory | 'all'>('all');

  const filtered = products.filter(p => filter === 'all' || p.category === filter);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'rental', 'food', 'drink'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === cat ? 'var(--accent)' : 'var(--bg-surface)',
                color: filter === cat ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {cat === 'all' ? 'Semua' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <Plus size={14} /> Tambah Produk
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              {['Nama Produk', 'Kategori', 'Harga', 'Stok', 'Unit', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => {
              const col = CATEGORY_COLORS[product.category];
              return (
                <tr
                  key={product.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: `${col}22`, color: col, border: `1px solid ${col}44` }}
                    >
                      {CATEGORY_LABELS[product.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Rp {product.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    {product.stock === null ? (
                      <span style={{ color: 'var(--text-muted)' }}>∞</span>
                    ) : (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: product.stock < 5 ? 'var(--warning-light)' : 'var(--text-secondary)' }}
                      >
                        {product.stock < 5 && <AlertTriangle size={10} />}
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{product.unit}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: product.isActive ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.1)',
                        color: product.isActive ? 'var(--success-light)' : 'var(--danger)',
                      }}
                    >
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(product)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-light)' }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus produk "${product.name}"?`)) removeProduct(product.id);
                        }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--danger)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Package size={32} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tidak ada produk</p>
          </div>
        )}
      </div>

      {(showAdd || editing) && (
        <ProductForm
          product={editing ?? undefined}
          onClose={() => { setEditing(null); setShowAdd(false); }}
        />
      )}
    </div>
  );
}
