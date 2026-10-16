export class RequestError extends Error {
  constructor(message: string, public code: string, public status: number) { super(message); }
}
export async function shopRequest<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  let subscription: PushSubscription | null = null;
  if (action === 'logout' && 'serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.getRegistration();
    subscription = await registration?.pushManager.getSubscription() ?? null;
    if (subscription) body = { ...body, endpoint: subscription.endpoint };
  }
  const response = await fetch('/api/shop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, action }) });
  const data = await response.json();
  if (!response.ok) throw new RequestError(data.error || 'Please try again.', data.code, response.status);
  if (subscription) await subscription.unsubscribe().catch(() => undefined);
  window.dispatchEvent(new Event('maison:refresh'));
  if ('BroadcastChannel' in window) { const channel = new BroadcastChannel('maison-shop'); channel.postMessage('refresh'); channel.close(); }
  return data as T;
}
