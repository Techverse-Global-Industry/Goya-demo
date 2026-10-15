'use client';

import { Header } from '@/components/header';
import { Story } from '@/components/story';
import { Manifesto, Atelier, Footer } from '@/components/editorial';
import { Collection } from '@/components/collection';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';

export default function MaisonGoyaPage() {
  return <>
    <Header />
    <main>
      <Story />
      <Manifesto />
      <Collection />
      <Atelier />
    </main>
    <Footer />
    <Overlays />
    <Toast />
  </>;
}
