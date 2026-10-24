import type { Metadata } from 'next';
import { JournalPage } from '@/components/journal-page';
export const metadata: Metadata = { title: 'The journal — Maison Goya' };
export default function Page() { return <JournalPage />; }
