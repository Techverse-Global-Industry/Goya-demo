'use client';

import { useMemo, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { matchesProduct } from '@/lib/commerce';
import { shoeTypeOf } from '@/lib/merchandising';
import { EMPTY_FILTERS, matchesCatalogFilters, productColors, productMaterials, storefrontCopy } from '@/lib/storefront';
import type { CatalogFilters, Category, ShoeType } from '@/lib/types';
import { Icon } from './icon';

export function CatalogFilterDrawer({ close, category = 'all', style = 'all' }: { close: () => void; category?: Category; style?: ShoeType }) {
  const { state, dispatch, products, t } = useShop();
  const copy = storefrontCopy[state.locale];
  const fr = state.locale === 'fr';
  const [draft, setDraft] = useState<CatalogFilters>(() => ({ ...state.catalogFilters }));
  const candidates = useMemo(() => products.filter(product => product.published !== false && (category === 'all' || product.category === category) && (style === 'all' || shoeTypeOf(product) === style) && matchesProduct(product, state.query)), [products, category, style, state.query]);
  const resultCount = candidates.filter(product => matchesCatalogFilters(product, draft)).length;
  const sizes = [...new Set([...candidates.flatMap(product => Object.keys(product.stock).filter(size => product.stock[size] > 0)), ...draft.sizes])].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const colors = [...new Set([...candidates.flatMap(productColors), ...draft.colors])];
  const materials = [...new Set([...candidates.flatMap(productMaterials), ...draft.materials])];
  const styles = [...new Set([...candidates.map(shoeTypeOf).filter((value): value is Exclude<ShoeType, 'all'> => value !== null), ...draft.styles])];
  const genders = [...new Set([...candidates.map(product => product.category), ...(draft.genders ?? []).filter((value): value is Exclude<Category, 'all'> => value !== 'all')])];
  const active = Object.values(draft).some(values => values?.length);
  const toggle = (facet: keyof CatalogFilters, value: string) => setDraft(previous => {
    const values: readonly string[] = previous[facet] ?? [];
    return { ...previous, [facet]: values.includes(value) ? values.filter(item => item !== value) : [...values, value] };
  });
  const facetName = (value: string) => value in copy ? copy[value as keyof typeof copy] : value;
  const groups: { facet: keyof CatalogFilters; label: string; options: string[]; kind?: 'sizes' | 'colors' }[] = [
    ...(category === 'all' ? [{ facet: 'genders' as const, label: copy.gender, options: genders }] : []),
    { facet: 'sizes', label: copy.size, options: sizes, kind: 'sizes' },
    { facet: 'colors', label: copy.color, options: colors, kind: 'colors' },
    { facet: 'materials', label: copy.material, options: materials },
    ...(style === 'all' ? [{ facet: 'styles' as const, label: copy.categories, options: styles }] : []),
  ];
  return <div className="reference-filter-drawer"><div className="reference-filter-groups">{groups.filter(group => group.options.length > 0).map(group => <details className="reference-filter-group" key={group.facet}><summary>{group.label}<span>{(draft[group.facet]?.length ?? 0) > 0 && <b>({draft[group.facet]?.length})</b>}<Icon name="plus" width={18} /></span></summary><div className={`reference-facet-options ${group.kind === 'sizes' ? 'reference-facet-options--sizes' : ''}`}>{group.options.map(value => {
    const label = group.facet === 'genders' ? value === 'men' ? copy.man : value === 'women' ? copy.woman : copy.accessories : group.facet === 'sizes' ? value === 'OS' ? t('oneSize') : value : facetName(value);
    return <label key={value} className={group.kind === 'sizes' ? 'reference-size-choice' : 'reference-facet-choice'}><input type="checkbox" checked={(draft[group.facet] ?? []).some(item => item === value)} onChange={() => toggle(group.facet, value)} /><span>{group.kind === 'colors' && <i className={`reference-color-dot reference-color-dot--${value}`} />}{label}</span></label>;
  })}</div></details>)}{!candidates.length && <p className="reference-filter-no-results">{copy.empty}</p>}</div><footer className="reference-filter-actions"><button type="button" className="reference-filter-clear" disabled={!active} onClick={() => setDraft(EMPTY_FILTERS)}>{copy.clearAll}</button><button type="button" className="reference-filter-apply" onClick={() => { dispatch({ type: 'catalogFilters', filters: draft }); close(); }}>{fr ? `Voir ${resultCount} résultat${resultCount === 1 ? '' : 's'}` : `Show ${resultCount} result${resultCount === 1 ? '' : 's'}`}</button></footer></div>;
}
