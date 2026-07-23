import HeroSection from '@/components/home/HeroSection';
import ProductsSection from '@/components/home/ProductsSection';
import { products } from '@/lib/mockData';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductsSection products={products} />
    </>
  );
}
