'use client';

import { Auth } from './auth';
import { Header } from './header';
import { Footer } from './editorial';
import { Overlays } from './overlays';
import { Toast } from './controls';

export function CustomerLogin({ destination, initialMode = 'login' }: { destination: string; initialMode?: 'login' | 'register' }) {
  return <><Header /><main id="account-content" className="reference-account-entry exact-account-entry"><section className="reference-account-panels"><div className="reference-account-form"><Auth key={initialMode} destination={destination} initialMode={initialMode} /></div></section></main><Footer /><Overlays /><Toast /></>;
}
