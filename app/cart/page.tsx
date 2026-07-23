'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/lib/mockData';
import { CartItem } from '@/types';

// ─── Single cart row ────────────────────────────────────────────────────────
function CartRow({ item, onQtyChange, onRemove }: {
  item: CartItem;
  onQtyChange: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  const { product, qty } = item;
  const maxQty = Math.min(10, product.stock);

  return (
    <div className="flex gap-4 py-5 border-b border-bloom-border/60 last:border-0">
      {/* Thumbnail */}
      <Link href={`/products/${product.slug}`}
        className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-bloom-surface img-zoom-container">
        <Image src={product.heroImage} alt={product.name} fill className="object-cover" sizes="80px" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${product.slug}`}
              className="text-sm font-semibold text-bloom-text hover:opacity-70 transition-opacity leading-snug">
              {product.name}
            </Link>
            <p className="text-xs text-bloom-secondary mt-0.5">{product.category}</p>
          </div>
          {/* Remove */}
          <button onClick={() => onRemove(product.id)}
            aria-label={`Hapus ${product.name} dari keranjang`}
            className="flex-shrink-0 p-1 text-bloom-secondary hover:text-bloom-danger transition-colors rounded">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>

        {/* Qty stepper + line total */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center border border-bloom-border rounded-full bg-white overflow-hidden">
            <button onClick={() => onQtyChange(product.id, qty - 1)} disabled={qty <= 1}
              className="w-8 h-8 flex items-center justify-center text-bloom-text hover:bg-bloom-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1"/></svg>
            </button>
            <span className="w-8 text-center text-sm font-semibold text-bloom-text select-none">{qty}</span>
            <button onClick={() => onQtyChange(product.id, qty + 1)} disabled={qty >= maxQty}
              className="w-8 h-8 flex items-center justify-center text-bloom-text hover:bg-bloom-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="5" width="2" height="12" rx="1"/><rect y="5" width="12" height="2" rx="1"/>
              </svg>
            </button>
          </div>
          <span className="text-sm font-bold text-bloom-text">
            {formatRupiah(product.price * qty)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Empty cart state ───────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-bloom-surface flex items-center justify-center mb-2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.4" strokeLinecap="round" className="text-bloom-secondary">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-bloom-text">Keranjang Kosong</h2>
      <p className="text-sm text-bloom-secondary max-w-xs">
        Belum ada produk di keranjang. Yuk, mulai belanja bunga pilihan kami!
      </p>
      <Link href="/#produk"
        className="mt-2 inline-flex items-center gap-2 h-11 px-7 bg-bloom-text text-white text-sm font-semibold rounded-pill btn-press hover:bg-black/80 transition-all">
        Lihat Produk
      </Link>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const { cart, totalItems, totalPrice, updateQty, removeFromCart } = useCart();
  const { showToast } = useToast();
  const { isLoggedIn } = useAuth();

  const items = Object.values(cart);
  const isEmpty = items.length === 0;

  function handleQtyChange(productId: number, newQty: number) {
    const result = updateQty(productId, newQty);
    if (!result.success) showToast(result.message, 'error');
  }

  function handleRemove(productId: number) {
    removeFromCart(productId);
    showToast('Produk dihapus dari keranjang.', 'info');
  }

  function handleCheckout() {
    if (!isLoggedIn) {
      showToast('Silakan masuk terlebih dahulu untuk checkout.', 'error');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  }

  return (
    <div className="min-h-screen bg-bloom-bg pt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-bold text-bloom-text tracking-tight">
            Keranjang Belanja
          </h1>
          {!isEmpty && (
            <p className="text-sm text-bloom-secondary mt-1">{totalItems} produk dipilih</p>
          )}
        </div>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up">

            {/* ── Left: Cart Items ──────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-bloom-border shadow-card px-6">
                {items.map((item) => (
                  <CartRow
                    key={item.product.id}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              <Link href="/#produk"
                className="inline-flex items-center gap-1.5 mt-5 text-sm text-bloom-secondary hover:text-bloom-text transition-colors group">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:-translate-x-0.5 transition-transform">
                  <path d="M9 2.5L4.5 7 9 11.5"/>
                </svg>
                Lanjut Belanja
              </Link>
            </div>

            {/* ── Right: Order Summary ──────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-5 lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-bloom-text">Ringkasan Pesanan</h2>

                {/* Item breakdown */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-bloom-secondary truncate pr-3">
                        {item.product.name} <span className="text-bloom-border">×{item.qty}</span>
                      </span>
                      <span className="font-medium text-bloom-text flex-shrink-0">
                        {formatRupiah(item.product.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-bloom-border" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-bloom-text">Total</span>
                  <span className="text-xl font-bold text-bloom-text">{formatRupiah(totalPrice)}</span>
                </div>

                {/* Auth notice */}
                {!isLoggedIn && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="mt-0.5 flex-shrink-0">
                      <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9a.875.875 0 110-1.75A.875.875 0 017 10zm.583-2.917H6.417V4.5h1.166v3.583z"/>
                    </svg>
                    Kamu perlu <Link href="/login" className="font-semibold underline mx-1">masuk</Link> sebelum checkout.
                  </div>
                )}

                {/* Checkout button */}
                <button onClick={handleCheckout}
                  className="w-full h-12 rounded-pill bg-bloom-text text-white font-semibold text-[15px] btn-press hover:bg-black/80 transition-all flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6"/>
                    <path d="M16 2l6 6-8 8H8v-6l8-8z"/>
                  </svg>
                  Lanjut ke Checkout
                </button>

                <p className="text-xs text-center text-bloom-secondary">
                  Pesanan akan dikonfirmasi setelah pengiriman
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
