'use client';

import { useShop } from '@/context/shop-context';
import { StorefrontShell } from './storefront-pages';
import { CustomerRequests, GuestOrderLookup, OrdersAndReturns } from './after-sales';

export function ReturnsPage() {
  const { state } = useShop();
  return <StorefrontShell className="reference-returns-page"><header className="reference-public-heading"><h1>{state.locale === 'fr' ? 'Retours et remboursements' : 'Returns & refunds'}</h1><p>{state.locale === 'fr' ? 'Retrouvez votre commande, sélectionnez vos articles et suivez votre retour de démonstration.' : 'Find your order, choose your items and follow your demonstration return.'}</p></header><div className="customer-service-workspace"><GuestOrderLookup /><OrdersAndReturns /></div></StorefrontShell>;
}
export function MyRequestsPage() {
  const { state } = useShop();
  return <StorefrontShell className="reference-requests-page"><header className="reference-public-heading"><h1>{state.locale === 'fr' ? 'Mes demandes' : 'My requests'}</h1><p>{state.locale === 'fr' ? 'Retrouvez les demandes liées à votre compte ou à ce navigateur.' : 'Follow the requests linked to your account or this browser.'}</p></header><div className="customer-service-workspace"><CustomerRequests /></div></StorefrontShell>;
}
