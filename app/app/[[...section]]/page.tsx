import { notFound, redirect } from 'next/navigation';
import { sessionUser } from '@/lib/server/security';
import CustomerWorkspace, { type Section } from '@/components/customer-workspace';

const sections: Record<string, Section> = { '': 'accountOverview', shop: 'collection', orders: 'myOrders', atelier: 'myAppointments', updates: 'myUpdates', settings: 'myDetails' };
export default async function CustomerPage({ params, searchParams }: { params: Promise<{ section?: string[] }>; searchParams: Promise<{ product?: string }> }) {
  const { section = [] } = await params;
  const key = section.join('/');
  if (!(Object.hasOwn(sections, key))) notFound();
  const { product } = await searchParams;
  const destination = `/app${key ? `/${key}` : ''}${product ? `?product=${encodeURIComponent(product)}` : ''}`;
  const user = await sessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(destination)}`);
  if (user.role === 'admin') redirect('/admin');
  return <CustomerWorkspace section={sections[key]} />;
}
