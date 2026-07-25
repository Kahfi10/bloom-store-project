'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { CartItem, Order, OrderStatus, ShippingInfo } from '@/types';

// ─── Valid status transitions (PRD §Modul 5) ───────────────────────────────
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ─── Context type ───────────────────────────────────────────────────────────
interface OrderContextType {
  orders: Order[];
  createOrder: (
    items: CartItem[],
    shipping: ShippingInfo,
    totalPrice: number
  ) => Promise<{ success: boolean; message: string; order?: Order }>;
  updateStatus: (
    orderId: string,
    newStatus: OrderStatus
  ) => Promise<{ success: boolean; message: string }>;
  getOrder: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | null>(null);

// ─── Map API response → frontend Order type ─────────────────────────────────
function mapApiOrder(apiOrder: Record<string, unknown>, originalItems: CartItem[]): Order {
  return {
    id:         apiOrder.id as string,
    items:      originalItems,
    totalPrice: apiOrder.totalPrice as number,
    shipping: {
      recipientName:   apiOrder.recipientName as string,
      shippingAddress: apiOrder.shippingAddress as string,
      phoneNumber:     apiOrder.phoneNumber as string,
    },
    status:    apiOrder.status as OrderStatus,
    createdAt: apiOrder.createdAt as string,
  };
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  // ── Create order ──────────────────────────────────────────────────────────
  const createOrder = useCallback(
    async (
      items: CartItem[],
      shipping: ShippingInfo,
      totalPrice: number
    ): Promise<{ success: boolean; message: string; order?: Order }> => {
      // Frontend validations before hitting API
      if (!items.length)
        return { success: false, message: 'Keranjang kosong, tidak dapat membuat pesanan.' };
      if (!shipping.recipientName.trim())
        return { success: false, message: 'Nama penerima wajib diisi.' };
      if (!shipping.shippingAddress.trim())
        return { success: false, message: 'Alamat pengiriman wajib diisi.' };
      if (!shipping.phoneNumber.trim())
        return { success: false, message: 'Nomor telepon wajib diisi.' };

      try {
        const res = await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.product.id,
              qty:       i.qty,
            })),
            recipientName:   shipping.recipientName.trim(),
            shippingAddress: shipping.shippingAddress.trim(),
            phoneNumber:     shipping.phoneNumber.trim(),
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          return { success: false, message: json.message ?? 'Gagal membuat pesanan.' };
        }

        const order = mapApiOrder(json.data, items);
        setOrders((prev) => [order, ...prev]);
        return { success: true, message: json.message, order };
      } catch {
        return { success: false, message: 'Koneksi gagal. Coba lagi.' };
      }
    },
    []
  );

  // ── Update status ─────────────────────────────────────────────────────────
  const updateStatus = useCallback(
    async (
      orderId: string,
      newStatus: OrderStatus
    ): Promise<{ success: boolean; message: string }> => {
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
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: newStatus }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          return { success: false, message: json.message ?? 'Gagal memperbarui status.' };
        }

        // Update local state
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
    <OrderContext.Provider value={{ orders, createOrder, updateStatus, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useOrder(): OrderContextType {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within <OrderProvider>');
  return ctx;
}
