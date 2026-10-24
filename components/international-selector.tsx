'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { COUNTRY_PROMPT_KEY, INTERNATIONAL_MARKETS, REGION_IDS, marketName, translatedCopy } from '@/lib/international';
import { internationalCopy } from '@/lib/international-copy';
import type { InternationalRegion } from '@/lib/international';
import type { Country } from '@/lib/types';
import { Icon } from './icon';

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function CountrySelector({ onComplete }: { onComplete?: () => void } = {}) {
  const { state, dispatch } = useShop();
  const router = useRouter();
  const id = useId();
  const c = translatedCopy(internationalCopy[state.locale], state.language);
  const [region, setRegion] = useState<InternationalRegion>('europe');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const countries = INTERNATIONAL_MARKETS.filter(market => market.code !== 'WW');
  const showingResults = searchOpen && query.length > 0;
  const matches = query.trim().length >= 2 ? countries.filter(market => fold(marketName(market.code, state.language)).includes(fold(query)) || fold(market.name).includes(fold(query)) || market.code.toLowerCase() === fold(query)) : [];
  const choose = (code: Country) => {
    const market = INTERNATIONAL_MARKETS.find(item => item.code === code);
    if (!market) return;
    try { sessionStorage.setItem(COUNTRY_PROMPT_KEY, 'shown'); } catch { /* The explicit choice remains effective for this visit. */ }
    dispatch({ type: 'market', market: code });
    dispatch({ type: 'currency', currency: market.currency });
    dispatch({ type: 'language', language: market.language });
    dispatch({ type: 'close' });
    onComplete?.();
    router.push('/');
  };
  const countryButton = (market: typeof INTERNATIONAL_MARKETS[number]) => <button key={market.code} type="button" className="exact-country-link" onClick={() => choose(market.code)} aria-current={state.market === market.code ? 'true' : undefined}><Image src={`/images/flags/${market.code.toLowerCase()}.svg`} alt="" width={14} height={14} unoptimized /><span>{marketName(market.code, state.language)}</span></button>;
  return <section className="exact-country-selector" aria-labelledby={`${id}-heading`}><h1 id={`${id}-heading`}>{c.chooseCountry}</h1><div className="exact-country-search"><label className="sr-only" htmlFor={`${id}-search`}>{c.search}</label><input id={`${id}-search`} type="search" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={showingResults} aria-controls={`${id}-results`} aria-activedescendant={searchOpen && matches[active] ? `${id}-${matches[active].code}` : undefined} value={query} placeholder={c.search.toLowerCase()} onFocus={() => setSearchOpen(true)} onBlur={event => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setSearchOpen(false); }} onChange={event => { setQuery(event.target.value); setActive(0); setSearchOpen(true); }} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); if (event.key === 'ArrowDown' && matches.length) { event.preventDefault(); setSearchOpen(true); setActive(index => Math.min(index + 1, matches.length - 1)); } if (event.key === 'ArrowUp' && matches.length) { event.preventDefault(); setActive(index => Math.max(0, index - 1)); } if (event.key === 'Enter' && searchOpen && matches[active]) { event.preventDefault(); choose(matches[active].code); } }} /><Icon name="search" width={17} />{showingResults && <div className="exact-country-results" id={`${id}-results`} role="listbox" aria-label={c.chooseCountry}>{query.trim().length < 2 ? <p>{c.minimum}</p> : matches.length ? matches.map((market,index) => <button type="button" role="option" tabIndex={-1} aria-selected={active === index} id={`${id}-${market.code}`} key={market.code} onPointerEnter={() => setActive(index)} onClick={() => choose(market.code)}><Image src={`/images/flags/${market.code.toLowerCase()}.svg`} alt="" width={14} height={14} unoptimized />{marketName(market.code, state.language)}</button>) : <p role="status">{c.noResults}</p>}</div>}</div><div className="exact-country-desktop"><nav role="tablist" aria-label={c.chooseCountry}>{REGION_IDS.map(area => <button key={area} role="tab" id={`${id}-${area}-tab`} type="button" aria-selected={region === area} aria-controls={`${id}-${area}-panel`} onClick={() => { setRegion(area); setSearchOpen(false); }}>{c[area]}</button>)}<button type="button" className="exact-country-world" onClick={() => choose('WW')}>{c.international}<Icon name="chevron-right" width={16} /></button></nav><div className="exact-country-grid" role="tabpanel" id={`${id}-${region}-panel`} aria-labelledby={`${id}-${region}-tab`}>{countries.filter(market => market.region === region).map(countryButton)}</div></div><div className="exact-country-mobile">{REGION_IDS.map(area => <details key={area}><summary>{c[area]}<Icon name="plus" width={16} /></summary><div>{countries.filter(market => market.region === area).map(countryButton)}</div></details>)}<button type="button" className="exact-country-world" onClick={() => choose('WW')}>{c.international}<Icon name="chevron-right" width={16} /></button></div></section>;
}
