'use client';

import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { belongsToEdit } from '@/lib/catalog-edits';
import { localizedText, siteText } from '@/lib/international';
import { priceAmount } from '@/lib/commerce';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';
import { useCarousel } from './use-carousel';

export function FeaturedProducts() {
  const { state, money } = useShop();
  const label = (en: string, fr: string) => siteText(state.language,en,fr);
  const products = state.products.filter(product => product.published !== false && belongsToEdit(product, 'featured'));
  const { track, bounds, move, onKeyDown } = useCarousel(products.length, state.language==='ar');
  if (!products.length) return null;
  return <section className="reference-home-featured" aria-label={label('The Goya essentials','Les essentiels Goya')} aria-roledescription={label('carousel','carrousel')}>
    <div className="reference-featured-stage">
      <div id="goya-featured-track" className="reference-featured-track" ref={track} tabIndex={0} role="region" aria-label={label('Scroll through the signature selection','La sélection signature, à faire défiler')} onKeyDown={onKeyDown}>{products.map((product, index) => <article className="reference-featured-product" key={product.id} aria-label={`${index + 1} / ${products.length}`}><Link href={`/product/${encodeURIComponent(product.id)}`}><div className="reference-featured-image"><MaisonImage index={product.image} sources={product.images} alt={localizedText(product.name,state.language)} sizes="(min-width: 700px) 25vw, 50vw" /></div><h3><span>{localizedText(product.name,state.language)}</span></h3><p>{money(priceAmount(product.prices,state.currency))}</p></Link></article>)}</div>
      <div className="reference-featured-controls"><button type="button" disabled={bounds.start} aria-controls="goya-featured-track" aria-label={label('Previous creation','Création précédente')} onClick={() => move(-1)}><Icon name="arrow-left" width={21} /></button><button type="button" disabled={bounds.end} aria-controls="goya-featured-track" aria-label={label('Next creation','Création suivante')} onClick={() => move(1)}><Icon name="arrow-right" width={21} /></button></div>
    </div>
  </section>;
}
