'use client';

import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useShop } from '@/context/shop-context';
import { LanguageSwitch } from './controls';
import { Icon } from './icon';

interface ModalShellProps {
  title: string;
  drawer?: boolean;
  wide?: boolean;
  children: (close: () => void) => ReactNode;
}

export function ModalShell({ title, drawer = false, wide = false, children }: ModalShellProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [closeRequested, setCloseRequested] = useState(false);
  const titleId = useId();
  const { dispatch, t } = useShop();

  useGSAP(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    element.showModal();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) gsap.fromTo(panel.current,
      { opacity: 0, x: drawer ? 80 : 0, y: drawer ? 0 : 24, scale: drawer ? 1 : 0.985 },
      { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
    );
    const focusFrame = requestAnimationFrame(() => {
      (element.querySelector<HTMLElement>('[data-initial-focus]') ?? element.querySelector<HTMLElement>('[data-close-modal]'))?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(focusFrame);
      element.close();
      document.documentElement.style.overflow = previousOverflow;
      queueMicrotask(() => {
        if (!document.querySelector('dialog[open]')) {
          if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
          else document.querySelector<HTMLElement>('[data-cart-trigger]')?.focus({ preventScroll: true });
        }
      });
    };
  }, { scope: dialog });

  const close = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dispatch({ type: 'close' });
    else setCloseRequested(true);
  };

  useGSAP(() => {
    if (!closeRequested) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dispatch({ type: 'close' });
      return;
    }
    gsap.to(panel.current, {
      opacity: 0, x: drawer ? 60 : 0, y: drawer ? 0 : 12, duration: 0.2,
      ease: 'power2.in', onComplete: () => dispatch({ type: 'close' }),
    });
  }, { scope: dialog, dependencies: [closeRequested] });

  return <dialog ref={dialog} aria-labelledby={titleId} className={`maison-dialog ${drawer ? 'maison-dialog--drawer' : ''} ${wide ? 'maison-dialog--wide' : ''}`}
    onKeyDown={(event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter((element) => element.getClientRects().length && !element.closest('[inert]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={(event) => { event.preventDefault(); close(); }}>
    <div className="dialog-positioner" onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="dialog-panel" ref={panel}>
        <header className="dialog-chrome">
          <p id={titleId} className="eyebrow">{title}</p>
          <div className="dialog-controls"><LanguageSwitch compact />
            <button type="button" className="icon-button" data-close-modal aria-label={t('close')} onClick={close}><Icon name="close" /></button>
          </div>
        </header>
        <div className="dialog-content">{children(close)}</div>
      </div>
    </div>
  </dialog>;
}
