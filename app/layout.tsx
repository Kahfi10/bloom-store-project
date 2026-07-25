import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { OrderProvider } from '@/context/OrderContext';
import NavbarWrapper from '@/components/layout/NavbarWrapper';
import FooterWrapper from '@/components/layout/FooterWrapper';

export const metadata: Metadata = {
  title: 'Bloom Store — Toko Bunga Premium',
  description:
    'Temukan rangkaian bunga segar pilihan terbaik di Bloom Store. Anggrek, Mawar, Lavender, dan lebih banyak lagi.',
  keywords: ['bunga', 'toko bunga', 'bloom store', 'mawar', 'anggrek', 'lavender'],
};

// Viewport meta — ensures Chrome renders at correct scale
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-bloom-bg text-bloom-text antialiased">
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <ToastProvider>
                <NavbarWrapper />
                <main>{children}</main>
                <FooterWrapper />
              </ToastProvider>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
