'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem, Order, OrderStatus, ShippingInfo } from '@/types';

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const STORAGE_KEY = 'bloom_orders';

interface OrderContextType {
  orders:   Order[];
  hydrated: boolean;        // true setelah localStorage selesai dibaca
  createOrder: (items: CartItem[], shipping: ShippingInfo, totalPrice: number) =>
    Promise<{ success: boolean; message: string; order?: Order }>;
  updateStatus: (orderId: string, newStatus: OrderStatus) =>
    Promise<{ success: boolean; message: string }>;
  getOrder: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | null>(null);

// BUG-21 fix: map API response to frontend Order, using API items not stale cart items
function mapApiOrder(apiOrder: Record<string, unknown>, fallbackItems: CartItem[]): Order {
  // Prefer API-returned items (server-verified prices); fall back to cart items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiItems = (apiOrder.items as any[]) ?? [];
  const mappedItems: CartItem[] = apiItems.length > 0
    ? apiItems.map((i) => ({
        product: i.product,
        qty:     i.qty,
      }))
    : fallbackItems;

  return {
    id:         apiOrder.id as string,
    items:      mappedItems,
    totalPrice: apiOrder.totalPrice as number,
    shipping: {
      recipientName:   apiOrder.recipientName   as string,
      shippingAddress: apiOrder.shippingAddress as string,
      phoneNumber:     apiOrder.phoneNumber     as string,
    },
    status:    apiOrder.status as OrderStatus,
    createdAt: apiOrder.createdAt as string,
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false); // true after localStorage read

  // Hydrate from localStorage on mount — set hydrated=true AFTER
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setOrders(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true); // mark as done regardless of success/failure
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return; // don't persist the initial empty array
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch { /* quota exceeded or private browsing */ }
  }, [orders, hydrated]);

  // ── Create order ────────────────────────────────────────────────────────────
  const createOrder = useCallback(
    async (items: CartItem[], shipping: ShippingInfo, totalPrice: number) => {
      if (!items.length)
        return { success: false, message: 'Keranjang kosong, tidak dapat membuat pesanan.' };
      if (!shipping.recipientName.trim())
        return { success: false, message: 'Nama penerima wajib diisi.' };
      if (!shipping.shippingAddress.trim())
        return { success: false, message: 'Alamat pengiriman wajib diisi.' };
      if (!shipping.phoneNumber.trim())
        return { success: false, message: 'Nomor telepon wajib diisi.' };

      try {
        const res  = await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
            recipientName:   shipping.recipientName.trim(),
            shippingAddress: shipping.shippingAddress.trim(),
            phoneNumber:     shipping.phoneNumber.trim(),
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success)
          return { success: false, message: json.message ?? 'Gagal membuat pesanan.' };

        const order = mapApiOrder(json.data, items);
        setOrders((prev) => [order, ...prev]);
        return { success: true, message: json.message, order };
      } catch {
        return { success: false, message: 'Koneksi gagal. Coba lagi.' };
      }
    },
    []
  );

  // ── Update status ───────────────────────────────────────────────────────────
  const updateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return { success: false, message: 'Pesanan tidak ditemukan.' };

      const allowed = VALID_TRANSITIONS[order.status];
      if (!allowed.includes(newStatus)) {
        if (order.status === 'COMPLETED')
          return { success: false, message: 'Pesanan selesai tidak dapat diubah.' };
        if (order.status === 'CANCELLED')
          return { success: false, message: 'Pesanan yang dibatalkan tidak dapat diaktifkan kembali.' };
        return { success: false, message: `Transisi dari ${order.status} ke ${newStatus} tidak diizinkan.` };
      }

      try {
        const res  = await fetch(`/api/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: newStatus }),
        });
        const json = await res.json();
        if (!res.ok || !json.success)
          return { success: false, message: json.message ?? 'Gagal memperbarui status.' };

        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        return { success: true, message: json.message };
      } catch {
        return { success: false, message: 'Koneksi gagal. Coba lagi.' };
      }
    },
    [orders]
  );

  const getOrder = useCallback(
    (orderId: string) => orders.find((o) => o.id === orderId),
    [orders]
  );

  return (
    <OrderContext.Provider value={{ orders, hydrated, createOrder, updateStatus, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder(): OrderContextType {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within <OrderProvider>');
  return ctx;
}
