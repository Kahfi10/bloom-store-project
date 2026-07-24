'use client';

import { useRef, useCallback, ReactNode } from 'react';
import { gsap } from '@/lib/gsap';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number; // 0–1, how strongly it attracts to cursor
}

/**
 * Wraps any element and gives it a magnetic cursor attraction effect.
 * The inner content moves toward the cursor; on mouse-leave it springs back.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.38,
}: MagneticButtonProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el  = wrapRef.current;
      const inn = innerRef.current;
      if (!el || !inn) return;

      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;

      gsap.to(inn, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      duration: 0.55,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative inline-flex ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={innerRef} className="inline-flex">
        {children}
      </div>
    </div>
  );
}
