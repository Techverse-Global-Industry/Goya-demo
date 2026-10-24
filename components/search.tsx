'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { matchesProduct } from '@/lib/commerce';
import { storefrontCopy } from '@/lib/storefront';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function SearchModal({ close }: { close: () => void }) {
  const { state, dispatch, t, money, products } = useShop();
  const copy = storefrontCopy[state.locale];
  const router = useRouter();
  const [query, setQuery] = useState(state.query);
  const results = useMemo(() => products.filter(product => matchesProduct(product, query)), [query, products]);
  const submit = (value = query) => {
    dispatch({ type: 'resetFilters' }); dispatch({ type: 'query', query: value });
    dispatch({ type: 'close' }); router.push(`/search?q=${encodeURIComponent(value)}`);
  };
  return <div className="reference-search">
    <form className="reference-search-form" onSubmit={event => { event.preventDefault(); submit(); }}>
      <Icon name="search-spark" width={26} />
      <label htmlFor="maison-search" className="sr-only">{t('searchCollection')}</label>
      <input id="maison-search" type="search" maxLength={120} placeholder={copy.searchPlaceholder} autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} data-initial-focus />
      {query && <button type="submit" className="reference-search-submit" aria-label={copy.seeResults}><Icon name="arrow-right" /></button>}
      <button type="button" className="icon-button" data-close-modal aria-label={t('close')} onClick={close}><Icon name="close" /></button>
    </form>
    {query.trim() ? <div className="reference-search-results">
      <div className="reference-search-summary"><p role="status">{t('searchResults', { count: results.length })}</p><button type="button" className="fashion-link" onClick={() => submit()}>{copy.seeResults}<Icon name="arrow-right" width={16} /></button></div>
      <ul>{results.slice(0, 4).map(product => <li key={product.id}><Link href={`/product/${product.id}`} onClick={() => dispatch({ type: 'close' })}>
        <div className="reference-search-photo"><MaisonImage index={product.image} sources={product.images} alt={product.name[state.locale]} sizes="(min-width: 700px) 20vw, 45vw" className="object-cover" /></div>
        <h3>{product.name[state.locale]}</h3><p>{money(product.prices[state.currency])}</p>
      </Link></li>)}</ul>
      {!results.length && <div className="empty-state"><h2>{t('noResults')}</h2><p>{t('noResultsText')}</p><button className="fashion-link" type="button" onClick={() => setQuery('')}>{t('clearSearch')}</button></div>}
    </div> : <div className="reference-search-discovery"><div><h2>{copy.suggestions}</h2><Link href="/new-arrivals" onClick={() => dispatch({ type: 'close' })}>{copy.newArrivals}</Link><Link href="/men" onClick={() => dispatch({ type: 'close' })}>{copy.man}</Link><Link href="/women" onClick={() => dispatch({ type: 'close' })}>{copy.woman}</Link><Link href="/personalization" onClick={() => dispatch({ type: 'close' })}>{copy.personalization}</Link></div><div><h2>{copy.mostSearched}</h2><div className="reference-search-chips">{(['loafers', 'sneakers', 'heels', 'boots'] as const).map(style => <button type="button" key={style} onClick={() => submit(copy[style])}>{copy[style]}<Icon name="arrow-up-right" width={16} /></button>)}</div></div></div>}
  </div>;
}
