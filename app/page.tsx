import HeroSection from '@/components/home/HeroSection';
import MarqueeStrip from '@/components/home/MarqueeStrip';
import CollectionExplorer from '@/components/home/CollectionExplorer';
import ProductsSection from '@/components/home/ProductsSection';
import { products } from '@/lib/mockData';

export default function HomePage() {
  return (
    <>
      {/* 1. Full-viewport video hero with SplitText + parallax */}
      <HeroSection />

      {/* 2. Infinite dual-row flower name marquee */}
      <MarqueeStrip />

      {/* 3. Cursor image preview on category text list */}
      <CollectionExplorer />

      {/* 4. Product grid with ScrollTrigger stagger reveal */}
      <ProductsSection products={products} />
    </>
  );
}
