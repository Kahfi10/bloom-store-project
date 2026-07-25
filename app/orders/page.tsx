'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder, VALID_TRANSITIONS } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/lib/mockData';
import { Order, OrderStatus } from '@/types';
import BackButton from '@/components/ui/BackButton';

// Status config
const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  DRAFT:     { label: 'Draft',     bg: 'bg-gray-100',  text: 'text-gray-600',      dot: 'bg-gray-400' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50',   text: 'text-blue-700',      dot: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-green-50',  text: 'text-bloom-success', dot: 'bg-bloom-success' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-bloom-danger',  dot: 'bg-bloom-danger' },
};

const STATUS_NEXT_BTN: Partial<Record<OrderStatus, { to: OrderStatus; label: string; cls: string }[]>> = {
  DRAFT: [
    { to: 'CONFIRMED', label: 'Konfirmasi', cls: 'bg-blue-600 text-white hover:bg-blue-700' },
    { to: 'CANCELLED', label: 'Batalkan',   cls: 'bg-white border border-bloom-danger text-bloom-danger hover:bg-red-50' },
  ],
  CONFIRMED: [
    { to: 'COMPLETED', label: 'Selesaikan', cls: 'bg-bloom-success text-white hover:opacity-90' },
    { to: 'CANCELLED', label: 'Batalkan',   cls: 'bg-white border border-bloom-danger text-bloom-danger hover:bg-red-50' },
  ],
};

// Timeline
function StatusTimeline({ current }: { current: OrderStatus }) {
  const steps: OrderStatus[] = ['DRAFT', 'CONFIRMED', 'COMPLETED'];
  const cancelled  = current === 'CANCELLED';
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done    = cancelled ? false : i < currentIdx;
        const active  = !cancelled && i === currentIdx;
        const pending = cancelled || i > currentIdx;
        const cfg     = STATUS_CFG[step];
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done   ? 'bg-bloom-text border-bloom-text text-white' : ''}
                ${active ? 'bg-white border-bloom-text text-bloom-text shadow-sm' : ''}
                ${pending ? 'bg-bloom-surface border-bloom-border text-bloom-secondary' : ''}`}>
                {done
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
                  : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-bloom-text' : 'text-bloom-secondary'}`}>
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-all ${done ? 'bg-bloom-text' : 'bg-bloom-border'}`} />
            )}
          </div>
        );
      })}
      {cancelled && (
        <div className="ml-4 flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-bloom-danger" />
          <span className="text-xs font-semibold text-bloom-danger">Dibatalkan</span>
        </div>
      )}
    </div>
  );
}

// Single order card
function OrderCard({ order }: { order: Order }) {
  const { updateStatus } = useOrder();
  const { showToast }    = useToast();
  const cfg              = STATUS_CFG[order.status];
  const buttons          = STATUS_NEXT_BTN[order.status] ?? [];

  async function handleTransition(to: OrderStatus) {
    const result = await updateStatus(order.id, to);
    showToast(result.message, result.success ? 'success' : 'error');
  }

  const createdDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-bloom-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-bloom-border/60 bg-bloom-surface/50">
        <div>
          <div className="flex items-center gap-3">
            <Link href={`/orders/${order.id}`}
              className="text-sm font-bold text-bloom-text hover:opacity-70 transition-opacity font-mono tracking-tight">
              {order.id.slice(0, 12)}...
            </Link>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-bloom-secondary mt-0.5">{createdDate}</p>
        </div>
        <p className="text-base font-bold text-bloom-text">{formatRupiah(order.totalPrice)}</p>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        <StatusTimeline current={order.status} />

        {/* Items */}
        <div className="flex flex-wrap gap-2 text-xs text-bloom-secondary">
          {order.items.map(({ product, qty }) => (
            <span key={product.id} className="px-2.5 py-1 bg-bloom-surface border border-bloom-border rounded-full">
              {product.name} x{qty}
            </span>
          ))}
        </div>

        {/* Recipient */}
        <div className="flex items-center gap-2 text-sm text-bloom-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="truncate">
            <strong className="text-bloom-text">{order.shipping.recipientName}</strong>
            {' - '}{order.shipping.shippingAddress}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {buttons.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-4 border-t border-bloom-border/60 bg-bloom-surface/30">
          {buttons.map((btn) => (
            <button key={btn.to} onClick={() => handleTransition(btn.to)}
              className={`h-9 px-5 rounded-pill text-sm font-semibold btn-press transition-all ${btn.cls}`}>
              {btn.label}
            </button>
          ))}
          <Link href={`/orders/${order.id}`}
            className="ml-auto text-xs text-bloom-secondary hover:text-bloom-text transition-colors">
            Detail &rarr;
          </Link>
        </div>
      )}

      {/* Locked state */}
      {VALID_TRANSITIONS[order.status].length === 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-bloom-border/60 bg-bloom-surface/30">
          <p className="text-xs text-bloom-secondary italic">
            {order.status === 'COMPLETED'
              ? 'Pesanan selesai - tidak dapat diubah.'
              : 'Pesanan dibatalkan - tidak dapat diaktifkan kembali.'}
          </p>
          <Link href={`/orders/${order.id}`}
            className="text-xs text-bloom-secondary hover:text-bloom-text transition-colors">
            Detail &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

// Page
export default function OrdersPage() {
  const router         = useRouter();
  const { isLoggedIn } = useAuth();
  const { orders }     = useOrder();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-bloom-bg pt-20">
      <div className="max-w-[900px] mx-auto px-6 py-10">

        <div className="mb-8 animate-fade-up">
          <BackButton href="/" label="Beranda" className="mb-4" />
          <h1 className="text-[clamp(1.6rem,4vw,2.2rem)] font-bold text-bloom-text tracking-tight">
            Pesanan Saya
          </h1>
          <p className="text-sm text-bloom-secondary mt-1">
            {orders.length > 0 ? `${orders.length} pesanan ditemukan` : 'Belum ada pesanan'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-bloom-surface flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.4" strokeLinecap="round" className="text-bloom-secondary">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-bloom-text">Belum Ada Pesanan</h2>
            <p className="text-sm text-bloom-secondary max-w-xs">
              Mulai berbelanja dan buat pesanan pertamamu sekarang!
            </p>
            <Link href="/#produk"
              className="mt-2 inline-flex items-center gap-2 h-11 px-7 bg-bloom-text text-white text-sm font-semibold rounded-pill btn-press hover:bg-black/80 transition-all">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-up">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
