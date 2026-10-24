'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { CULTURE_STORIES } from '@/lib/culture-stories';
import { StorefrontShell } from './storefront-pages';
import { Icon } from './icon';

export function JournalPage() {
  const { state } = useShop(); const fr = state.locale === 'fr';
  return <StorefrontShell className="goya-journal-page"><header className="reference-public-heading"><p className="fashion-kicker">MAISON GOYA</p><h1>{fr ? 'Le journal Goya' : 'The Goya journal'}</h1><p>{fr ? 'Des rencontres, des matières, des gestes. Les histoires qui donnent du caractère à chaque pas.' : 'People, materials and gestures. The stories that give every step its character.'}</p></header><section className="goya-journal-grid" aria-label={fr ? 'Toutes nos histoires' : 'All our stories'}>{CULTURE_STORIES.map(story => <article key={story.slug}><Link href={`/culture/${story.slug}`}><div className="goya-journal-photo"><Image src={story.image} alt={story.alt[state.locale]} fill sizes="(min-width:1000px) 33vw,(min-width:700px) 50vw,100vw" className="object-cover" /><span>{story.title[state.locale]}<Icon name="arrow-up-right" width={18} /></span></div><p className="fashion-kicker">{story.kicker[state.locale]}</p><p>{story.intro[state.locale]}</p></Link></article>)}</section></StorefrontShell>;
}
