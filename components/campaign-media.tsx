'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';

/** Silent editorial films. A real image remains visible until playback starts. */
export function CampaignMedia({ src, poster, alt, priority = false, posterSizes = '100vw', posterPosition = 'center' }: { src: string; poster: string; alt: string; priority?: boolean; posterSizes?: string; posterPosition?: string }) {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  const root = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const manual = useRef<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = film.current;
    const container = root.current;
    if (!video || !container) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    let disposed = false;
    const update = () => {
      const permitted = manual.current ?? (!motion.matches && !connection?.saveData);
      if (visible && document.visibilityState === 'visible' && permitted) {
        if (!video.getAttribute('src')) { video.src = src; video.load(); }
        void video.play().then(() => { if (disposed) video.pause(); }).catch(() => undefined);
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .08 });
    observer.observe(container);
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    container.addEventListener('campaign:toggle', update);
    return () => { disposed = true; observer.disconnect(); document.removeEventListener('visibilitychange', update); motion.removeEventListener('change', update); container.removeEventListener('campaign:toggle', update); video.pause(); };
  }, [src]);

  const toggle = () => {
    manual.current = !playing;
    root.current?.dispatchEvent(new Event('campaign:toggle'));
  };

  return <div ref={root} className="fashion-film" data-playing={playing} data-ready={ready}>
    <Image src={poster} alt={alt} fill sizes={posterSizes} preload={priority} className="fashion-film-poster" style={{ objectPosition: posterPosition }} />
    <video ref={film} muted loop playsInline preload="none" poster={poster} aria-hidden="true" tabIndex={-1} onPlaying={() => { setReady(true); setPlaying(true); }} onPause={() => setPlaying(false)} onError={() => { setReady(false); setPlaying(false); }} />
    <button type="button" className="film-control" onClick={toggle} aria-label={playing ? copy.pause : copy.play} aria-pressed={playing}>
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">{playing ? <><path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="2" /></> : <path d="m8 4 12 8-12 8Z" fill="currentColor" />}</svg>
    </button>
  </div>;
}
