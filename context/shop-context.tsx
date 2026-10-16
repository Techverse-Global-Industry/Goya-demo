'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { formatMoney, remainingStock, STORAGE_KEY, subtotal } from '@/lib/commerce';
import { INITIAL_STATE, shopReducer } from '@/lib/store';
import type { ShopAction, ShopState } from '@/lib/store';
import { translate } from '@/lib/i18n';
import type { Translate } from '@/lib/i18n';
import type { Currency, Product, StoreSnapshot } from '@/lib/types';

interface ShopContextValue {
  state: ShopState;
  dispatch: Dispatch<ShopAction>;
  t: Translate;
  money: (minorUnits: number, currency?: Currency) => string;
  remaining: (productId: string, size: string) => number;
  itemCount: number;
  cartSubtotal: number;
  products: Product[];
  productById: ReadonlyMap<string, Product>;
  refresh: (force?: boolean) => Promise<void>;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, INITIAL_STATE);
  const inFlight = useRef<Promise<void> | null>(null);
  const catalogReady = useRef(false);
  const refresh = useCallback(function refreshSnapshot(force = false): Promise<void> {
    if (inFlight.current) return force ? inFlight.current.then(() => refreshSnapshot()) : inFlight.current;
    inFlight.current = (async () => {
      try {
        const response = await fetch('/api/shop', { cache: 'no-store' });
        if (!response.ok) throw new Error('Unavailable');
        const snapshot = await response.json() as StoreSnapshot;
        dispatch({ type: 'sync', snapshot });
        if (!catalogReady.current) {
          catalogReady.current = true;
          let raw: string | null = null;
          try { const stored = window.localStorage.getItem(STORAGE_KEY); if (stored) { const prefs = JSON.parse(stored); raw = JSON.stringify({ ...prefs, cart: prefs.customerId === snapshot.user?.id ? prefs.cart : [] }); } } catch { /* unavailable storage */ }
          dispatch({ type: 'hydrate', raw });
        }
      } catch { dispatch({ type: 'connection', connected: false }); }
      finally { inFlight.current = null; }
    })();
    return inFlight.current;
  }, []);

  // Ordinary synchronization effects: no animation is created outside useGSAP.
  useEffect(() => {
    void refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      let raw = event.newValue;
      try { if (raw) { const prefs = JSON.parse(raw); raw = JSON.stringify({ ...prefs, cart: prefs.customerId === state.user?.id ? prefs.cart : [] }); } } catch { raw = null; }
      dispatch({ type: 'hydrate', raw });
      void refresh();
    };
    window.addEventListener('storage', onStorage);
    const onRefresh = () => { if (document.visibilityState === 'visible') void refresh(); };
    const interval = window.setInterval(onRefresh, 12000);
    window.addEventListener('maison:refresh', onRefresh);
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel('maison-shop') : null;
    if (channel) channel.onmessage = onRefresh;
    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onRefresh);
    return () => { channel?.close(); window.removeEventListener('storage', onStorage); window.removeEventListener('maison:refresh', onRefresh); window.removeEventListener('focus', onRefresh); document.removeEventListener('visibilitychange', onRefresh); clearInterval(interval); };
  }, [refresh, state.user?.id]);

  useEffect(() => {
    if (!state.ready) return;
    const serialized = JSON.stringify({ version: 1, locale: state.locale, currency: state.currency, cart: state.cart, customerId: state.user?.id ?? null });
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== serialized) window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Shopping stays functional in private browsing and storage-quota failures.
    }
  }, [state.ready, state.locale, state.currency, state.cart, state.user?.id]);

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
  const productById = useMemo(() => new Map(state.products.map((product) => [product.id, product])), [state.products]);
  const remaining = useCallback((productId: string, size: string) => remainingStock(state.cart, state.stockUsed, productId, size, productById), [state.cart, state.stockUsed, productById]);
  const value = useMemo<ShopContextValue>(() => ({
    state, dispatch, t, money, remaining, products: state.products, productById, refresh,
    itemCount: state.cart.reduce((count, line) => count + line.quantity, 0),
    cartSubtotal: subtotal(state.cart, state.currency, productById),
  }), [state, t, money, remaining, productById, refresh]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used inside ShopProvider.');
  return context;
}
