import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllProducts, getProductBySlug } from '@/lib/products';
import { formatRupiah } from '@/lib/mockData';
import ImageGallery from '@/components/product/ImageGallery';
import AddToCartWidget from '@/components/product/AddToCartWidget';
import BackButton from '@/components/ui/BackButton';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return {
    title: `${product.name} — Bloom Store`,
    description: product.description,
  };
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-bloom-danger">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom-danger" />
        Stok Habis
      </span>
    );
  if (stock <= 4)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-bloom-warning">
        <span className="w-1.5 h-1.5 rounded-full bg-bloom-warning stock-dot-low" />
        Sisa {stock} unit
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-bloom-success">
      <span className="w-1.5 h-1.5 rounded-full bg-bloom-success" />
      Tersedia — {stock} unit
    </span>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug }  = await params;
  const product   = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await getAllProducts();
  const related     = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-bloom-bg">
      <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-bloom-secondary mb-10 animate-fade-up">
          <Link href="/" className="hover:text-bloom-text transition-colors">Beranda</Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4.5 2.5L7.5 6l-3 3.5" />
          </svg>
          <Link href="/#produk" className="hover:text-bloom-text transition-colors">Produk</Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4.5 2.5L7.5 6l-3 3.5" />
          </svg>
          <span className="text-bloom-text font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* LEFT — Gallery */}
          <div className="animate-fade-up">
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col gap-6 animate-fade-up" style={{ animationDelay: '80ms' }}>

            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-bloom-surface border border-bloom-border rounded-full text-xs font-semibold text-bloom-secondary tracking-wide uppercase">
                {product.category}
              </span>
              <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-bloom-text tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            <StockBadge stock={product.stock} />

            <div className="h-px bg-bloom-border" />

            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-bloom-secondary uppercase tracking-widest">Deskripsi</h2>
              <p className="text-[15px] text-bloom-text leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Kategori',   value: product.category },
                { label: 'Stok',       value: `${product.stock} unit` },
                { label: 'Kondisi',    value: 'Segar & Baru' },
                { label: 'Pengiriman', value: 'Hari yang sama' },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3 bg-bloom-surface rounded-xl border border-bloom-border/60">
                  <p className="text-xs font-medium text-bloom-secondary uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-bloom-text">{value}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-bloom-border" />

            <AddToCartWidget product={product} />

            <BackButton href="/#produk" label="Kembali ke semua produk" />
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-bloom-border">
            <h2 className="text-xl font-bold text-bloom-text mb-6">Produk Lainnya</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/products/${r.slug}`} className="group flex flex-col gap-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-bloom-surface img-zoom-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.heroImage} alt={r.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-bloom-text group-hover:opacity-70 transition-opacity">{r.name}</p>
                    <p className="text-xs text-bloom-secondary">{formatRupiah(r.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
