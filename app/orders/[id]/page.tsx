'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useOrder, VALID_TRANSITIONS } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/lib/mockData';
import { OrderStatus } from '@/types';
import BackButton from '@/components/ui/BackButton';

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; dot: string; desc: string }> = {
  DRAFT:     { label: 'Draft',     bg: 'bg-gray-100',  text: 'text-gray-600',      dot: 'bg-gray-400',        desc: 'Pesanan baru dibuat, menunggu konfirmasi.' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50',   text: 'text-blue-700',      dot: 'bg-blue-500',        desc: 'Pesanan telah dikonfirmasi dan sedang diproses.' },
  COMPLETED: { label: 'Completed', bg: 'bg-green-50',  text: 'text-green-700',     dot: 'bg-bloom-success',   desc: 'Pesanan telah selesai dan diterima.' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-bloom-danger',  dot: 'bg-bloom-danger',    desc: 'Pesanan dibatalkan.' },
};

const NEXT_ACTIONS: Partial<Record<OrderStatus, { to: OrderStatus; label: string; cls: string }[]>> = {
  DRAFT: [
    { to: 'CONFIRMED', label: 'Konfirmasi Pesanan', cls: 'bg-blue-600 text-white hover:bg-blue-700' },
    { to: 'CANCELLED', label: 'Batalkan Pesanan',   cls: 'bg-white border border-bloom-danger text-bloom-danger hover:bg-red-50' },
  ],
  CONFIRMED: [
    { to: 'COMPLETED', label: 'Tandai Selesai',     cls: 'bg-bloom-success text-white hover:opacity-90' },
    { to: 'CANCELLED', label: 'Batalkan Pesanan',   cls: 'bg-white border border-bloom-danger text-bloom-danger hover:bg-red-50' },
  ],
};

// ─── Timeline ───────────────────────────────────────────────────────────────
function StatusTimeline({ current }: { current: OrderStatus }) {
  const steps: OrderStatus[] = ['DRAFT', 'CONFIRMED', 'COMPLETED'];
  const cancelled = current === 'CANCELLED';
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-start gap-0 w-full">
      {steps.map((step, i) => {
        const done   = !cancelled && i < currentIdx;
        const active = !cancelled && i === currentIdx;
        const cfg    = STATUS_CFG[step];
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all
                ${done   ? 'bg-bloom-text border-bloom-text text-white' : ''}
                ${active ? 'bg-white border-bloom-text text-bloom-text shadow' : ''}
                ${!done && !active ? 'bg-bloom-surface border-bloom-border text-bloom-secondary' : ''}`}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 6.5l3 3 6-6"/></svg>
                  : i + 1}
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold ${active ? 'text-bloom-text' : 'text-bloom-secondary'}`}>{cfg.label}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-6 rounded ${done ? 'bg-bloom-text' : 'bg-bloom-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params   = useParams();
  const orderId  = params.id as string;
  const router   = useRouter();
  const { isLoggedIn }          = useAuth();
  const { getOrder, updateStatus } = useOrder();
  const { showToast }           = useToast();

  const order = getOrder(orderId);
  const cfg   = order ? STATUS_CFG[order.status] : null;
  const actions = order ? (NEXT_ACTIONS[order.status] ?? []) : [];

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !order) { router.replace('/orders'); }
  }, [order, isLoggedIn]);

  if (!isLoggedIn || !order || !cfg) return null;

  async function handleTransition(to: OrderStatus) {
    const result = await updateStatus(orderId, to);
    showToast(result.message, result.success ? 'success' : 'error');
  }

  const createdDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-bloom-bg pt-20">
      <div className="max-w-[860px] mx-auto px-6 py-10">

        {/* Back + Breadcrumb */}
        <div className="mb-8 animate-fade-up space-y-2">
          <BackButton href="/orders" label="Pesanan Saya" />
          <nav className="flex items-center gap-2 text-sm text-bloom-secondary">
            <Link href="/" className="hover:text-bloom-text transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-bloom-text transition-colors">Pesanan Saya</Link>
            <span>/</span>
            <span className="text-bloom-text font-mono font-semibold truncate">{order.id}</span>
          </nav>
        </div>

        <div className="space-y-5 animate-fade-up">

          {/* ── Top card: ID + Status ───────────────── */}
          <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-bloom-secondary uppercase tracking-wider">Nomor Pesanan</p>
                <p className="text-xl font-bold text-bloom-text font-mono tracking-tight">{order.id}</p>
                <p className="text-xs text-bloom-secondary">{createdDate}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg} ${cfg.text} self-start`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-sm font-semibold">{cfg.label}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-bloom-secondary">{cfg.desc}</p>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-bloom-border">
              <StatusTimeline current={order.status} />
            </div>
          </div>

          {/* ── Action buttons ──────────────────────── */}
          {actions.length > 0 && (
            <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-5 flex flex-wrap gap-3">
              <p className="w-full text-xs font-semibold text-bloom-secondary uppercase tracking-wider mb-1">Tindakan</p>
              {actions.map((btn) => (
                <button key={btn.to} onClick={() => handleTransition(btn.to)}
                  className={`h-10 px-6 rounded-pill text-sm font-semibold btn-press transition-all ${btn.cls}`}>
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* ── Items ───────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-bloom-text">Produk Dipesan</h2>
              <div className="space-y-3 divide-y divide-bloom-border/60">
                {order.items.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center gap-3 pt-3 first:pt-0">
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-bloom-surface">
                      <Image src={product.heroImage} alt={product.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-bloom-text truncate">{product.name}</p>
                      <p className="text-xs text-bloom-secondary">{qty} unit × {formatRupiah(product.price)}</p>
                    </div>
                    <p className="text-sm font-bold text-bloom-text flex-shrink-0">
                      {formatRupiah(product.price * qty)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-bloom-border flex justify-between items-center">
                <span className="text-sm font-bold text-bloom-text">Total</span>
                <span className="text-lg font-bold text-bloom-text">{formatRupiah(order.totalPrice)}</span>
              </div>
            </div>

            {/* ── Shipping info ────────────────────────── */}
            <div className="bg-white rounded-2xl border border-bloom-border shadow-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-bloom-text">Informasi Pengiriman</h2>
              <div className="space-y-3">
                {[
                  { icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', label: 'Penerima',  val: order.shipping.recipientName },
                  { icon: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z', label: 'Alamat', val: order.shipping.shippingAddress },
                  { icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z', label: 'Telepon', val: order.shipping.phoneNumber },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex gap-3 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.7" strokeLinecap="round" className="text-bloom-secondary flex-shrink-0 mt-0.5">
                      <path d={icon}/>
                    </svg>
                    <div>
                      <p className="text-xs text-bloom-secondary">{label}</p>
                      <p className="font-medium text-bloom-text leading-snug">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back */}
          <Link href="/orders"
            className="inline-flex items-center gap-1.5 text-sm text-bloom-secondary hover:text-bloom-text transition-colors group">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M9 2.5L4.5 7 9 11.5"/>
            </svg>
            Kembali ke Semua Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
