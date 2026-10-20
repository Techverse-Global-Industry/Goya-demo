'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy, shoeCategories } from '@/lib/fashion-copy';
import { presentationCopy } from '@/lib/presentation-copy';
import { gsap, useGSAP } from '@/lib/gsap';
import { SERVICES } from '@/lib/catalog';
import type { TranslationKey } from '@/lib/i18n';
import { Header } from './header';
import { Footer, CraftCampaign, MaisonStory } from './editorial';
import { BrandCollection } from './brand-collection';
import { MaisonImage } from './maison-image';
import { Overlays } from './overlays';
import { Toast } from './controls';
import { InstallPanel } from './pwa';
import { Icon } from './icon';

function BrandFrame({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.brand-reveal').forEach(element => {
        gsap.from(element, { y: 28, opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
    });
    return () => media.revert();
  }, { scope: root, dependencies: [pathname], revertOnUpdate: true });
  return <><Header /><main id="public-content" className="brand-page" ref={root}>{children}</main><InstallPanel /><Footer /><Overlays /><Toast /></>;
}

export function BrandLanding({ audience }: { audience: 'men' | 'women' }) {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  const fr = state.locale === 'fr';
  const men = audience === 'men';
  const intro = men ? (fr ? 'Le caractère se reconnaît au premier pas. Mocassins expressifs et baskets singulières : découvrez l’allure Goya au masculin.' : 'Character begins with the first step. Expressive loafers and distinctive sneakers: discover the Goya point of view for him.') : (fr ? 'Une ligne sculpturale, une matière expressive, un détail inattendu. Des souliers qui donnent à chaque pas une présence singulière.' : 'A sculptural line, an expressive texture, an unexpected detail. Shoes that bring a distinctive presence to every step.');
  return <BrandFrame>
    <section className={`brand-page-hero brand-page-hero--${audience}`}>
      <Image src={`/images/campaign/goya-movement-${audience}.webp`} alt={men ? copy.shopMen : copy.shopWomen} fill preload sizes={men ? '(min-width: 700px) 100vw, 220vw' : '100vw'} style={{ objectPosition: men ? '35% center' : 'center 58%' }} />
      <div className="brand-page-hero-copy brand-reveal"><span className="fashion-kicker">MAISON GOYA</span><h1>{copy[audience]}</h1><p>{men ? copy.menTitle : copy.womenTitle}</p><a href="#shoe-styles" className="fashion-link">{fr ? 'Explorer les styles' : 'Explore the styles'}</a></div>
    </section>
    <section id="shoe-styles" className="brand-page-intro brand-reveal"><h2>{men ? copy.menTitle : copy.womenTitle}</h2><p>{intro}</p></section>
    <div className="brand-style-sections">{shoeCategories.filter(category => category.filter === audience).map((category, index) => <section id={category.id} key={category.id} className={`brand-style-section ${index % 2 ? 'brand-style-section--reverse' : ''}`}>
      <div className="brand-style-photo"><Image src={category.image} alt={category.label[state.locale]} fill sizes={category.id === 'loafers' ? '(min-width: 700px) 100vw, 180vw' : '(min-width: 700px) 50vw, 100vw'} style={{ objectPosition: category.position }} /></div>
      <div className="brand-style-copy brand-reveal"><span className="fashion-kicker">{copy[audience]} / 0{index + 1}</span><h2>{category.label[state.locale]}</h2><p>{category.id === 'loafers' ? (fr ? 'L’élégance du cuir noir, réveillée par une touche tissée. Un classique qui affirme sa personnalité.' : 'Elegant black leather, brought to life with a woven accent. A classic with a character of its own.') : category.id === 'sneakers' ? (fr ? 'Des lignes décontractées, des motifs qui s’expriment. Une autre manière de porter l’allure Goya au quotidien.' : 'Relaxed lines. Expressive patterns. A different way to bring the Goya signature into the everyday.') : category.id === 'heels' ? (fr ? 'Des lignes sculpturales et des détails expressifs, pour les moments qui méritent une allure singulière.' : 'Sculptural lines and expressive details, for moments that call for something distinctive.') : (fr ? 'Un jeu de contrastes, une ligne précise. La bottine Goya signe une silhouette affirmée.' : 'A play of contrasts. A precise silhouette. The Goya ankle boot makes a confident statement.')}</p><Link href="/app/shop" className="fashion-link" onClick={() => { dispatch({ type: 'filter', filter: audience }); dispatch({ type: 'query', query: '' }); dispatch({ type: 'shoeType', shoeType: category.id }); }}>{fr ? 'Découvrir les pièces disponibles' : 'Discover available pieces'}<Icon name="arrow-right" /></Link></div>
    </section>)}</div>
    <section className="brand-next-world"><span className="fashion-kicker">MAISON GOYA</span><h2>{men ? copy.womenTitle : copy.menTitle}</h2><Link href={men ? '/women' : '/men'} className="fashion-link">{men ? copy.shopWomen : copy.shopMen}<Icon name="arrow-right" /></Link></section>
  </BrandFrame>;
}

