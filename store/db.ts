// ============================================================
// Database Service via FastAPI Backend
// ============================================================
import type { Product, Transaction } from '../types';

// ---- Mappers ----
function mapProductToApi(p: Product): any {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    unit: p.unit,
    is_active: p.isActive,
  };
}

function mapProductFromApi(api: any): Product {
  return {
    id: api.id,
    name: api.name,
    category: api.category,
    price: api.price,
    stock: api.stock,
    unit: api.unit,
    isActive: api.is_active,
    createdAt: new Date().toISOString(), // stub
    updatedAt: new Date().toISOString(), // stub
  };
}

function mapTransactionToApi(tx: Transaction): any {
  return {
    id: tx.id,
    type: tx.type,
    total_amount: tx.totalAmount,
    payment_method: tx.paymentMethod,
    amount_paid: tx.amountPaid,
    change: tx.change,
    note: tx.note,
    items: tx.items.map(i => ({
      product_id: i.productId,
      product_name: i.productName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      subtotal: i.subtotal,
    })),
  };
}

function mapTransactionFromApi(api: any): Transaction {
  return {
    id: api.id,
    type: api.type,
    date: api.date,
    totalAmount: api.total_amount,
    paymentMethod: api.payment_method,
    amountPaid: api.amount_paid,
    change: api.change,
    note: api.note,
    status: api.status,
    cancelReason: api.cancel_reason,
    items: (api.items || []).map((i: any) => ({
      productId: i.product_id,
      productName: i.product_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      subtotal: i.subtotal,
    })),
  };
}

// ---- Product CRUD ----
export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch('/api/products/');
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.map(mapProductFromApi);
}

export async function createProduct(product: Product): Promise<Product> {
  const payload = mapProductToApi(product);
  const res = await fetch('/api/products/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create product');
  const data = await res.json();
  return mapProductFromApi(data);
}

export async function updateProductAPI(product: Product): Promise<void> {
  const payload = mapProductToApi(product);
  const res = await fetch(`/api/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update product');
}

export async function deleteProduct(id: string): Promise<void> {
  await fetch(`/api/products/${id}`, { method: 'DELETE' });
}

// ---- Transaction CRUD ----
export async function getAllTransactions(): Promise<Transaction[]> {
  const res = await fetch('/api/transactions/');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data = await res.json();
  return data.map(mapTransactionFromApi);
}

export async function saveTransaction(tx: Transaction): Promise<Transaction> {
  const payload = mapTransactionToApi(tx);
  const res = await fetch('/api/transactions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save transaction');
  const data = await res.json();
  return mapTransactionFromApi(data);
}

// ---- Settings API ----
export async function getSettingsApi(): Promise<Record<string, string>> {
  const res = await fetch('/api/settings/');
  if (!res.ok) return {};
  const data = await res.json();
  const map: Record<string, string> = {};
  for (const item of data) {
    map[item.key] = item.value;
  }
  return map;
}

export async function saveSettingApi(key: string, value: string): Promise<void> {
  await fetch('/api/settings/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
}

// ---- Backup / Restore ----
export async function exportAllData(): Promise<object> {
  const [products, transactions] = await Promise.all([
    getAllProducts(),
    getAllTransactions(),
  ]);
  return { products, transactions };
}

export async function importAllData(data: any): Promise<void> {
  const payload = {
    products: (data.products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      unit: p.unit,
      is_active: p.isActive
    })),
    transactions: (data.transactions || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      date: t.date,
      total_amount: t.totalAmount,
      payment_method: t.paymentMethod,
      amount_paid: t.amountPaid,
      change: t.change,
      note: t.note,
      status: t.status || 'completed',
      cancel_reason: t.cancelReason,
      items: (t.items || []).map((i: any) => ({
        product_id: i.productId,
        product_name: i.productName,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        subtotal: i.subtotal
      }))
    }))
  };

  const res = await fetch('/api/restore/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to restore data');
}

export async function cancelTransactionApi(id: string, reason: string): Promise<Transaction> {
  const res = await fetch(`/api/transactions/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to cancel transaction');
  const data = await res.json();
  return mapTransactionFromApi(data);
}
