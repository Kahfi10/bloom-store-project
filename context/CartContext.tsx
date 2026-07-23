'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Product, CartItem, CartStore, CartActionResult } from '@/types';

interface CartContextType {
  cart: CartStore;
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, qty?: number) => CartActionResult;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, qty: number) => CartActionResult;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartStore>({});

  const addToCart = useCallback(
    (product: Product, qty: number = 1): CartActionResult => {
      // Validate qty
      if (!Number.isInteger(qty) || qty < 1) {
        return { success: false, message: 'Jumlah tidak valid.' };
      }
      if (product.stock === 0) {
        return { success: false, message: 'Stok produk habis.' };
      }

      const currentQty = cart[product.id]?.qty ?? 0;
      const newQty = currentQty + qty;

      if (newQty > 10) {
        return {
          success: false,
          message: `Maksimum 10 unit per produk. Saat ini sudah ${currentQty} unit.`,
        };
      }
      if (newQty > product.stock) {
        return {
          success: false,
          message: `Stok tidak mencukupi. Tersedia: ${product.stock} unit.`,
        };
      }

      setCart((prev) => ({
        ...prev,
        [product.id]: { product, qty: newQty },
      }));
      return { success: true, message: `${product.name} ditambahkan ke keranjang.` };
    },
    [cart]
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const updateQty = useCallback(
    (productId: number, qty: number): CartActionResult => {
      if (!Number.isInteger(qty) || qty < 1) {
        return { success: false, message: 'Jumlah tidak valid. Minimum 1 unit.' };
      }
      if (qty > 10) {
        return { success: false, message: 'Maksimum 10 unit per produk.' };
      }

      const item = cart[productId];
      if (!item) {
        return { success: false, message: 'Produk tidak ditemukan di keranjang.' };
      }
      if (qty > item.product.stock) {
        return {
          success: false,
          message: `Stok tidak mencukupi. Tersedia: ${item.product.stock} unit.`,
        };
      }

      setCart((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], qty },
      }));
      return { success: true, message: 'Jumlah diperbarui.' };
    },
    [cart]
  );

  const clearCart = useCallback(() => setCart({}), []);

  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.qty,
    0
  );
  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, totalItems, totalPrice, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
