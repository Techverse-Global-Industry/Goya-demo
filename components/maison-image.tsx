'use client';

import Image from 'next/image';
import { useState } from 'react';
import { imageSources } from '@/lib/assets';
import { useShop } from '@/context/shop-context';

interface MaisonImageProps {
  index: number;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  sources?: string[];
}

/** The same slot is used throughout; no unrelated stock photography is substituted. */
export function MaisonImage({ index, alt, sizes, className = '', preload = false, sources: customSources }: MaisonImageProps) {
  const { t } = useShop();
  const sources = customSources?.length ? customSources : imageSources(index);
  const [attempt, setAttempt] = useState(0);
  if (attempt >= sources.length) {
    return <div className={`image-archive image-archive--${index % 4} ${className}`} role="img" aria-label={alt}>
      <div className="archive-orbit" aria-hidden="true" />
      <span className="archive-monogram" aria-hidden="true">MG</span>
      <span className="archive-caption" aria-hidden="true">{t('imageUnavailable')} · {String(index).padStart(2, '0')}</span>
    </div>;
  }
  return <Image key={`${index}-${attempt}`} src={sources[attempt]} alt={alt} fill sizes={sizes}
    unoptimized={sources[attempt].startsWith('/api/media/')}
    preload={preload} quality={85} className={className}
    onError={() => setAttempt((current) => current + 1)} />;
}
