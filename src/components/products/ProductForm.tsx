import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Product, ProductCategory } from '../../types';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'food',   label: 'Makanan' },
  { value: 'drink',  label: 'Minuman' },
  { value: 'rental', label: 'Rental PS' },
];

const UNITS = ['porsi', 'pcs', 'jam', 'menit', 'botol', 'gelas', 'paket', 'box', 'renteng'];

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { addProduct, updateProduct } = useStore();
  const isEditing = !!product;

  const [form, setForm] = useState({
    name:     product?.name ?? '',
    category: product?.category ?? 'food' as ProductCategory,
    price:    product?.price.toString() ?? '',
    stock:    product?.stock?.toString() ?? '',
    unit:     product?.unit ?? 'porsi',
    isActive: product?.isActive ?? true,
    unlimitedStock: product?.stock === null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi';
    if (!form.price || isNaN(parseFloat(form.price))) e.price = 'Harga tidak valid';
    if (!form.unlimitedStock && (!form.stock || isNaN(parseInt(form.stock)))) e.stock = 'Stok tidak valid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        name:     form.name.trim(),
        category: form.category,
        price:    parseFloat(form.price),
        stock:    form.unlimitedStock ? null : parseInt(form.stock),
        unit:     form.unit.trim(),
        isActive: form.isActive,
      };
      if (isEditing && product) {
        await updateProduct({ ...product, ...data });
      } else {
        await addProduct(data);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-muted)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-[440px] rounded-xl animate-fade-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button type="button" onClick={onClose}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Name */}
          <div>
            <label style={labelStyle}>Nama Produk / Layanan *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Nasi Goreng"
            />
            {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Kategori *</label>
            <select
              style={inputStyle}
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="flex gap-3">
            {/* Price */}
            <div className="flex-1">
              <label style={labelStyle}>Harga (Rp) *</label>
              <input
                type="number"
                style={inputStyle}
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="15000"
              />
              {errors.price && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.price}</p>}
            </div>

            {/* Unit */}
            <div style={{ width: '120px' }}>
              <label style={labelStyle}>Per</label>
              <select
                style={inputStyle}
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label style={{ ...labelStyle, marginBottom: 0 }}>Stok</label>
              <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.unlimitedStock}
                  onChange={e => setForm(f => ({ ...f, unlimitedStock: e.target.checked }))}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tidak terbatas</span>
              </label>
            </div>
            {!form.unlimitedStock && (
              <input
                type="number"
                style={inputStyle}
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="100"
              />
            )}
            {errors.stock && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.stock}</p>}
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className="w-9 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer"
              style={{ background: form.isActive ? 'var(--success)' : 'var(--border)' }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: form.isActive ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {form.isActive ? 'Produk Aktif' : 'Produk Nonaktif'}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-sm font-bold"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
        </div>
      </form>
    </div>
  );
}
