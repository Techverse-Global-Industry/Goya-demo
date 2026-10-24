import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CULTURE_STORIES, CULTURE_STORY_BY_SLUG } from '@/lib/culture-stories';
import { CultureStoryPage } from '@/components/storefront-pages';

export function generateStaticParams() { return CULTURE_STORIES.map(story => ({ slug: story.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = CULTURE_STORY_BY_SLUG.get(slug);
  return story ? { title: `${story.title.en} — Maison Goya`, description: story.intro.en } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = CULTURE_STORY_BY_SLUG.get(slug);
  if (!story) notFound();
  return <CultureStoryPage story={story} />;
}
