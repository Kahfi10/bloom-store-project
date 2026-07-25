import { getAllProducts } from '@/lib/products';
import HeroSection        from '@/components/home/HeroSection';
import MarqueeStrip       from '@/components/home/MarqueeStrip';
import CollectionExplorer from '@/components/home/CollectionExplorer';
import ProductsSection    from '@/components/home/ProductsSection';
import StatsSection       from '@/components/home/StatsSection';
import HowToOrderSection  from '@/components/home/HowToOrderSection';
import QuoteBannerSection from '@/components/home/QuoteBannerSection';

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <CollectionExplorer products={products} />
      <ProductsSection products={products} />
      <StatsSection />
      <HowToOrderSection />
      <QuoteBannerSection />
    </>
  );
}
