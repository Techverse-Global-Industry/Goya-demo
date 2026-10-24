import type { CSSProperties } from 'react';
import { GOYA_PATH, GOYA_VIEWBOX } from '@/lib/goya-brand';

/** One brand wordmark, deliberately independent of translated interface type. */
export function GoyaWordmark({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <svg className={`goya-wordmark ${className}`} viewBox={GOYA_VIEWBOX} fill="currentColor" aria-label="Goya" role="img" focusable="false" data-goya-wordmark style={style}><path d={GOYA_PATH} /></svg>;
}
