'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/mockData';

interface Product {
  id: number; name: string; slug: string; category: string;
  price: number; stock: number; description: string; heroImage: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products';
    const res  = await fetch(url);
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(id);
    const res  = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) fetchProducts();
    else alert(data.message);
    setDeleting(null);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Produk</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} produk ditemukan</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="6" width="2" height="14" rx="1"/><rect y="6" width="14" height="2" rx="1"/></svg>
          Tambah Produk
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..."
          className="w-full h-10 pl-9 pr-4 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600 transition-all"/>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-gray-800 bg-gray-900">
                {['ID','Produk','Kategori','Harga','Stok','Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600">Memuat...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600">Tidak ada produk.</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 text-gray-600 text-xs font-mono">{p.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.heroImage} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800 flex-shrink-0"/>
                      <div>
                        <p className="font-medium text-white">{p.name}</p>
                        <p className="text-xs text-gray-600">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full">{p.category}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-300 font-medium">{formatRupiah(p.price)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}/edit`}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-all">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 text-xs rounded-lg transition-all disabled:opacity-50">
                        {deleting === p.id ? '...' : 'Hapus'}
                      </button>
                    </div>
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
