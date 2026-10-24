'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { normalizeSearch } from '@/lib/commerce';
import { belongsToEdit, SHOE_STYLE_LABELS } from '@/lib/catalog-edits';
import { shoeTypeOf } from '@/lib/merchandising';
import { localizedText, siteText, translatedCopy } from '@/lib/international';
import { rankedSearch, searchSuggestions } from '@/lib/search';
import { storefrontCopy } from '@/lib/storefront';
import type { Product } from '@/lib/types';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function SearchModal({ close }: { close: () => void }) {
  const { state, dispatch, t, products } = useShop();
  const copy = translatedCopy(storefrontCopy[state.locale], state.language);
  const router = useRouter();
  const navigateClose = () => dispatch({ type: 'close' });
  const [query, setQuery] = useState(state.query);
  const track = useRef<HTMLUListElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });
  const results = useMemo(() => {
    const matches = rankedSearch(products, query);
    const found = new Set(matches.map(product => product.id));
    const term = normalizeSearch(query);
    if (term && state.language !== 'en' && state.language !== 'fr') {
      for (const product of products) {
        const style = shoeTypeOf(product);
        const corpus = normalizeSearch([product.name, product.color, product.material, product.description, ...(style ? [SHOE_STYLE_LABELS[style]] : [])].map(value => localizedText(value, state.language)).join(' '));
        if (!found.has(product.id) && product.published !== false && term.split(' ').filter(Boolean).every(word => corpus.includes(word))) matches.push(product);
      }
    }
    return matches;
  }, [products, query, state.language]);
  const featured = products.filter(product => product.published !== false && belongsToEdit(product, 'featured')).slice(0, 8);
  const suggestions = searchSuggestions(products, 'en').map(item => ({ ...item, label: localizedText(Object.values(SHOE_STYLE_LABELS).find(label => label.en === item.label) ?? { en: item.label, fr: item.label }, state.language), query: item.label }));
  const phrases = [...new Set(results.map(product => {
    const style = shoeTypeOf(product);
    return style ? localizedText(SHOE_STYLE_LABELS[style], state.language) : localizedText(product.name, state.language);
  }))].slice(0, 4);
  const typing = Boolean(query.trim());
  const submit = (value = query) => {
    const clean = value.trim().slice(0, 120);
    dispatch({ type: 'resetFilters' }); dispatch({ type: 'query', query: clean });
    navigateClose(); router.push('/search?q=' + encodeURIComponent(clean));
  };
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setBounds(previous => {
      const start = element.scrollLeft < 5;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 5;
      return start === previous.start && end === previous.end ? previous : { start, end };
    });
    const observer = new ResizeObserver(update); observer.observe(element);
    element.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [typing, featured.length, results.length]);
  const move = (direction: number) => {
    const element = track.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const card = (product: Product) => <Link href={'/product/' + product.id} onClick={navigateClose}><div className="reference-search-photo"><MaisonImage index={product.image} sources={product.images} alt={localizedText(product.name, state.language)} sizes="(min-width:1200px) 16vw,45vw" /></div><h3>{localizedText(product.name, state.language)}</h3></Link>;
  const carousel = <div className="reference-search-carousel"><ul ref={track} className="reference-search-carousel-track">{featured.map(product => <li key={product.id}>{card(product)}</li>)}</ul><div className="reference-search-carousel-controls"><button type="button" disabled={bounds.start} aria-label={siteText(state.language, 'Previous creations', 'Créations précédentes')} onClick={() => move(-1)}><Icon name="chevron-left" width={15} /></button><button type="button" disabled={bounds.end} aria-label={siteText(state.language, 'Next creations', 'Créations suivantes')} onClick={() => move(1)}><Icon name="chevron-right" width={15} /></button></div></div>;

  return <div className="reference-search exact-search-layer" data-state={typing ? results.length ? 'typing' : 'noresults' : 'initial'}>
    <form className="reference-search-form" onSubmit={event => { event.preventDefault(); submit(); }}>
      <Icon name="search-spark" width={24} /><label htmlFor="maison-search" className="sr-only">{t('searchCollection')}</label><input id="maison-search" type="search" maxLength={120} placeholder={copy.search} autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} data-initial-focus /><button type="button" className="icon-button" data-close-modal aria-label={t('close')} onClick={close}><Icon name="close" width={24} /></button>
    </form>
    <div className="reference-search-panel">
      <aside className="reference-search-suggested">{typing ? <ul>{phrases.map(phrase => <li key={phrase}><button type="button" onClick={() => submit(phrase)}>{phrase}</button></li>)}</ul> : <><h2>{copy.suggestions}</h2><ul><li><Link href="/edits/formal" onClick={navigateClose}>{siteText(state.language, "Men's Formal Edit", 'La sélection formelle homme')}</Link></li><li><Link href="/women/heels" onClick={navigateClose}>{siteText(state.language, "Women's Elegance Edit", 'La sélection élégance femme')}</Link></li><li><Link href="/men/boots" onClick={navigateClose}>{siteText(state.language, "Men's Boots", 'Les bottines homme')}</Link></li></ul></>}</aside>
      <div className={typing ? 'reference-search-results reference-search-main' : 'reference-search-discovery reference-search-main'}>
        {typing ? results.length ? <><h2>{siteText(state.language, 'Suggested products', 'Produits suggérés')}</h2><ul className="reference-search-products">{results.slice(0, 5).map(product => <li key={product.id}>{card(product)}</li>)}</ul><button type="button" className="reference-search-seeall" onClick={() => submit()}>{copy.seeResults}<Icon name="chevron-right" width={16} /></button></> : <div className="reference-search-no-results"><h2>{t('noResults')}</h2><p role="status">{t('noResultsText')}</p>{carousel}</div> : <><h2>{copy.mostSearched}</h2><div className="reference-search-chips">{suggestions.map(item => <button type="button" key={item.href} onClick={() => submit(item.query)}><Icon name="search" width={16} /><span>{item.label}</span></button>)}</div>{carousel}</>}
      </div>
    </div>
  </div>;
}
