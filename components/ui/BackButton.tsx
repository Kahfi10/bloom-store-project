'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;          // jika ada href, navigasi ke sana; jika tidak pakai router.back()
  label?: string;         // teks tombol
  className?: string;
}

export default function BackButton({
  href,
  label = 'Kembali',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const base =
    'inline-flex items-center gap-1.5 text-sm text-bloom-secondary hover:text-bloom-text transition-colors group';

  const inner = (
    <>
      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className="group-hover:-translate-x-0.5 transition-transform duration-200 flex-shrink-0"
      >
        <path d="M10 3L5.5 8 10 13" />
      </svg>
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={() => router.back()} className={`${base} ${className}`}>
      {inner}
    </button>
  );
}
