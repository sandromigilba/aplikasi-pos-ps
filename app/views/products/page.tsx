'use client';
import ProductList from '@/components/products/ProductList';

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Kelola produk, stok, dan harga. Stok akan berkurang otomatis saat transaksi berhasil.
      </p>
      <ProductList />
    </div>
  );
}
