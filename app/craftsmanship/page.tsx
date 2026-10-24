import type { Metadata } from 'next';
import { CultureStoryPage } from '@/components/storefront-pages';
import { CULTURE_STORIES } from '@/lib/culture-stories';
export const metadata: Metadata = { title: 'Craftsmanship — Maison Goya' };
export default function Page() { return <CultureStoryPage story={CULTURE_STORIES.find(story => story.slug === 'le-geste-et-la-transmission')!} />; }
