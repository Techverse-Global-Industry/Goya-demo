'use client';

import { Header } from '@/components/header';
import { Story } from '@/components/story';
import { Manifesto, MaisonStory, Footer, CraftCampaign } from '@/components/editorial';
import { BrandCollection } from '@/components/brand-collection';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';

export default function MaisonGoyaPage() {
  return <>
    <Header />
    <main id="public-content" className="maison-public">
      <Story />
      <BrandCollection />
      <CraftCampaign />
      <Manifesto />
      <MaisonStory />
    </main>
    <Footer />
    <Overlays />
    <Toast />
  </>;
}
