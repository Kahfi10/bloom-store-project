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
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],   // locked
  CANCELLED: [],   // locked
};

function generateOrderId(): string {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BLM-${ts}-${rand}`;
}

// ─── Context Type ───────────────────────────────────────────────────────────
interface OrderContextType {
  orders: Order[];
  createOrder: (
    items: CartItem[],
    shipping: ShippingInfo,
    totalPrice: number
  ) => { success: boolean; message: string; order?: Order };
  updateStatus: (
    orderId: string,
    newStatus: OrderStatus
  ) => { success: boolean; message: string };
  getOrder: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = useCallback(
    (
      items: CartItem[],
      shipping: ShippingInfo,
      totalPrice: number
    ): { success: boolean; message: string; order?: Order } => {
      // Guard: cart must not be empty
      if (!items.length) {
        return { success: false, message: 'Keranjang kosong, tidak dapat membuat pesanan.' };
      }
      // Guard: validate each item qty
      for (const item of items) {
        if (!Number.isInteger(item.qty) || item.qty < 1) {
          return { success: false, message: `Jumlah ${item.product.name} tidak valid.` };
        }
        if (item.qty > item.product.stock) {
          return {
            success: false,
            message: `Stok ${item.product.name} tidak mencukupi (tersedia ${item.product.stock}).`,
          };
        }
      }
      // Guard: shipping fields
      if (!shipping.recipientName.trim()) {
        return { success: false, message: 'Nama penerima wajib diisi.' };
      }
      if (!shipping.shippingAddress.trim()) {
        return { success: false, message: 'Alamat pengiriman wajib diisi.' };
      }
      if (!shipping.phoneNumber.trim()) {
        return { success: false, message: 'Nomor telepon wajib diisi.' };
      }

      const order: Order = {
        id: generateOrderId(),
        items,
        totalPrice,
        shipping,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [order, ...prev]);
      return { success: true, message: `Pesanan ${order.id} berhasil dibuat.`, order };
    },
    []
  );

  const updateStatus = useCallback(
    (orderId: string, newStatus: OrderStatus): { success: boolean; message: string } => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        return { success: false, message: 'Pesanan tidak ditemukan.' };
      }

      const allowed = VALID_TRANSITIONS[order.status];

      if (!allowed.includes(newStatus)) {
        // Descriptive error per PRD §5
        if (order.status === 'COMPLETED') {
          return { success: false, message: 'Pesanan selesai tidak dapat diubah.' };
        }
        if (order.status === 'CANCELLED') {
          return { success: false, message: 'Pesanan yang dibatalkan tidak dapat diaktifkan kembali.' };
        }
        return {
          success: false,
          message: `Perubahan status dari ${order.status} ke ${newStatus} tidak diizinkan.`,
        };
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      return { success: true, message: `Status pesanan diperbarui menjadi ${newStatus}.` };
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

// ─── Export valid transitions (useful for UI) ───────────────────────────────
export { VALID_TRANSITIONS };
