'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { Icon } from './icon';

export function MemberCollections() {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  return <section className="member-collections" aria-label={copy.new}>
    {(['men', 'women'] as const).map(category => <Link key={category} href={`/${category}`} onClick={() => dispatch({ type: 'resetFilters' })}>
      <Image src={`/images/campaign/goya-movement-${category}.webp`} alt={category === 'men' ? copy.shopMen : copy.shopWomen} fill sizes={category === 'men' ? '(min-width: 900px) 70vw, 100vw' : '(min-width: 900px) 40vw, 50vw'} style={{ objectPosition: category === 'men' ? '34% center' : 'center' }} />
      <span><strong>{copy[category]}</strong><span>{copy.all}<Icon name="arrow-right" width={16} /></span></span>
    </Link>)}
  </section>;
}
