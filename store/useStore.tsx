// ============================================================
// Central App Store — React context + IndexedDB + LocalStorage
// ============================================================
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Product,
  Transaction,
  AppSettings,
  CartItem,
  PaymentMethod,
  
} from '../types';
import {
  getAllProducts,
  createProduct,
  updateProductAPI,
  deleteProduct,
  getAllTransactions,
  saveTransaction,
  cancelTransactionApi,
  exportAllData,
  importAllData,
  getSettingsApi,
  saveSettingApi,
} from './db';

// ---- helpers ----
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function now(): string {
  return new Date().toISOString();
}

const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'My Retail Store',
  currency: 'IDR',
  taxPercent: 0,
};

// ---- Context Definition ----
interface StoreContextType {
  // State
  isLoading: boolean;
  settings: AppSettings;
  products: Product[];
  transactions: Transaction[];
  

  // Actions
  updateSettings: (s: Partial<AppSettings>) => void;
  
  // Product actions
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;

  // Transactions
  checkout: (
    items: CartItem[],
    paymentMethod: PaymentMethod,
    amountPaid?: number,
    note?: string
  ) => Promise<void>;
  cancelTransaction: (id: string, reason: string) => Promise<void>;

  // Backup / Restore
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // ---- Auto Sync Offline Transactions ----
  const syncOfflineTransactions = useCallback(async () => {
    if (!navigator.onLine) return;
    const q: Transaction[] = JSON.parse(localStorage.getItem('pos_offline_tx') || '[]');
    if (q.length === 0) return;
    
    console.log(`Syncing ${q.length} offline transactions...`);
    const remaining = [];
    let syncedCount = 0;
    
    for (const tx of q) {
      try {
        const savedTx = await saveTransaction(tx);
        savedTx.status = 'completed';
        setTransactions(prev => prev.map(t => t.id === tx.id ? savedTx : t));
        syncedCount++;
      } catch (err) {
        remaining.push(tx);
      }
    }
    
    if (remaining.length > 0) {
      localStorage.setItem('pos_offline_tx', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('pos_offline_tx');
    }
    
    if (syncedCount > 0) {
      window.dispatchEvent(new Event('offline-tx-updated'));
    }
  }, []);
  // Init / Load Data
  useEffect(() => {
    async function init() {
      try {
        // First try to sync any offline txs before we pull DB state
        await syncOfflineTransactions();

        // Load settings from API
        const apiSettings = await getSettingsApi();
        if (Object.keys(apiSettings).length > 0) {
          const loaded: Partial<AppSettings> = {};
          if (apiSettings.shopName) loaded.shopName = apiSettings.shopName;
          if (apiSettings.currency) loaded.currency = apiSettings.currency;
          if (apiSettings.taxPercent) loaded.taxPercent = Number(apiSettings.taxPercent);
          setSettings(prev => ({ ...prev, ...loaded }));
          

        }

        // Load DB data
        const [dbProducts, dbTxs] = await Promise.all([
          getAllProducts(),
          getAllTransactions()
        ]);
        
        setProducts(dbProducts);
        setTransactions(dbTxs);
      } catch (err) {
        console.error('Failed to init store:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();

    window.addEventListener('online', syncOfflineTransactions);
    return () => window.removeEventListener('online', syncOfflineTransactions);
  }, [syncOfflineTransactions]);

  // ---- Settings ----
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to API
      Object.entries(newSettings).forEach(([k, v]) => {
        saveSettingApi(k, typeof v === 'object' ? JSON.stringify(v) : String(v)).catch(console.error);
      });
      
      return updated;
    });
  }, []);

  // ---- PS Units ----

  // ---- Products ----
  const addProduct = useCallback(async (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    // frontend mock structure
    const tempProduct: Product = {
      ...p,
      id: generateId(), // Will be ignored by backend create, but good for type check
      createdAt: now(),
      updatedAt: now(),
    };
    const saved = await createProduct(tempProduct);
    setProducts(prev => [...prev, saved]);
  }, []);

  const updateProduct = useCallback(async (p: Product) => {
    const updated = { ...p, updatedAt: now() };
    await updateProductAPI(updated);
    setProducts(prev => prev.map(old => old.id === p.id ? updated : old));
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ---- Checkout ----
  const checkout = useCallback(async (
    items: CartItem[],
    paymentMethod: PaymentMethod,
    amountPaid?: number,
    note?: string
  ) => {
    const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
    const change = paymentMethod === 'cash' && amountPaid ? amountPaid - totalAmount : 0;

    const tx: Transaction = {
      id: generateId(),
      type: 'cashier',
      date: now(),
      items,
      totalAmount,
      paymentMethod,
      amountPaid,
      change,
      note,
    };

    // Optimistic local stock reduction
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock !== null) {
        const newStock = Math.max(0, product.stock - item.quantity);
        setProducts(prev => prev.map(old => old.id === product.id ? { ...product, stock: newStock } : old));
      }
    }

    try {
      const savedTx = await saveTransaction(tx);
      savedTx.status = 'completed';
      setTransactions(prev => [...prev, savedTx]);
    } catch (err) {
      console.warn("Offline mode active. Saving transaction to queue.");
      tx.status = 'pending_sync';
      setTransactions(prev => [...prev, tx]);
      
      const q = JSON.parse(localStorage.getItem('pos_offline_tx') || '[]');
      q.push(tx);
      localStorage.setItem('pos_offline_tx', JSON.stringify(q));
      window.dispatchEvent(new Event('offline-tx-updated'));
    }
  }, [products]);



  // ---- Backup / Restore ----
  const exportData = useCallback(async () => {
    const data = await exportAllData();
    const fullData = {
      ...data,
      settings,
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  const importData = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          
          if (json.settings) {
            updateSettings(json.settings);
          }
          
          await importAllData({
            products: json.products || [],
            transactions: json.transactions || [],
          });
          
          // Reload page to reflect changes
          window.location.reload();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }, [updateSettings]);

  const cancelTransaction = useCallback(async (id: string, reason: string) => {
    const updated = await cancelTransactionApi(id, reason);
    setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    const prods = await getAllProducts();
    setProducts(prods);
  }, []);

  const value: StoreContextType = {
    isLoading,
    settings,
    products,
    transactions,
    
    updateSettings,
    addProduct,
    updateProduct,
    removeProduct,
    checkout,
        cancelTransaction,
    exportData,
    importData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
