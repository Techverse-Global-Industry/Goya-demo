'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { shopRequest } from '@/lib/api';
import { Icon } from './icon';
import { usePathname, useRouter } from 'next/navigation';

interface InstallPrompt extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
const PwaContext = createContext<{ install: () => Promise<void>; installed: boolean; help: boolean; setHelp: (value: boolean) => void; ios: boolean }>({ install: async () => {}, installed: false, help: false, setHelp: () => {}, ios: false });

export function PwaProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  const [ios, setIOS] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)');
    const update = () => setInstalled(standalone.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
    update();
    setIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setHelp(false); };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    standalone.addEventListener('change', update);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    return () => { window.removeEventListener('beforeinstallprompt', beforeInstall); window.removeEventListener('appinstalled', onInstalled); standalone.removeEventListener('change', update); };
  }, []);
  const install = async () => {
    if (prompt) { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }
    else setHelp(true);
  };
  return <PwaContext.Provider value={{ install, installed, help, setHelp, ios }}>{children}</PwaContext.Provider>;
}

export function InstallPanel() {
  const { t } = useShop();
  const { install, installed, help, setHelp, ios } = useContext(PwaContext);
  return <section className="install-panel section-pad"><div className="install-mark" aria-hidden="true">MG</div><div><p className="eyebrow">Maison Goya</p><h2>{t('appTitle')}</h2><p>{t('installDescription')}</p>{help && <p className="install-help" role="status">{t(ios ? 'installIOS' : 'installOther')} <button className="quiet-link" onClick={() => setHelp(false)}>{t('close')}</button></p>}</div><button type="button" className="button button-outline" onClick={install} disabled={installed}>{t(installed ? 'installed' : 'installApp')}<Icon name="download" /></button></section>;
}

function applicationKey(value: string): Uint8Array<ArrayBuffer> {
  const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
export function DeviceSettings() {
  const { state, t } = useShop();
  const { install, installed, ios } = useContext(PwaContext);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const userId = state.user?.id;
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then((registration) => registration.pushManager.getSubscription()).then((subscription) => setEnabled(!!subscription)).catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!enabled || !userId || !state.pushPublicKey || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then((registration) => registration?.pushManager.getSubscription()).then((subscription) => {
      if (subscription) return shopRequest('subscribe', { subscription: subscription.toJSON(), locale: state.locale });
    }).catch(() => undefined);
  }, [enabled, userId, state.pushPublicKey, state.locale]);
  const enable = async () => {
    setMessage('');
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { setMessage(t(ios ? 'installIOS' : 'pushUnsupported')); return; }
    if (ios && !installed) { setMessage(t('installIOS')); return; }
    if (!state.pushPublicKey) { setMessage(t('pushUnconfigured')); return; }
    setBusy(true);
    try {
      if (await Notification.requestPermission() !== 'granted') { setMessage(t('pushDenied')); return; }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(state.pushPublicKey) });
      await shopRequest('subscribe', { subscription: subscription.toJSON(), locale: state.locale });
      setEnabled(true); setMessage(t('pushEnabled'));
    } catch { setMessage(t('requestFailed')); }
    finally { setBusy(false); }
  };
  const disable = async () => {
    setBusy(true); setMessage('');
    try {
      const subscription = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (subscription) { await shopRequest('unsubscribe', { endpoint: subscription.endpoint }); await subscription.unsubscribe(); }
      setEnabled(false);
    } catch { setMessage(t('requestFailed')); }
    finally { setBusy(false); }
  };
  return <div className="device-settings"><h3 className="eyebrow">{t('notifications')}</h3><p>{t('pushIntro')}</p><button type="button" className="button button-outline button-full" disabled={busy} onClick={enabled ? disable : enable}>{t(enabled ? 'disablePush' : 'enablePush')}<Icon name="phone" /></button>{message && <p className="fine-print" role="status">{message}</p>}{!installed && <button type="button" className="quiet-link" onClick={async () => { await install(); setMessage(t(ios ? 'installIOS' : 'installOther')); }}>{t('installApp')}</button>}</div>;
}

export function ConnectionNotice() {
  const { state, t, refresh, dispatch } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const userId = state.user?.id;
  const [started, setStarted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setStarted(true), 3500); return () => clearTimeout(timer); }, []);
  useEffect(() => {
    if (!state.ready) return;
    const query = new URLSearchParams(location.search);
    if (query.has('account')) router.replace('/app/orders');
    const productId = query.get('product');
    if (productId && !location.pathname.startsWith('/app')) { router.replace(`/app/shop?product=${encodeURIComponent(productId)}`); return; }
    if (productId && userId) dispatch({ type: 'open', overlay: { kind: 'quick', productId } });
  }, [state.ready, userId, pathname, dispatch, router]);
  return !state.connected && started ? <div className="connection-notice" role="status"><span>{t('connectionLost')}</span><button type="button" onClick={() => void refresh()}>{t('retry')}</button></div> : null;
}
