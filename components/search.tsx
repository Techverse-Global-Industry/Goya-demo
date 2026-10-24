'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { readConsent } from '@/lib/consent';
import { rankedSearch, safeRecentSearches, searchSuggestions } from '@/lib/search';
import { storefrontCopy } from '@/lib/storefront';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

const RECENT = 'goya-recent-searches-v1';
export function SearchModal({ close }: { close: () => void }) {
  const { state, dispatch, t, money, products } = useShop(); const copy = storefrontCopy[state.locale]; const fr = state.locale === 'fr';
  const router = useRouter(); const [query, setQuery] = useState(state.query); const [recent, setRecent] = useState<string[]>([]);
  const results = useMemo(() => rankedSearch(products, query), [query, products]);
  const suggestions = useMemo(() => searchSuggestions(products, state.locale), [products, state.locale]);
  useEffect(() => { const read = () => { try { setRecent(readConsent()?.experience ? safeRecentSearches(localStorage.getItem(RECENT)) : []); } catch { setRecent([]); } }; read(); window.addEventListener('goya:consent', read); return () => window.removeEventListener('goya:consent', read); }, []);
  const remember = (value: string) => { if (!value.trim() || !readConsent()?.experience) return; try { localStorage.setItem(RECENT, JSON.stringify([value.trim(), ...recent.filter(item => item !== value.trim())].slice(0, 5))); } catch { /* Optional history does not affect search. */ } };
  const submit = (value = query) => { const clean = value.trim().slice(0,120); remember(clean); dispatch({ type: 'resetFilters' }); dispatch({ type: 'query', query: clean }); dispatch({ type: 'close' }); router.push(`/search?q=${encodeURIComponent(clean)}`); };
  const clearRecent = () => { try { localStorage.removeItem(RECENT); } catch { /* Optional. */ } setRecent([]); };
  const categorySuggestions = query.trim() ? suggestions.filter(item => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 4) : [];
  return <div className="reference-search"><form className="reference-search-form" onSubmit={event => { event.preventDefault(); submit(); }}>
    <Icon name="search-spark" width={26} /><label htmlFor="maison-search" className="sr-only">{t('searchCollection')}</label><input id="maison-search" type="search" maxLength={120} placeholder={copy.searchPlaceholder} autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} data-initial-focus />
    {query && <button type="submit" className="reference-search-submit" aria-label={copy.seeResults}><Icon name="arrow-right" /></button>}<button type="button" className="icon-button" data-close-modal aria-label={t('close')} onClick={close}><Icon name="close" /></button>
  </form>{query.trim() ? <div className="reference-search-results">
    {categorySuggestions.length > 0 && <nav className="reference-search-categories" aria-label={fr ? 'Catégories suggérées' : 'Suggested categories'}>{categorySuggestions.map(item => <Link key={item.href} href={item.href} onClick={() => { remember(query); close(); }}>{item.label}<Icon name="arrow-up-right" width={14} /></Link>)}</nav>}
    <div className="reference-search-summary"><p role="status">{t('searchResults', { count: results.length })}</p><button type="button" className="fashion-link" onClick={() => submit()}>{copy.seeResults}<Icon name="arrow-right" width={16} /></button></div>
    <ul>{results.slice(0, 4).map(product => <li key={product.id}><Link href={`/product/${product.id}`} onClick={() => { remember(query); close(); }}><div className="reference-search-photo"><MaisonImage index={product.image} sources={product.images} alt={product.name[state.locale]} sizes="(min-width:700px) 20vw,45vw" className="object-cover" /></div><h3>{product.name[state.locale]}</h3><p>{money(product.prices[state.currency])}</p></Link></li>)}</ul>
    {!results.length && <div className="empty-state"><h2>{t('noResults')}</h2><p>{t('noResultsText')}</p><button className="fashion-link" type="button" onClick={() => setQuery('')}>{t('clearSearch')}</button></div>}
  </div> : <div className="reference-search-discovery"><div><h2>{copy.suggestions}</h2><Link href="/new-arrivals" onClick={close}>{copy.newArrivals}</Link><Link href="/men" onClick={close}>{copy.man}</Link><Link href="/women" onClick={close}>{copy.woman}</Link><Link href="/accessories" onClick={close}>{copy.accessories}</Link><Link href="/personalization" onClick={close}>{copy.personalization}</Link></div><div><h2>{fr ? 'Explorer les styles' : 'Explore the styles'}</h2><div className="reference-search-chips">{suggestions.map(item => <button type="button" key={item.href} onClick={() => submit(item.label)}>{item.label}<Icon name="arrow-up-right" width={16} /></button>)}</div>{recent.length > 0 && <div className="reference-recent-searches"><h2>{fr ? 'Vos recherches récentes' : 'Your recent searches'}</h2><button type="button" className="reference-text-link" onClick={clearRecent}>{fr ? 'Tout effacer' : 'Clear all'}</button><div>{recent.map(item => <button type="button" key={item} onClick={() => submit(item)}>{item}<Icon name="arrow-up-right" width={14} /></button>)}</div></div>}</div></div>}</div>;
}
