'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

/** Renders the Navbar only on the home page (/). All other pages are navbar-free. */
export default function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname !== '/') return null;
  return <Navbar />;
}
