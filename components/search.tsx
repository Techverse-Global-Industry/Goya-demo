'use client';

import { useMemo, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { matchesProduct } from '@/lib/commerce';
import { useSectionNavigation } from '@/lib/use-section-navigation';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function SearchModal() {
  const { state, dispatch, t, money, products } = useShop();
  const [query, setQuery] = useState(state.query);
  const scrollToSection = useSectionNavigation();
  const results = useMemo(() => {
    return products.filter((product) => matchesProduct(product, query));
  }, [query, products]);
  return <div className="search-root">
    <p className="eyebrow">{t('searchEyebrow')}</p><h2 className="modal-display-title">{t('searchTitle')}</h2>
    <form className="search-form" onSubmit={(event) => {
      event.preventDefault(); dispatch({ type: 'filter', filter: 'all' }); dispatch({ type: 'query', query }); dispatch({ type: 'close' }); requestAnimationFrame(() => scrollToSection('collection'));
    }}>
      <label htmlFor="maison-search" className="sr-only">{t('searchCollection')}</label>
      <div className="search-input-wrap"><Icon name="search" /><input id="maison-search" type="search" maxLength={120} placeholder={t('searchPlaceholder')} autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} data-initial-focus />
        <button type="submit" className="icon-button" aria-label={t('searchCollection')}><Icon name="arrow-right" /></button>
      </div>
    </form>
    <p className="search-count" role="status">{query ? t('searchResults', { count: results.length }) : t('searchHint')}</p>
    <ul className="search-results">{results.map((product) => <li key={product.id}>
      <button type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'quick', productId: product.id } })}>
        <div className="search-thumbnail"><MaisonImage key={product.images?.join()} index={product.image} sources={product.images} alt={product.name[state.locale]} sizes="76px" className="object-cover" /></div>
        <div><span className="eyebrow">{t(product.category)}</span><h3>{product.name[state.locale]}</h3><p>{product.color[state.locale]}</p></div>
        <span className="search-result-price">{money(product.prices[state.currency])}</span><Icon name="arrow-up-right" width={17} height={17} />
      </button>
    </li>)}</ul>
    {!results.length && <div className="empty-state"><h3>{t('noResults')}</h3><p>{t('noResultsText')}</p><button type="button" className="text-link" onClick={() => setQuery('')}>{t('clearSearch')}</button></div>}
  </div>;
}
