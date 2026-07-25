'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/mockData';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  activeSessions: number;
  totalRevenue: number;
  ordersByStatus: { status: string; _count: { id: number } }[];
  recentOrders: {
    id: string; status: string; totalPrice: number; recipientName: string; createdAt: string;
    items: { qty: number; product: { name: string } }[];
  }[];
  lowStockProducts: { id: number; name: string; stock: number; category: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT:     'bg-gray-800 text-gray-300',
  CONFIRMED: 'bg-blue-900 text-blue-300',
  COMPLETED: 'bg-green-900 text-green-300',
  CANCELLED: 'bg-red-900 text-red-400',
};

export default function AdminDashboard() {
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) { setStats(data.data); setLastUpdate(new Date()); }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const STAT_CARDS = stats ? [
    { label: 'Total Produk',     value: stats.totalProducts,  icon: '📦', color: 'from-violet-900 to-violet-950',  href: '/admin/products' },
    { label: 'Total Pesanan',    value: stats.totalOrders,    icon: '📋', color: 'from-blue-900 to-blue-950',     href: '/admin/orders' },
    { label: 'Sesi Aktif',       value: stats.activeSessions, icon: '👤', color: 'from-emerald-900 to-emerald-950', href: '/admin/users' },
    { label: 'Total Pendapatan', value: formatRupiah(stats.totalRevenue), icon: '💰', color: 'from-amber-900 to-amber-950', href: '#' },
  ] : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <button onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-all border border-gray-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
          </svg>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map(({ label, value, icon, color, href }) => (
              <Link key={label} href={href}
                className={`bg-gradient-to-br ${color} border border-gray-800 rounded-2xl p-5 hover:scale-[1.02] transition-transform`}>
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Status Pesanan</h2>
              <div className="space-y-3">
                {['DRAFT','CONFIRMED','COMPLETED','CANCELLED'].map((status) => {
                  const found = stats.ordersByStatus.find(s => s.status === status);
                  const count = found?._count.id ?? 0;
                  const total = stats.totalOrders || 1;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[status]}`}>{status}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-300 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Stok Menipis</h2>
              {stats.lowStockProducts.length === 0
                ? <p className="text-sm text-gray-600">Semua stok aman.</p>
                : (
                  <div className="space-y-2">
                    {stats.lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </div>
                        <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {p.stock} unit
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pesanan Terbaru</h2>
              <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Lihat semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left pb-3 font-medium">ID Pesanan</th>
                    <th className="text-left pb-3 font-medium">Penerima</th>
                    <th className="text-left pb-3 font-medium">Produk</th>
                    <th className="text-left pb-3 font-medium">Total</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-gray-400 hover:text-white transition-colors">
                          {order.id.slice(0,8)}...
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">{order.recipientName}</td>
                      <td className="py-3 text-gray-500 text-xs">
                        {order.items.map(i => `${i.product.name} ×${i.qty}`).join(', ')}
                      </td>
                      <td className="py-3 text-gray-300 font-medium">{formatRupiah(order.totalPrice)}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.recentOrders.length === 0 && (
                <p className="text-center text-sm text-gray-600 py-8">Belum ada pesanan.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
