import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <section
      id="produk"
      className="max-w-[1200px] mx-auto px-6 py-20"
    >
      {/* ── Section Header ──────────────────────────── */}
      <div className="text-center mb-14 animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-bloom-secondary mb-3">
          Koleksi Kami
        </p>
        <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-bloom-text tracking-tight leading-tight mb-4">
          Bunga Pilihan Terbaik
        </h2>
        <p className="text-[15px] text-bloom-secondary max-w-[480px] mx-auto leading-relaxed">
          Setiap bunga dipilih dengan teliti untuk memastikan kesegaran dan keindahan yang sempurna.
        </p>

        {/* Divider accent */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-bloom-border" />
          <div className="w-1.5 h-1.5 rounded-full bg-bloom-secondary/50" />
          <div className="h-px w-16 bg-bloom-border" />
        </div>
      </div>

      {/* ── Product Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            animationDelay={index * 80}
          />
        ))}
      </div>

      {/* ── Empty State ─────────────────────────────── */}
      {products.length === 0 && (
        <div className="text-center py-24 text-bloom-secondary">
          <p className="text-lg font-medium">Belum ada produk tersedia.</p>
        </div>
      )}
    </section>
  );
}
