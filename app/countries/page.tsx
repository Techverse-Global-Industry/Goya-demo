'use client';

import { useRouter } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { experienceCopy } from '@/lib/service-experiences';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
import { RegionSelector } from '@/components/reference-services';

export default function Page(){
  const {state}=useShop();const router=useRouter();const c=experienceCopy[state.locale];
  return <><Header /><main id="public-content" className="reference-service-page experience-countries-page"><header className="reference-service-heading"><h1>{c.countries}</h1><p>{c.countryIntro}</p></header><RegionSelector onComplete={()=>router.push('/collections')} /></main><Footer /><Overlays /><Toast /></>;
}
