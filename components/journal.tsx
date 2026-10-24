'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { CULTURE_STORIES } from '@/lib/culture-stories';
import { localizedText, siteText, translatedCopy } from '@/lib/international';
import { Icon } from './icon';
import { useCarousel } from './use-carousel';

export function MaisonStory() {
  const { state } = useShop();
  const copy = translatedCopy(fashionCopy[state.locale],state.language);
  const { track, bounds, move, onKeyDown } = useCarousel(CULTURE_STORIES.length,state.language==='ar');
  return <section id="maison" className="reference-home-journal" aria-labelledby="goya-journal-title" aria-roledescription={siteText(state.language,'carousel','carrousel')}>
    <div className="reference-journal-intro"><h2 id="goya-journal-title">{copy.journal}</h2><p>{copy.journalBody}</p></div>
    <div id="goya-journal-rail" className="reference-journal-rail" ref={track} tabIndex={0} role="region" aria-label={siteText(state.language,'Scroll through stories from the Maison','Les histoires de la Maison, à faire défiler')} onKeyDown={onKeyDown}>{CULTURE_STORIES.map((story, index) => <article className="reference-journal-story" key={story.slug} aria-label={`${index + 1} / ${CULTURE_STORIES.length}`}><Link href={`/culture/${story.slug}`}><div className={`reference-journal-image reference-journal-image--${story.slug}`}><Image src={story.image} alt={localizedText(story.alt,state.language)} fill sizes="(min-width: 700px) 23vw, 66vw" /><div className="reference-journal-caption"><h3><span>{localizedText(story.title,state.language)}</span></h3></div></div></Link></article>)}</div>
    <div className="reference-journal-controls"><button type="button" disabled={bounds.start} aria-controls="goya-journal-rail" aria-label={copy.previous} onClick={() => move(-1)}><Icon name="arrow-left" width={21} /></button><button type="button" disabled={bounds.end} aria-controls="goya-journal-rail" aria-label={copy.next} onClick={() => move(1)}><Icon name="arrow-right" width={21} /></button></div>
  </section>;
}
