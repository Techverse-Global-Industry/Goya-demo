'use client';

import { useShop } from '@/context/shop-context';
import { promoCopy } from '@/lib/promo-copy';
import { translatedCopy } from '@/lib/international';
import type { Order } from '@/lib/types';

export function OrderPromotion({order}:{order:Order}) {
  const {state,money}=useShop();
  if (!order.discount || !order.promoCode) return null;
  const c=translatedCopy(promoCopy[state.locale],state.language);
  const [before,after]=c.promotion.split('{code}');
  return <p className="order-promotion"><span>{before}<span translate="no">{order.promoCode}</span>{after}</span><strong>−{money(order.discount,order.currency)}</strong></p>;
}
