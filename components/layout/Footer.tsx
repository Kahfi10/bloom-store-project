import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bloom-surface border-t border-bloom-border mt-24">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" className="text-bloom-text">
                <ellipse cx="11" cy="7" rx="3.5" ry="5.5" fill="currentColor" fillOpacity="0.85" />
                <ellipse cx="15.5" cy="13" rx="3.5" ry="5.5" transform="rotate(60 15.5 13)" fill="currentColor" fillOpacity="0.55" />
                <ellipse cx="6.5" cy="13" rx="3.5" ry="5.5" transform="rotate(-60 6.5 13)" fill="currentColor" fillOpacity="0.35" />
                <circle cx="11" cy="11" r="2" fill="currentColor" />
              </svg>
              <span className="text-[16px] font-semibold tracking-tight text-bloom-text">
                Bloom Store
              </span>
            </div>
            <p className="text-sm text-bloom-secondary leading-relaxed max-w-[220px]">
              Keindahan yang mekar untuk setiap momen istimewa dalam hidup Anda.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-bloom-text uppercase tracking-widest">
              Navigasi
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Produk', href: '#produk' },
                { label: 'Keranjang', href: '/cart' },
                { label: 'Masuk', href: '/login' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-bloom-secondary hover:text-bloom-text transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-bloom-text uppercase tracking-widest">
              Layanan
            </h3>
            <ul className="space-y-2">
              {[
                'Pengiriman Hari Ini',
                'Bunga Segar Terjamin',
                'Kemasan Premium',
                'Layanan Pelanggan 24/7',
              ].map((item) => (
                <li key={item} className="text-sm text-bloom-secondary flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-bloom-secondary inline-block" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-bloom-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-bloom-secondary">
            &copy; {year} Bloom Store. Semua hak dilindungi.
          </p>
          <p className="text-xs text-bloom-secondary">
            Dibuat dengan penuh kasih untuk bunga-bunga terbaik.
          </p>
        </div>
      </div>
    </footer>
  );
}
