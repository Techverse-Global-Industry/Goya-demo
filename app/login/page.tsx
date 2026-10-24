import { redirect } from 'next/navigation';
import { sessionUser } from '@/lib/server/security';
import { CustomerLogin } from '@/components/customer-login';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const { next, mode } = await searchParams;
  const destination = next && /^\/(?:app(?:\/(?:shop|orders|atelier|updates|settings))?(?:\?product=[a-zA-Z0-9%-]+)?|checkout|bag|wishlist|product\/[a-zA-Z0-9-]+)$/.test(next) ? next : '/app';
  const user = await sessionUser();
  if (user) redirect(user.role === 'admin' ? '/admin' : destination);
  return <CustomerLogin destination={destination} initialMode={mode === 'register' ? 'register' : 'login'} />;
}
