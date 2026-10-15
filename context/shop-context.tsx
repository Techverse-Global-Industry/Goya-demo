'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { formatMoney, remainingStock, STORAGE_KEY, subtotal } from '@/lib/commerce';
import { INITIAL_STATE, shopReducer } from '@/lib/store';
import type { ShopAction, ShopState } from '@/lib/store';
import { translate } from '@/lib/i18n';
import type { Translate } from '@/lib/i18n';
import type { Currency } from '@/lib/types';

interface ShopContextValue {
  state: ShopState;
  dispatch: Dispatch<ShopAction>;
  t: Translate;
  money: (minorUnits: number, currency?: Currency) => string;
  remaining: (productId: string, size: string) => number;
  itemCount: number;
  cartSubtotal: number;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, INITIAL_STATE);

  // Ordinary synchronization effects: no animation is created outside useGSAP.
  useEffect(() => {
    try { dispatch({ type: 'hydrate', raw: window.localStorage.getItem(STORAGE_KEY) }); }
    catch { dispatch({ type: 'hydrate', raw: null }); }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) dispatch({ type: 'hydrate', raw: event.newValue });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    const serialized = JSON.stringify({ version: 1, locale: state.locale, currency: state.currency, cart: state.cart });
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== serialized) window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Shopping stays functional in private browsing and storage-quota failures.
    }
  }, [state.ready, state.locale, state.currency, state.cart]);

  useEffect(() => {
    document.documentElement.lang = state.locale;
  }, [state.locale]);

  useEffect(() => {
    if (!state.notice) return;
    const timeout = window.setTimeout(() => dispatch({ type: 'dismissNotice' }), 5000);
    return () => window.clearTimeout(timeout);
  }, [state.notice]);

  const t = useCallback<Translate>((key, values) => translate(state.locale, key, values), [state.locale]);
  const money = useCallback((amount: number, currency: Currency = state.currency) => formatMoney(amount, currency, state.locale), [state.locale, state.currency]);
  const remaining = useCallback((productId: string, size: string) => remainingStock(state.cart, state.stockUsed, productId, size), [state.cart, state.stockUsed]);
  const value = useMemo<ShopContextValue>(() => ({
    state, dispatch, t, money, remaining,
    itemCount: state.cart.reduce((count, line) => count + line.quantity, 0),
    cartSubtotal: subtotal(state.cart, state.currency),
  }), [state, t, money, remaining]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used inside ShopProvider.');
  return context;
}
