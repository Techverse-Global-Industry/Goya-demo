'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

/** Logical positions preserve the same next/previous order in RTL browsers. */
export function useCarousel(items: number, rtl: boolean) {
  const track = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setBounds(previous => {
      const position = Math.abs(element.scrollLeft);
      const start = position < 8;
      const end = position + element.clientWidth >= element.scrollWidth - 8;
      return previous.start === start && previous.end === end ? previous : { start, end };
    });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [items, rtl]);
  const move = useCallback((direction: number) => {
    const element = track.current;
    if (!element) return;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({ left: direction * (rtl ? -1 : 1) * ((element.firstElementChild?.clientWidth ?? element.clientWidth) + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [rtl]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move((event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1)); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); track.current?.scrollTo({ left: event.key === 'Home' ? 0 : (rtl ? -1 : 1) * track.current.scrollWidth, behavior: 'instant' }); }
  };
  return { track, bounds, move, onKeyDown };
}