export function CollectionsPage() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  return <BrandFrame><header className="brand-title-block brand-reveal"><span className="fashion-kicker">L’HÉRITAGE CROISÉ</span><h1>{copy.new}</h1><p>{state.locale === 'fr' ? 'Pour lui. Pour elle. Une signature singulière.' : 'For him. For her. A signature of your own.'}</p><div><Link href="/men" className="fashion-link">{copy.men}</Link><Link href="/women" className="fashion-link">{copy.women}</Link></div></header><BrandCollection /><CraftCampaign /></BrandFrame>;
}

export function MaisonPage() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  const story = presentationCopy[state.locale];
  return <BrandFrame><section className="brand-maison-opening"><div className="brand-maison-photo"><MaisonImage index={2} alt={copy.storyCulture} sizes="(min-width: 700px) 50vw, 100vw" className="object-cover" preload /></div><div className="brand-maison-copy brand-reveal"><span className="fashion-kicker">L’HÉRITAGE CROISÉ</span><h1>{copy.maison}</h1><h2>{copy.statement}</h2><p>{story.maisonBody}</p><p>{story.maisonSecond}</p><Link href="/collections" className="fashion-link">{copy.discover}<Icon name="arrow-right" /></Link></div></section><section className="brand-workshop-story"><div className="brand-workshop-copy brand-reveal"><span className="fashion-kicker">COTONOU / MAISON GOYA</span><h2>{copy.storyCraft}</h2><p>{copy.craftBody}</p><p>{state.locale === 'fr' ? 'Le caractère d’un soulier se prolonge dans le soin qu’on lui apporte. Découvrez les gestes et les services de l’atelier Goya.' : 'The character of a shoe continues through the care it receives. Discover the gestures and services of the Goya atelier.'}</p><Link href="/shoe-care" className="fashion-link">{copy.careCta}<Icon name="arrow-right" /></Link></div><div className="brand-workshop-photo"><MaisonImage index={1} alt={story.carePhoto} sizes="(min-width: 700px) 55vw, 100vw" className="object-cover" /></div></section><MaisonStory /></BrandFrame>;
}

export function ShoeCarePage() {
  const { state, t } = useShop();
  const copy = fashionCopy[state.locale];
  return <BrandFrame><header className="brand-title-block brand-title-block--care brand-reveal"><span className="fashion-kicker">ATELIER GOYA</span><h1>{state.locale === 'fr' ? 'L’art du soin' : 'The art of care'}</h1><p>{copy.careTitle}</p></header><CraftCampaign /><section className="brand-services"><div className="brand-service-intro brand-reveal"><span className="fashion-kicker">ATELIER GOYA</span><h2>{state.locale === 'fr' ? 'Une belle paire se préserve.' : 'A beautiful pair deserves care.'}</h2><p>{copy.careBody}</p><Link href="/app/atelier" className="fashion-link">{state.locale === 'fr' ? 'Réserver un soin' : 'Book a shoe-care service'}<Icon name="arrow-right" /></Link></div><div className="brand-service-details">{SERVICES.map((service, index) => <details key={service} open={index === 0}><summary><span>0{index + 1}</span><h3>{t(service)}</h3><Icon name="plus" /></summary><p>{t(`${service}Description` as TranslationKey)}</p></details>)}</div></section></BrandFrame>;
}

export function AccessoriesPage() {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  return <BrandFrame><section className="brand-accessories-opening"><div className="brand-accessories-photo"><MaisonImage index={11} alt={copy.accessories} sizes="(min-width: 700px) 55vw, 100vw" className="object-contain" preload /></div><div className="brand-style-copy brand-reveal"><span className="fashion-kicker">MAISON GOYA</span><h1>{copy.accessories}</h1><p>{state.locale === 'fr' ? 'Les détails donnent le ton. Des matières expressives et des associations inattendues pour composer votre propre allure.' : 'Details set the tone. Expressive materials and unexpected combinations, for a style that is entirely your own.'}</p><Link href="/app/shop" className="fashion-link" onClick={() => { dispatch({ type: 'filter', filter: 'accessories' }); dispatch({ type: 'query', query: '' }); }}>{copy.all}<Icon name="arrow-right" /></Link></div></section></BrandFrame>;
}
