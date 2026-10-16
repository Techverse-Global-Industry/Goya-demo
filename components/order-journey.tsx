'use client';
import { useShop } from '@/context/shop-context';
import type { Order, OrderStatus } from '@/lib/types';
import { Icon } from './icon';
export function OrderJourney({ order }: { order: Order }) {
  const { t, state } = useShop();
  const stages: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered'];
  const current = stages.indexOf(order.status ?? 'confirmed');
  if (order.status === 'cancelled') return <p className="status-label status-cancelled">{t('cancelled')}</p>;
  return <ol className="order-journey" aria-label={t('orderProgress')}>{stages.map((status, index) => {
    const event = order.events?.find((event) => event.status === status);
    return <li key={status} className={index <= current ? 'is-complete' : ''} aria-current={index === current ? 'step' : undefined}><span className="journey-dot">{index < current ? <Icon name="check" width={12} height={12} /> : index + 1}</span><span>{t(status)}{event && <small>{new Intl.DateTimeFormat(state.locale, { day: 'numeric', month: 'short' }).format(new Date(event.at))}</small>}</span></li>;
  })}</ol>;
}
