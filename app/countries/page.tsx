'use client';

import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { translatedCopy } from '@/lib/international';
import { internationalCopy } from '@/lib/international-copy';
import { GoyaWordmark } from '@/components/goya-wordmark';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
import { RegionSelector } from '@/components/reference-services';

export default function Page(){
  const {state}=useShop();const c=translatedCopy(internationalCopy[state.locale],state.language);
  return <><main id="public-content" className="exact-country-page"><header className="exact-country-brand"><Link href="/" aria-label="Goya"><GoyaWordmark /></Link></header><RegionSelector /><footer className="exact-country-legal">© {new Date().getFullYear()} Goya · {c.rights} {c.demonstration}</footer></main><Overlays /><Toast /></>;
}
