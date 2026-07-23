'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/lib/mockData';

interface AddToCartWidgetProps {
  product: Product;
}

export default function AddToCartWidget({ product }: AddToCartWidgetProps) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();

  const outOfStock = product.stock === 0;
  const alreadyInCart = cart[product.id]?.qty ?? 0;
  const maxAddable = Math.min(10 - alreadyInCart, product.stock - alreadyInCart);

  function decrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQty((q) => Math.min(maxAddable, q + 1));
  }

  function handleQtyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQty(1);
    } else {
      setQty(Math.min(maxAddable, parsed));
    }
  }

  function handleAddToCart() {
    if (outOfStock || maxAddable <= 0) return;
    setLoading(true);
    const result = addToCart(product, qty);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setQty(1);
    setTimeout(() => setLoading(false), 350);
  }

  return (
    <div className="space-y-5">
      {/* ── Price ──────────────────────────────────── */}
      <div>
        <p className="text-[2rem] font-bold text-bloom-text tracking-tight leading-none">
          {formatRupiah(product.price)}
        </p>
        <p className="text-sm text-bloom-secondary mt-1">Harga per tangkai / rangkaian</p>
      </div>

      {/* ── Stock Notice ───────────────────────────── */}
      {!outOfStock && maxAddable <= 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10a.875.875 0 110-1.75A.875.875 0 018 11zm.583-2.917H7.417V4.5h1.166v3.583z" />
          </svg>
          Anda sudah menambahkan maksimum ({alreadyInCart} unit) ke keranjang.
        </div>
      )}

      {/* ── Qty Stepper ────────────────────────────── */}
      {!outOfStock && maxAddable > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-bloom-secondary uppercase tracking-wider">
            Jumlah
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-bloom-border rounded-pill overflow-hidden bg-bloom-surface">
              <button
                onClick={decrement}
                disabled={qty <= 1}
                aria-label="Kurangi jumlah"
                className="w-10 h-10 flex items-center justify-center text-bloom-text hover:bg-bloom-border/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="2" viewBox="0 0 14 2" fill="currentColor">
                  <rect width="14" height="2" rx="1" />
                </svg>
              </button>

              <input
                type="number"
                value={qty}
                min={1}
                max={maxAddable}
                onChange={handleQtyInput}
                className="w-12 h-10 text-center text-sm font-semibold text-bloom-text bg-transparent border-none outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onClick={increment}
                disabled={qty >= maxAddable}
                aria-label="Tambah jumlah"
                className="w-10 h-10 flex items-center justify-center text-bloom-text hover:bg-bloom-border/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="6" width="2" height="14" rx="1" />
                  <rect y="6" width="14" height="2" rx="1" />
                </svg>
              </button>
            </div>

            <span className="text-sm text-bloom-secondary">
              Maks. {maxAddable} unit
            </span>
          </div>
        </div>
      )}

      {/* ── Add to Cart Button ─────────────────────── */}
      <button
        onClick={handleAddToCart}
        disabled={outOfStock || maxAddable <= 0 || loading}
        className={`
          btn-press w-full h-14 rounded-pill text-[15px] font-semibold
          flex items-center justify-center gap-2.5
          transition-all duration-200
          ${
            outOfStock || maxAddable <= 0
              ? 'bg-bloom-surface text-bloom-secondary cursor-not-allowed border border-bloom-border'
              : 'bg-bloom-text text-white hover:bg-black/80 shadow-sm'
          }
        `}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        )}
        {outOfStock
          ? 'Stok Habis'
          : maxAddable <= 0
          ? 'Sudah di Keranjang (Maks)'
          : loading
          ? 'Menambahkan...'
          : `Tambah ke Keranjang${qty > 1 ? ` (${qty})` : ''}`}
      </button>

      {/* Cart summary if already in cart */}
      {alreadyInCart > 0 && (
        <p className="text-center text-sm text-bloom-secondary">
          Keranjang kamu sudah punya{' '}
          <span className="font-semibold text-bloom-text">{alreadyInCart} unit</span> produk ini.
        </p>
      )}
    </div>
  );
}
