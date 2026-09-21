'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SmartImageProps extends ImageProps {
  wrapperClassName?: string;
  shimmerClassName?: string;
}

export default function SmartImage({
  className = '',
  wrapperClassName = '',
  shimmerClassName = '',
  alt,
  onLoad,
  ...props
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Skeleton Shimmer Background (Visible while image loads) */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 skeleton-shimmer z-0 pointer-events-none ${shimmerClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Actual Image with smooth fade-in */}
      <Image
        alt={alt}
        className={`transition-all duration-500 ease-out z-10 ${
          isLoaded
            ? 'opacity-100 blur-0 scale-100'
            : 'opacity-0 blur-sm scale-[1.03]'
        } ${className}`}
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        {...props}
      />
    </div>
  );
}
