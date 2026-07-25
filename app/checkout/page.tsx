'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/context/OrderContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/lib/mockData';
import { ShippingInfo } from '@/types';
import BackButton from '@/components/ui/BackButton';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { createOrder } = useOrder();
  const { showToast } = useToast();

  const items = Object.values(cart);

  // BUG-14 fix: track submission to prevent empty-cart guard from overriding redirect
  const submittedRef = useRef(false);

  const [form, setForm] = useState<ShippingInfo>({
    recipientName: user?.name ?? '',
    shippingAddress: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Partial<ShippingInfo & { form: string }>>({});
  const [loading, setLoading] = useState(false);

  // BUG-23 fix: add form.recipientName to deps
  useEffect(() => {
    if (user?.name && !form.recipientName) {
      setForm((f) => ({ ...f, recipientName: user.name }));
    }
  }, [user, form.recipientName]);

  // BUG-22 fix: add router + showToast to deps
  useEffect(() => {
    if (!isLoggedIn) {
      showToast('Silakan masuk terlebih dahulu.', 'error');
      router.replace('/login');
    }
  }, [isLoggedIn, showToast, router]);

  // BUG-14 + BUG-22 fix: skip guard if order was just submitted
  useEffect(() => {
    if (isLoggedIn && totalItems === 0 && !submittedRef.current) {
      showToast('Keranjang kosong.', 'error');
      router.replace('/cart');
    }
  }, [totalItems, isLoggedIn, showToast, router]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.recipientName.trim())    e.recipientName    = 'Nama penerima wajib diisi.';
    if (!form.shippingAddress.trim())  e.shippingAddress  = 'Alamat pengiriman wajib diisi.';
    if (!form.phoneNumber.trim())      e.phoneNumber      = 'Nomor telepon wajib diisi.';
    else if (!/^\+?[\d\s\-()]{8,15}$/.test(form.phoneNumber.trim()))
      e.phoneNumber = 'Format nomor telepon tidak valid.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await createOrder(items, form, totalPrice);
    setLoading(false);

    if (!result.success || !result.order) {
      setErrors({ form: result.message });
      showToast(result.message, 'error');
      return;
    }

    // BUG-14 fix: mark as submitted BEFORE clearCart to suppress the empty-cart guard
    submittedRef.current = true;
    clearCart();
    showToast(`Pesanan ${result.order.id} berhasil dibuat!`, 'success');
    router.push(`/orders/${result.order.id}`);
  }

  function setField(field: keyof ShippingInfo, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  if (!isLoggedIn || (totalItems === 0 && !submittedRef.current)) return null;

  return (
    <div className="min-h-screen bg-bloom-bg pt-20">
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <BackButton href="/cart" label="Kembali ke Keranjang" className="mb-4" />
          <nav className="flex items-center gap-2 text-sm text-bloom-secondary mb-4">
            <Link href="/" className="hover:text-bloom-text transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-bloom-text transition-colors">Keranjang</Link>
            <span>/</span>
            <span className="text-bloom-text font-medium">Checkout</span>
          </nav>
          <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-bold text-bloom-text tracking-tight">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up">

            {/* ── Left: Shipping Form ─────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Global error */}
              {errors.form && (
                <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-bloom-danger">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10a.875.875 0 110-1.75A.875.875 0 018 11zm.583-2.917H7.417V4.5h1.166v3.583z"/>
                  </svg>
                  {errors.form}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-7 space-y-6">
                <h2 className="text-base font-bold text-bloom-text flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Informasi Pengiriman
                </h2>

                {/* Recipient name */}
                <Field label="Nama Penerima" required error={errors.recipientName}>
                  <input type="text" value={form.recipientName} autoComplete="name"
                    placeholder="Nama lengkap penerima"
                    onChange={(e) => setField('recipientName', e.target.value)}
                    className={inputCls(!!errors.recipientName)} />
                </Field>

                {/* Shipping address */}
                <Field label="Alamat Pengiriman" required error={errors.shippingAddress}>
                  <textarea value={form.shippingAddress} rows={3} autoComplete="street-address"
                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi"
                    onChange={(e) => setField('shippingAddress', e.target.value)}
                    className={inputCls(!!errors.shippingAddress) + ' resize-none'} />
                </Field>

                {/* Phone */}
                <Field label="Nomor Telepon" required error={errors.phoneNumber}>
                  <input type="tel" value={form.phoneNumber} autoComplete="tel"
                    placeholder="contoh: 08123456789"
                    onChange={(e) => setField('phoneNumber', e.target.value)}
                    className={inputCls(!!errors.phoneNumber)} />
                </Field>
              </div>

              {/* Delivery info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                <p>Estimasi pengiriman <strong>hari ini</strong> untuk pesanan sebelum pukul 14.00. Pengiriman ke seluruh wilayah Indonesia.</p>
              </div>
            </div>

            {/* ── Right: Order Summary ────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-5 lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-bloom-text">Ringkasan Pesanan</h2>

                {/* Items */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {items.map(({ product, qty }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-bloom-surface">
                        <Image src={product.heroImage} alt={product.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-bloom-text truncate">{product.name}</p>
                        <p className="text-xs text-bloom-secondary">{qty} × {formatRupiah(product.price)}</p>
                      </div>
                      <span className="text-xs font-bold text-bloom-text flex-shrink-0">
                        {formatRupiah(product.price * qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-bloom-border" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-bloom-secondary">
                    <span>Subtotal ({totalItems} item)</span>
                    <span>{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-bloom-secondary">
                    <span>Ongkos kirim</span>
                    <span className="text-bloom-success font-medium">Gratis</span>
                  </div>
                </div>

                <div className="h-px bg-bloom-border" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-bloom-text">Total Pembayaran</span>
                  <span className="text-lg font-bold text-bloom-text">{formatRupiah(totalPrice)}</span>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-pill bg-bloom-text text-white font-semibold text-[15px] btn-press hover:bg-black/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <><svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
                      </svg>Memproses...</>
                    : <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Buat Pesanan
                      </>}
                </button>

                <Link href="/cart"
                  className="block text-center text-sm text-bloom-secondary hover:text-bloom-text transition-colors">
                  &larr; Kembali ke Keranjang
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm text-bloom-text placeholder-bloom-secondary/60 bg-bloom-surface outline-none transition-all duration-150 ${
    hasError
      ? 'border-bloom-danger ring-2 ring-bloom-danger/20'
      : 'border-bloom-border focus:border-bloom-text focus:ring-2 focus:ring-bloom-text/10'
  }`;
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-bloom-secondary uppercase tracking-wider">
        {label}{required && <span className="text-bloom-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-bloom-danger mt-1">{error}</p>}
    </div>
  );
}
