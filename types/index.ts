// ============================================================
// POS Application – Core TypeScript Types
// ============================================================

export type ProductCategory = 'food' | 'drink' | 'rental';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number | null;  // null = unlimited
  unit: string;          // 'porsi', 'botol', 'pcs', etc.
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart item (in standalone cart)
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris';

// PlayStation Rental types
export interface PSUnit {
  id: string;
  name: string; // e.g., "TV 1 - PS3"
  hourlyRate: number;
}

export type PSSessionStatus = 'active' | 'paused' | 'completed';
export type PSSessionMode = 'packet' | 'open'; // packet = pre-paid time, open = pay when done

export interface PSSession {
  id: string;
  psUnitId: string;
  status: PSSessionStatus;
  mode: PSSessionMode;
  startTime: string;
  endTime?: string;
  durationMinutes: number; // if packet mode
  elapsedMinutes: number;
  cart: CartItem[]; // Food/drink added to this session
  totalAmount: number;
}

// A completed transaction
export type TransactionType = 'cashier' | 'rental';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;              // ISO string
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid?: number;       // for cash payments
  change?: number;
  note?: string;
  status?: string;
  cancelReason?: string;
}

// Summary for dashboard
export interface DailySummary {
  date: string;
  totalRevenue: number;
  transactionCount: number;
}

// App-wide settings persisted in localStorage
export interface AppSettings {
  shopName: string;
  currency: string;
  taxPercent: number;
}
