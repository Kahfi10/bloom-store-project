'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/mockData';

const STATUS_COLOR: Record<string, string> = {
  DRAFT:     'bg-gray-800 text-gray-300',
  CONFIRMED: 'bg-blue-900 text-blue-300',
  COMPLETED: 'bg-green-900 text-green-300',
  CANCELLED: 'bg-red-900 text-red-400',
};

const TRANSITIONS: Record<string, { to: string; label: string; cls: string }[]> = {
  DRAFT:     [
    { to: 'CONFIRMED', label: 'Konfirmasi',  cls: 'bg-blue-700 hover:bg-blue-600 text-white' },
    { to: 'CANCELLED', label: 'Batalkan',    cls: 'bg-red-900 hover:bg-red-800 text-red-300' },
  ],
  CONFIRMED: [
    { to: 'COMPLETED', label: 'Selesaikan',  cls: 'bg-green-800 hover:bg-green-700 text-green-200' },
    { to: 'CANCELLED', label: 'Batalkan',    cls: 'bg-red-900 hover:bg-red-800 text-red-300' },
  ],
};

interface Order {
  id: string; status: string; totalPrice: number;
  recipientName: string; shippingAddress: string; phoneNumber: string;
  createdAt: string; updatedAt: string;
  items: { id: number; qty: number; price: number; product: { name: string; slug: string; heroImage: string } }[];
}

export default function AdminOrderDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res  = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    if (data.success) setOrder(data.data);
    else router.replace('/admin/orders');
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  async function handleTransition(newStatus: string) {
    if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
    setUpdating(true);
    const res  = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) setOrder(data.data);
    else alert(data.message);
    setUpdating(false);
  }

  if (loading) return <div className="p-8 text-gray-600">Memuat...</div>;
  if (!order)  return null;

  const buttons = TRANSITIONS[order.status] ?? [];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/orders" className="text-gray-600 hover:text-gray-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 3L5.5 8 10 13"/></svg>
            </Link>
            <h1 className="text-xl font-bold text-white font-mono">{order.id}</h1>
          </div>
          <p className="text-xs text-gray-600 ml-7">
            Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')} ·
            Update: {new Date(order.updatedAt).toLocaleString('id-ID')}
          </p>
        </div>
        <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${STATUS_COLOR[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Action buttons */}
          {buttons.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ubah Status</p>
              <div className="flex gap-3 flex-wrap">
                {buttons.map(btn => (
                  <button key={btn.to} onClick={() => handleTransition(btn.to)} disabled={updating}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${btn.cls}`}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Produk Dipesan</p>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-800 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.heroImage} alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-800 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.qty} unit × {formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-300">{formatRupiah(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-700">
              <p className="text-sm font-semibold text-gray-400">Total Pembayaran</p>
              <p className="text-lg font-bold text-white">{formatRupiah(order.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Right: Shipping info */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informasi Pengiriman</p>
            <div className="space-y-4">
              {[
                { label: 'Penerima',  value: order.recipientName },
                { label: 'Telepon',   value: order.phoneNumber },
                { label: 'Alamat',    value: order.shippingAddress },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-gray-300 mt-0.5 leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Alur Status</p>
            <div className="space-y-2">
              {['DRAFT','CONFIRMED','COMPLETED'].map((s, i) => {
                const statuses = ['DRAFT','CONFIRMED','COMPLETED'];
                const currentIdx = statuses.indexOf(order.status === 'CANCELLED' ? 'DRAFT' : order.status);
                const done = i <= currentIdx && order.status !== 'CANCELLED';
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      done ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-600'
                    }`}>
                      {done ? '✓' : i+1}
                    </div>
                    <span className={`text-sm ${done ? 'text-white font-medium' : 'text-gray-600'}`}>{s}</span>
                  </div>
                );
              })}
              {order.status === 'CANCELLED' && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-red-900 flex items-center justify-center text-red-400 text-xs">✕</div>
                  <span className="text-sm text-red-400 font-medium">CANCELLED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
