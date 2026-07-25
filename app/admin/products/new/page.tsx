'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY = {
  name: '', slug: '', category: '', price: '', stock: '', description: '', heroImage: '',
  images: '', infoOrigin: '', infoLatinName: '', infoMeaning: '',
  infoHistory: '', infoFunFact: '', infoBloomSeason: '',
};

export default function AdminNewProductPage() {
  const router  = useRouter();
  const [form,    setForm]    = useState(EMPTY);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof EMPTY, val: string) {
    setForm(f => ({
      ...f,
      [field]: val,
      ...(field === 'name' ? { slug: slugify(val) } : {}),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const imagesArr = form.images.split('\n').map(s => s.trim()).filter(Boolean);

    const res  = await fetch('/api/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price:  parseInt(form.price,  10),
        stock:  parseInt(form.stock,  10),
        images: imagesArr,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) router.push('/admin/products');
    else setError(data.message);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tambah Produk Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Isi semua informasi produk bunga.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-950 border border-red-800 rounded-xl text-sm text-red-400">{error}</div>
        )}

        {/* Basic Info */}
        <Section title="Informasi Dasar">
          <Row label="Nama Produk *">
            <Input value={form.name} onChange={v => set('name', v)} placeholder="Red Rose"/>
          </Row>
          <Row label="Slug *">
            <Input value={form.slug} onChange={v => set('slug', v)} placeholder="red-rose"/>
          </Row>
          <TwoCol>
            <Row label="Kategori *">
              <Input value={form.category} onChange={v => set('category', v)} placeholder="Mawar"/>
            </Row>
            <Row label="Harga (IDR) *">
              <Input type="number" value={form.price} onChange={v => set('price', v)} placeholder="250000"/>
            </Row>
          </TwoCol>
          <Row label="Stok *">
            <Input type="number" value={form.stock} onChange={v => set('stock', v)} placeholder="10"/>
          </Row>
          <Row label="Deskripsi *">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Deskripsi produk..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:border-gray-500 resize-none placeholder-gray-600"/>
          </Row>
        </Section>

        {/* Images */}
        <Section title="Gambar">
          <Row label="Hero Image (URL) *">
            <Input value={form.heroImage} onChange={v => set('heroImage', v)} placeholder="/assets/images/red-rose/photo.jpg"/>
          </Row>
          <Row label="Semua Gambar (satu URL per baris) *">
            <textarea value={form.images} onChange={e => set('images', e.target.value)} rows={4}
              placeholder={'/assets/images/red-rose/photo1.jpg\n/assets/images/red-rose/photo2.jpg'}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:border-gray-500 resize-none placeholder-gray-600 font-mono text-xs"/>
          </Row>
        </Section>

        {/* Flower Info */}
        <Section title="Informasi Bunga">
          {([
            ['infoOrigin',      'Asal',          'Asia Tenggara — Indonesia'],
            ['infoLatinName',   'Nama Latin',    'Rosa × hybrida'],
            ['infoMeaning',     'Makna',         'Cinta, gairah, romansa'],
            ['infoBloomSeason', 'Musim Mekar',   'Musim semi dan gugur'],
          ] as [keyof typeof EMPTY, string, string][]).map(([field, label, placeholder]) => (
            <Row key={field} label={label}>
              <Input value={form[field]} onChange={v => set(field, v)} placeholder={placeholder}/>
            </Row>
          ))}
          <Row label="Sejarah">
            <textarea value={form.infoHistory} onChange={e => set('infoHistory', e.target.value)} rows={3}
              placeholder="Sejarah singkat bunga..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:border-gray-500 resize-none placeholder-gray-600"/>
          </Row>
          <Row label="Fakta Menarik">
            <Input value={form.infoFunFact} onChange={v => set('infoFunFact', v)} placeholder="Fakta unik tentang bunga ini..."/>
          </Row>
        </Section>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-all">
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
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

// ─── Sub-components ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      {children}
    </div>
  );
}
function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
function Input({ type = 'text', value, onChange, placeholder }: {
  type?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-4 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl outline-none focus:border-gray-500 transition-all placeholder-gray-600"/>
  );
}
