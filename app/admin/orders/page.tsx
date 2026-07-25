'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/mockData';

interface Order {
  id: string; status: string; totalPrice: number; recipientName: string;
  phoneNumber: string; shippingAddress: string; createdAt: string;
  items: { qty: number; price: number; product: { name: string } }[];
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT:     'bg-gray-800 text-gray-300',
  CONFIRMED: 'bg-blue-900 text-blue-300',
  COMPLETED: 'bg-green-900 text-green-300',
  CANCELLED: 'bg-red-900 text-red-400',
};

const FILTER_OPTIONS = ['ALL', 'DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [filter,  setFilter]  = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    const res  = await fetch('/api/orders');
    const data = await res.json();
    if (data.success) { setOrders(data.data); setLastUpdate(new Date()); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const i = setInterval(fetchOrders, 15_000); // real-time: refresh every 15s
    return () => clearInterval(i);
  }, [fetchOrders]);

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pesanan</h1>
          <p className="text-xs text-gray-600 mt-1">Auto-refresh setiap 15 detik · Last update: {lastUpdate.toLocaleTimeString('id-ID')}</p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl border border-gray-700 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}>
            {f === 'ALL' ? 'Semua' : f}
            {f !== 'ALL' && (
              <span className="ml-1.5 text-gray-500">
                ({orders.filter(o => o.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-gray-800">
                {['ID Pesanan','Penerima','Produk','Total','Status','Waktu','Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-600">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-600">Tidak ada pesanan.</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-gray-400 hover:text-white transition-colors">
                      {order.id.slice(0,10)}...
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-200 font-medium">{order.recipientName}</p>
                    <p className="text-xs text-gray-600">{order.phoneNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs max-w-[200px] truncate">
                    {order.items.map(i => `${i.product.name} ×${i.qty}`).join(', ')}
                  </td>
                  <td className="px-5 py-4 text-gray-300 font-medium">{formatRupiah(order.totalPrice)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-all">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
