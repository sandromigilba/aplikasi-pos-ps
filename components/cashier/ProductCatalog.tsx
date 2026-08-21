import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { Product, CartItem, ProductCategory } from '../../types';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (item: CartItem) => void;
}

const CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'food', label: 'Makanan' },
  { id: 'drink', label: 'Minuman' },
  { id: 'rental', label: 'Rental PS' },
];

export default function ProductCatalog({ products, onAddToCart }: ProductCatalogProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!p.isActive) return false;
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, search, activeCategory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!search || filtered.length === 0) return;
    
    const maxItems = Math.min(filtered.length, 5);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % maxItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + maxItems) % maxItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const p = filtered[selectedIndex];
      if (p && (p.stock === null || p.stock > 0)) {
        onAddToCart({
          productId: p.id,
          productName: p.name,
          quantity: 1,
          unitPrice: p.price,
          subtotal: p.price,
        });
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      setSearch('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full input-float text-sm font-medium"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Cari menu produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          {/* Autocomplete Dropdown */}
          {search && filtered.length > 0 && (
            <ul 
              className="absolute z-50 w-full mt-2 rounded-xl shadow-lg overflow-hidden" 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {filtered.slice(0, 5).map((p, idx) => (
                <li key={p.id}>
                  <button
                    className="w-full text-left px-4 py-3 text-sm transition-colors flex justify-between items-center"
                    style={{ 
                      background: idx === selectedIndex ? 'var(--bg-hover)' : 'transparent',
                      color: 'var(--text-primary)',
                      borderBottom: idx < Math.min(filtered.length, 5) - 1 ? '1px solid var(--border)' : 'none'
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      if (p.stock !== null && p.stock <= 0) return;
                      onAddToCart({
                        productId: p.id,
                        productName: p.name,
                        quantity: 1,
                        unitPrice: p.price,
                        subtotal: p.price,
                      });
                      setSearch('');
                    }}
                    disabled={p.stock !== null && p.stock <= 0}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {CATEGORIES.find(c => c.id === p.category)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.stock !== null && p.stock <= 0 ? (
                        <span className="text-xs font-bold" style={{ color: 'var(--danger)' }}>HABIS</span>
                      ) : (
                        <span className="font-bold" style={{ color: 'var(--accent)' }}>Rp {p.price.toLocaleString('id-ID')}</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Categories Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className="px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
            style={{
              background: activeCategory === c.id ? 'var(--accent)' : 'var(--bg-card)',
              color: activeCategory === c.id ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${activeCategory === c.id ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: activeCategory === c.id ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'var(--shadow-sm)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-gray-400 font-medium">Tidak ada produk ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.stock !== null && p.stock <= 0) return;
                  onAddToCart({
                    productId: p.id,
                    productName: p.name,
                    quantity: 1,
                    unitPrice: p.price,
                    subtotal: p.price,
                  });
                }}
                disabled={p.stock !== null && p.stock <= 0}
                className={`glass-card p-4 flex flex-col text-left transition-transform hover:-translate-y-1 ${
                  p.stock !== null && p.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 leading-tight mb-1">{p.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Harga</p>
                    <p className="font-bold text-indigo-600 text-lg">
                      Rp {p.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {p.stock !== null && (
                    <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      Sisa: {p.stock}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
