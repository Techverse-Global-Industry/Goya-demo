'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { readConsent } from '@/lib/consent';
import { Icon } from './icon';

export function NewsletterPopup({ close, children }: { close: () => void; children: ReactNode }) {
  const { state } = useShop();
  const fr = state.locale === 'fr';
  return <section className="newsletter-popup"><div className="newsletter-popup-image"><Image src="/images/campaign/goya-signature.webp" alt={fr ? 'Une création de la Maison Goya' : 'A Maison Goya creation'} fill sizes="(min-width:700px) 45vw,100vw" /></div><div className="newsletter-popup-content"><button type="button" className="newsletter-popup-close" data-close-modal aria-label={fr ? 'Fermer' : 'Close'} onClick={close}><Icon name="close" width={21} /></button><p className="reference-kicker">MAISON GOYA</p><h2>{fr ? 'Entrez dans l’univers Goya.' : 'Step into the world of Goya.'}</h2><p>{fr ? 'Les nouvelles créations. Les histoires de la Maison. Le soin du détail.' : 'New creations. Stories from the Maison. A feeling for the detail.'}</p>{children}<button type="button" className="reference-text-link newsletter-popup-later" onClick={close}>{fr ? 'Découvrir plus tard' : 'Discover later'}</button></div></section>;
}

export function PromotionPrompt() {
  const { state, dispatch } = useShop();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);
  const fr = state.locale === 'fr';
  useEffect(() => {
    let timer: number | undefined;
    const excluded = pathname.startsWith('/admin') || pathname.startsWith('/account') || pathname.startsWith('/app') || pathname.startsWith('/my-') || pathname === '/login' || pathname === '/checkout';
    const schedule = () => {
      window.clearTimeout(timer);
      if (excluded || state.overlay || shown.current || !readConsent()?.newsletter) return;
      try { if (sessionStorage.getItem('goya-newsletter-prompt-v1')) return; } catch { /* The ref keeps this invitation once per mounted visit. */ }
      timer = window.setTimeout(() => {
        if (!readConsent()?.newsletter || document.querySelector('dialog[open]')) return;
        shown.current = true;
        try { sessionStorage.setItem('goya-newsletter-prompt-v1', 'shown'); } catch { /* Optional storage. */ }
        setVisible(true);
      }, 8000);
    };
    const changed = () => { if (!readConsent()?.newsletter) setVisible(false); schedule(); };
    schedule();
    window.addEventListener('goya:consent', changed);
    window.addEventListener('storage', changed);
    return () => { window.clearTimeout(timer); window.removeEventListener('goya:consent', changed); window.removeEventListener('storage', changed); };
  }, [pathname, state.overlay]);
  if (!visible || state.overlay || pathname.startsWith('/admin') || pathname.startsWith('/account') || pathname.startsWith('/app') || pathname.startsWith('/my-') || pathname === '/login' || pathname === '/checkout') return null;
  return <aside className="promotion-prompt" aria-label={fr ? 'Invitation de la Maison' : 'An invitation from the Maison'}><div className="promotion-prompt-image"><Image src="/images/campaign/goya-sculpture.webp" alt="" fill sizes="110px" /></div><div className="promotion-prompt-content"><p className="reference-kicker">MAISON GOYA</p><h2>{fr ? 'Un lien avec la Maison.' : 'A connection with the Maison.'}</h2><button type="button" className="reference-text-link" onClick={() => { setVisible(false); dispatch({ type: 'open', overlay: { kind: 'newsletter' } }); }}>{fr ? 'Découvrir la newsletter' : 'Discover the newsletter'}<Icon name="arrow-right" width={15} /></button></div><button type="button" className="promotion-prompt-close" aria-label={fr ? 'Fermer l’invitation' : 'Dismiss invitation'} onClick={() => setVisible(false)}><Icon name="close" width={16} /></button></aside>;
}
