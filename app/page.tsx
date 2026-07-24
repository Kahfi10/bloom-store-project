import HeroSection         from '@/components/home/HeroSection';
import MarqueeStrip        from '@/components/home/MarqueeStrip';
import CollectionExplorer  from '@/components/home/CollectionExplorer';
import ProductsSection     from '@/components/home/ProductsSection';
import StatsSection        from '@/components/home/StatsSection';
import HowToOrderSection   from '@/components/home/HowToOrderSection';
import QuoteBannerSection  from '@/components/home/QuoteBannerSection';
import { products }        from '@/lib/mockData';

export default function HomePage() {
  return (
    <>
      {/* 1. Video hero — SplitText + parallax + magnetic CTAs */}
      <HeroSection />

      {/* 2. Infinite dual-row flower name marquee */}
      <MarqueeStrip />

      {/* 3. Numbered product list — ScrollTrigger slide-in */}
      <CollectionExplorer />

      {/* 4. Product grid — ScrollTrigger stagger */}
      <ProductsSection products={products} />

      {/* 5. Stats — animated counter + draw underline */}
      <StatsSection />

      {/* 6. How to order — pinned horizontal scroll (4 steps) */}
      <HowToOrderSection />

      {/* 7. Quote banner — full-width parallax + SplitText reveal */}
      <QuoteBannerSection />
    </>
  );
}
