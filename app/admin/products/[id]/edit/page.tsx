'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [form,    setForm]    = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const fetchProduct = useCallback(async () => {
    const res  = await fetch(`/api/products/${id}`);
    const data = await res.json();
    if (data.success) {
      const p = data.data;
      setForm({
        name: p.name, slug: p.slug, category: p.category,
        price: String(p.price), stock: String(p.stock),
        description: p.description, heroImage: p.heroImage,
        images: (p.images as string[]).join('\n'),
        infoOrigin: p.info?.origin ?? '', infoLatinName: p.info?.latinName ?? '',
        infoMeaning: p.info?.meaning ?? '', infoHistory: p.info?.history ?? '',
        infoFunFact: p.info?.funFact ?? '', infoBloomSeason: p.info?.bloomSeason ?? '',
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  function set(field: string, val: string) { setForm(f => ({ ...f, [field]: val })); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const imagesArr = form.images.split('\n').map(s => s.trim()).filter(Boolean);
    const res  = await fetch(`/api/products/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseInt(form.price), stock: parseInt(form.stock), images: imagesArr }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) router.push('/admin/products');
    else setError(data.message);
  }

  if (loading) return <div className="p-8 text-gray-600">Memuat...</div>;

  const fields: [string, string, string, boolean][] = [
    ['name',        'Nama Produk',      '',            false],
    ['slug',        'Slug',             '',            false],
    ['category',    'Kategori',         '',            false],
    ['price',       'Harga (IDR)',      '',            false],
    ['stock',       'Stok',             '',            false],
    ['heroImage',   'Hero Image URL',   '',            false],
    ['infoOrigin',  'Asal',             '',            false],
    ['infoLatinName','Nama Latin',      '',            false],
    ['infoMeaning', 'Makna',            '',            false],
    ['infoBloomSeason','Musim Mekar',   '',            false],
    ['infoFunFact', 'Fakta Menarik',    '',            false],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Produk #{id}</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        {error && <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-sm text-red-400">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          {fields.map(([field, label]) => (
            <div key={field} className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-400">{label}</label>
              <input value={form[field] ?? ''} onChange={e => set(field, e.target.value)}
                type={['price','stock'].includes(field) ? 'number' : 'text'}
                className="w-full h-10 px-4 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:border-gray-500 transition-all placeholder-gray-600"/>
            </div>
          ))}
        </div>

        {/* Textarea fields */}
        {[['description','Deskripsi',3],['infoHistory','Sejarah',3],['images','Gambar (satu URL per baris)',4]] .map(([field, label, rows]) => (
          <div key={field as string} className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400">{label as string}</label>
            <textarea value={form[field as string] ?? ''} onChange={e => set(field as string, e.target.value)} rows={rows as number}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:border-gray-500 resize-none font-mono text-xs"/>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-all">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-800 text-gray-300 text-sm rounded-xl hover:bg-gray-700 transition-all">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
