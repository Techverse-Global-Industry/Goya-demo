'use client';

import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { translatedCopy } from '@/lib/international';

export function Manifesto() {
  const { state } = useShop();
  const copy = translatedCopy(fashionCopy[state.locale], state.language);
  return <section id="goya-spirit" className="reference-home-statement" aria-labelledby="goya-statement-title"><h2 id="goya-statement-title">{copy.statement}</h2><p>{copy.statementBody}</p></section>;
}
