import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import ProductCatalog from '../components/cashier/ProductCatalog';
import Cart from '../components/cashier/Cart';
import PaymentModal from '../components/cashier/PaymentModal';
import type { CartItem } from '../types';

export default function CashierPage() {
  const { products } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === item.productId);
      if (existing) {
        return prev.map(c =>
          c.productId === item.productId
            ? { ...c, quantity: c.quantity + 1, subtotal: c.unitPrice * (c.quantity + 1) }
            : c
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.productId !== productId));
      return;
    }
    setCart(prev =>
      prev.map(c =>
        c.productId === productId
          ? { ...c, quantity: qty, subtotal: c.unitPrice * qty }
          : c
      )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  }, []);

  const total = cart.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div className="flex gap-6 h-full pb-2">
      {/* Left: Product Catalog */}
      <div className="flex-1 min-w-0">
        <ProductCatalog products={products} onAddToCart={addToCart} />
      </div>

      {/* Right: Cart */}
      <div style={{ width: '380px', flexShrink: 0 }}>
        <Cart
          items={cart}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onCheckout={() => setShowPayment(true)}
          total={total}
        />
      </div>

      {showPayment && (
        <PaymentModal
          items={cart}
          total={total}
          onClose={() => setShowPayment(false)}
          onSuccess={() => setCart([])}
        />
      )}
    </div>
  );
}
