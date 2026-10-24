'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { readConsent } from '@/lib/consent';
import { internationalCopy } from '@/lib/international-copy';
import { COUNTRY_PROMPT_KEY, marketName, translatedCopy } from '@/lib/international';
import { Icon } from './icon';

/** Confirms the saved storefront choice without detecting a visitor's location. */
export function CountryPrompt() {
  const { state } = useShop();
  const pathname = usePathname();
  const c = translatedCopy(internationalCopy[state.locale], state.language);
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = useRef(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let timer: number | undefined;
    const excluded = pathname.startsWith('/admin') || pathname.startsWith('/app') || pathname.startsWith('/account') || pathname.startsWith('/my-') || pathname === '/login' || pathname === '/checkout' || pathname === '/countries' || pathname.startsWith('/book-an-appointment') || pathname.startsWith('/personalization/');
    const schedule = () => {
      window.clearTimeout(timer);
      if (!state.ready || excluded || state.overlay || shown.current || !readConsent()) return;
      try { if (sessionStorage.getItem(COUNTRY_PROMPT_KEY)) return; } catch { /* The ref preserves this choice for the current mount. */ }
      timer = window.setTimeout(() => {
        if (document.querySelector('dialog[open]')) return;
        shown.current = true;
        try { sessionStorage.setItem(COUNTRY_PROMPT_KEY, 'shown'); } catch { /* Optional storage. */ }
        setVisible(true);
      }, 1000);
    };
    schedule();
    window.addEventListener('goya:consent', schedule);
    return () => { window.clearTimeout(timer); window.removeEventListener('goya:consent', schedule); };
  }, [state.ready, state.overlay, pathname]);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!visible || state.overlay) { if (element.open) element.close(); return; }
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    element.showModal();
    return () => { element.close(); document.documentElement.style.overflow = overflow; };
  }, [visible, state.overlay]);
  const close = () => setVisible(false);
  return <dialog ref={dialog} className="exact-country-prompt" aria-labelledby="country-prompt-title" onCancel={event => { event.preventDefault(); close(); }}><header><h2 id="country-prompt-title">{c.changeCountry}</h2><button type="button" aria-label={c.close} onClick={close}><Icon name="close" width={21} /></button></header><div><p>{c.currentSelection}</p><div className="exact-country-prompt-market">{state.market === 'WW' ? <Icon name="globe" width={24} /> : <Image src={`/images/flags/${state.market.toLowerCase()}.svg`} alt="" width={24} height={24} unoptimized />}<span>{marketName(state.market, state.language)}<small>{state.currency}</small></span></div><button className="exact-country-prompt-continue" type="button" onClick={close}>{c.keepSelection}</button><Link href="/countries" onClick={close}>{c.anotherCountry}<Icon name="chevron-right" width={16} /></Link></div></dialog>;
}
